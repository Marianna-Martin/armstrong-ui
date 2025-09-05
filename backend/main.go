package main

import (
	"database/sql"
	"fmt"
	"log"
	"math"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	_ "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
)

var db *sql.DB

// User struct
type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// ArmstrongNumber struct
type ArmstrongNumber struct {
	ID        int    `json:"id"`
	UserID    string `json:"user_id"`
	Number    int    `json:"number"`
	CreatedAt string `json:"created_at"`
}

func main() {
	var err error

	// Update with your MySQL credentials
	dsn := "root:tree@tcp(localhost:3306)/armstrongdb?charset=utf8mb4&parseTime=True&loc=Local"
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Failed to connect to DB:", err)
	}
	defer db.Close()

	// Test DB connection
	if err := db.Ping(); err != nil {
		log.Fatal("Database unreachable:", err)
	}

	router := gin.Default()

	// CORS middleware for armstrong-ui frontend (React running on localhost:3000)
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET,POST")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}
		c.Next()
	})

	// Routes with consistent :id parameter
	router.POST("/users", registerUser)
	router.GET("/users/:id", getUser)
	router.POST("/users/:id/verify", verifyArmstrong)
	router.GET("/users/:id/armstrong", getUserArmstrongs)
	router.GET("/all-users", getAllUsers)

	fmt.Println("🚀 Server running on http://localhost:8080")
	router.Run(":8080")
}

// Register user
func registerUser(c *gin.Context) {
	var input struct {
		Email string `json:"email"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if input.Email == "" || !contains(input.Email, "@") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valid email required"})
		return
	}

	id := uuid.New().String()
	_, err := db.Exec("INSERT INTO users (id, email) VALUES (?, ?)", id, input.Email)
	if err != nil {
		// Check for duplicate email error (MySQL error code 1062)
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": id, "email": input.Email})
}

// Get user info
func getUser(c *gin.Context) {
	id := c.Param("id")
	var user User
	err := db.QueryRow("SELECT id, email FROM users WHERE id = ?", id).
		Scan(&user.ID, &user.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		}
		return
	}
	c.JSON(http.StatusOK, user)
}

// Verify and store Armstrong number
func verifyArmstrong(c *gin.Context) {
	var input struct {
		Number int `json:"number"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if input.Number <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Number must be positive"})
		return
	}

	userID := c.Param("id")
	// Verify user exists
	var exists int
	err := db.QueryRow("SELECT COUNT(*) FROM users WHERE id = ?", userID).Scan(&exists)
	if err != nil || exists == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if isArmstrong(input.Number) {
		_, err := db.Exec("INSERT INTO armstrong_numbers (user_id, number) VALUES (?, ?)", userID, input.Number)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save Armstrong number"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"is_armstrong": true, "message": "Armstrong number saved"})
	} else {
		c.JSON(http.StatusOK, gin.H{"is_armstrong": false, "message": "Not an Armstrong number"})
	}
}

// Get all Armstrong numbers for a user
func getUserArmstrongs(c *gin.Context) {
	userID := c.Param("id")
	rows, err := db.Query("SELECT id, user_id, number, created_at FROM armstrong_numbers WHERE user_id = ?", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch Armstrong numbers"})
		return
	}
	defer rows.Close()

	var numbers []ArmstrongNumber
	for rows.Next() {
		var num ArmstrongNumber
		if err := rows.Scan(&num.ID, &num.UserID, &num.Number, &num.CreatedAt); err != nil {
			continue
		}
		numbers = append(numbers, num)
	}

	c.JSON(http.StatusOK, numbers)
}

// Get all users with their Armstrong numbers
func getAllUsers(c *gin.Context) {
	pageStr := c.Query("page")
	limitStr := c.Query("limit")
	page, _ := strconv.Atoi(pageStr)
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(limitStr)
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	rows, err := db.Query("SELECT id, email FROM users LIMIT ? OFFSET ?", limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Email); err != nil {
			continue
		}
		users = append(users, user)
	}

	// Return users with their Armstrong numbers
	result := make([]map[string]interface{}, len(users))
	for i, user := range users {
		armRows, _ := db.Query("SELECT id, user_id, number, created_at FROM armstrong_numbers WHERE user_id = ?", user.ID)
		var arms []ArmstrongNumber
		for armRows.Next() {
			var arm ArmstrongNumber
			if err := armRows.Scan(&arm.ID, &arm.UserID, &arm.Number, &arm.CreatedAt); err != nil {
				continue
			}
			arms = append(arms, arm)
		}
		armRows.Close()
		result[i] = map[string]interface{}{
			"user": user,
			"arms": arms,
		}
	}

	c.JSON(http.StatusOK, result)
}

// Check if string contains substring
func contains(str, substr string) bool {
	for i := 0; i <= len(str)-len(substr); i++ {
		if str[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

// Check Armstrong
func isArmstrong(num int) bool {
	sum, temp, n := 0, num, 0
	for temp != 0 {
		n++
		temp /= 10
	}
	temp = num
	for temp != 0 {
		digit := temp % 10
		sum += int(math.Pow(float64(digit), float64(n)))
		temp /= 10
	}
	return sum == num
}
