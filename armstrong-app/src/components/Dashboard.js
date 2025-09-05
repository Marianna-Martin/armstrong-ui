// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Form, Alert, Card } from 'react-bootstrap';

function Dashboard() {
  const [userId, setUserId] = useState('');
  const [arms, setArms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) {
      fetchArms();
    }
  }, [userId]);

  const fetchArms = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/users/${userId}/arms`);
      setArms(res.data);
      setError('');
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  return (
    <Card className="shadow">
      <Card.Body>
        <h2>My Armstrong Numbers</h2>
        <Form.Group className="mb-3">
          <Form.Label>Enter User ID</Form.Label>
          <Form.Control type="text" value={userId} onChange={(e) => setUserId(e.target.value)} />
        </Form.Group>
        {error && <Alert variant="danger">{error}</Alert>}
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Number</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {arms.map(arm => (
              <tr key={arm.id}>
                <td>{arm.id}</td>
                <td>{arm.number}</td>
                <td>{arm.created_at}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {arms.length === 0 && <p>No Armstrong numbers yet.</p>}
      </Card.Body>
    </Card>
  );
}

export default Dashboard;