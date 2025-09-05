// frontend/src/components/Verify.js
import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Card } from 'react-bootstrap';

function Verify() {
  const [userId, setUserId] = useState('');
  const [number, setNumber] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!userId || isNaN(number) || number <= 0) {
      setError('Enter valid user ID and positive number');
      return;
    }
    try {
      const res = await axios.post(`http://localhost:8080/users/${userId}/verify`, { number: parseInt(number) });
      setResult(res.data.message);
      setError('');
    } catch (err) {
      setError('Error: ' + (err.response?.data?.error || err.message));
      setResult('');
    }
  };

  return (
    <Card className="shadow">
      <Card.Body>
        <h2>Verify Armstrong Number</h2>
        <Form onSubmit={handleVerify}>
          <Form.Group className="mb-3">
            <Form.Label>User ID (from registration)</Form.Label>
            <Form.Control type="text" value={userId} onChange={(e) => setUserId(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Number</Form.Label>
            <Form.Control type="number" value={number} onChange={(e) => setNumber(e.target.value)} required />
          </Form.Group>
          <Button variant="primary" type="submit">Verify & Save</Button>
        </Form>
        {result && <Alert variant="success" className="mt-3">{result}</Alert>}
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </Card.Body>
    </Card>
  );
}

export default Verify;