import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [number, setNumber] = useState("");
  const [result, setResult] = useState("");
  const [myNumbers, setMyNumbers] = useState([]);
  const [allUsers, setAllUsers] = useState({});

  // Register User
  const registerUser = async () => {
    try {
      await axios.post("http://localhost:8080/register", { email });
      alert("User registered successfully!");
    } catch {
      alert("Error: Email may already exist.");
    }
  };

  // Verify Armstrong Number
  const verifyNumber = async () => {
    try {
      const res = await axios.post("http://localhost:8080/verify", {
        user_id: userId,
        number: parseInt(number),
      });
      setResult(res.data.message);
      loadMyNumbers();
    } catch {
      setResult("Error verifying number.");
    }
  };

  // Load User's Armstrong Numbers
  const loadMyNumbers = async () => {
    if (userId) {
      const res = await axios.get(`http://localhost:8080/user/${userId}/armstrong`);
      setMyNumbers(res.data);
    }
  };

  // Load All Users
  const loadAllUsers = async () => {
    const res = await axios.get("http://localhost:8080/users");
    setAllUsers(res.data);
  };

  useEffect(() => {
    loadAllUsers();
  }, []);

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      <h1 style={{ color: "#0077cc" }}>🌟 Armstrong Number App</h1>

      {/* User Registration */}
      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h2>Register</h2>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={registerUser}>Register</button>
      </div>

      {/* Armstrong Verification */}
      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h2>Verify Armstrong Number</h2>
        <input
          type="number"
          placeholder="User ID"
          value={userId || ""}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Enter number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <button onClick={verifyNumber}>Verify</button>
        <p>{result}</p>
      </div>

      {/* User Dashboard */}
      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h2>My Armstrong Numbers</h2>
        <button onClick={loadMyNumbers}>Load My Numbers</button>
        <ul>
          {myNumbers.map((n) => (
            <li key={n.id}>{n.number}</li>
          ))}
        </ul>
      </div>

      {/* Global Dashboard */}
      <div style={{ padding: "10px", border: "1px solid #ccc" }}>
        <h2>All Users & Their Armstrong Numbers</h2>
        <button onClick={loadAllUsers}>Refresh</button>
        <ul>
          {Object.keys(allUsers).map((user) => (
            <li key={user}>
              <b>{user}</b>: {allUsers[user].join(", ")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

