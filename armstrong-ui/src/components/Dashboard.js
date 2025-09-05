import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [number, setNumber] = useState('');
  const [arms, setArms] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Initialize as empty array
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) fetchUserArms();
    fetchAllUsers();
  }, [userId, page]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Enter a valid email');
      return;
    }
    try {
      const res = await axios.post('http://localhost:8080/users', { email });
      setMessage(`Registered! User ID: ${res.data.id}. Save this ID.`);
      setError('');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      setMessage('');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!userId || isNaN(number) || number <= 0) {
      setError('Enter valid User ID and positive number');
      return;
    }
    try {
      const res = await axios.post(`http://localhost:8080/users/${userId}/verify`, { number: parseInt(number) });
      setMessage(res.data.message);
      setError('');
      if (res.data.is_armstrong) fetchUserArms();
      setNumber('');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
      setMessage('');
    }
  };

  const fetchUserArms = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/users/${userId}/armstrong`);
      setArms(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      setError('Failed to load numbers: ' + (err.response?.data?.error || err.message));
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/all-users?page=${page}&limit=5`);
      console.log('fetchAllUsers response:', res.data); // Debug log
      setAllUsers(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      console.error('fetchAllUsers error:', err); // Debug log
      setError('Failed to load users: ' + (err.response?.data?.error || err.message));
      setAllUsers([]); // Ensure allUsers is an array
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p className="description">An Armstrong number equals the sum of its digits raised to the power of the number of digits (e.g., 153 = 1³ + 5³ + 3³).</p>
      <div className="grid">
        {/* Register */}
        <div className="card">
          <h3>Register</h3>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit">Register</button>
          </form>
        </div>
        {/* Verify */}
        <div className="card">
          <h3>Verify Armstrong Number</h3>
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Number</label>
              <input
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
            </div>
            <button type="submit">Verify & Save</button>
          </form>
        </div>
      </div>
      {/* Messages */}
      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}
      {/* User Numbers */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h3>Your Armstrong Numbers</h3>
        {arms.length === 0 ? (
          <p>No numbers yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {arms.map(arm => (
                <tr key={arm.id}>
                  <td>{arm.number}</td>
                  <td>{arm.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* All Users */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h3>All Users</h3>
        {!Array.isArray(allUsers) || allUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          allUsers.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <h4 style={{ fontWeight: '500' }}>
                User: {item.user?.email || 'Unknown'} (ID: {item.user?.id || 'Unknown'})
              </h4>
              {!Array.isArray(item.arms) || item.arms.length === 0 ? (
                <p>No Armstrong numbers.</p>
              ) : (
                <table style={{ marginTop: '8px' }}>
                  <thead>
                    <tr>
                      <th>Number</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.arms.map(arm => (
                      <tr key={arm.id}>
                        <td>{arm.number}</td>
                        <td>{arm.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}
        <div className="pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>{page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;