Armstrong Number App

This is a full-stack web application to register users, verify Armstrong numbers, and manage them. It uses a Go (Gin) backend with MySQL and a React frontend with plain CSS.
Setup Instructions
1. Clone the Repository
git clone https://github.com/your-username/armstrong-ui.git
cd armstrong-ui

2. Backend Setup

Navigate to Backend:
cd backend


Install Dependencies:
go mod tidy


Configure MySQL:

Update main.go with your MySQL password:
dsn := "root:YOUR_PASSWORD@tcp(localhost:3306)/armstrongdb?charset=utf8mb4&parseTime=True&loc=Local"


Run SQL to create database:
mysql -u root -p < db/setup.sql




Run Backend:
go run main.go

Server runs on http://localhost:8080.


3. Frontend Setup

Navigate to Frontend:
cd frontend


Install Dependencies:
npm install


Run Frontend:
npm start

App runs on http://localhost:3000.


4. Testing

Open http://localhost:3000.

Register: Enter an email (e.g., test11@example.com). Copy the UUID.

Verify Armstrong Number: Use the UUID and a number (e.g., 153).

View Results: Check “Your Armstrong Numbers” and “All Users” sections.

API Testing:
curl -X POST http://localhost:8080/users -H "Content-Type: application/json" -d '{"email":"test11@example.com"}'
curl http://localhost:8080/all-users?page=1&limit=5



Troubleshooting

“User not found”: Ensure the user ID matches a registered user’s UUID (SELECT * FROM users;).

Network Errors: Verify backend is running and CORS allows http://localhost:3000.

Database Issues: Check armstrongdb schema and drop/recreate if needed:
DROP DATABASE armstrongdb;

Then re-run setup.sql.

