// frontend/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Card } from 'react-bootstrap';

function Register() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Invalid email');
      return;
    }
    try {
      const res = await axios.post('http://localhost:8080/users', { email });
      setMessage(`User created! ID: ${res.data.id}. Save this ID for use.`);
      setError('');
    } catch (err) {
      setError('Failed to register: ' + (err.response?.data?.error || err.message));
      setMessage('');
    }
  };

  return (
    <Card className="shadow">
      <Card.Body>
        <h2>Register</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Form.Group>
          <Button variant="primary" type="submit">Register</Button>
        </Form>
        {message && <Alert variant="success" className="mt-3">{message}</Alert>}
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </Card.Body>
    </Card>
  );
}

export default Register;