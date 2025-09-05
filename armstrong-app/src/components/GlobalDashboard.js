// frontend/src/components/GlobalDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Pagination, Card } from 'react-bootstrap';

function GlobalDashboard() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Approximate, since no total count from API, but for demo

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/all-users?page=${page}&limit=10`);
      setData(res.data);
      // For simplicity, assume total pages ~10; in real, add count endpoint
      setTotalPages(10);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="shadow">
      <Card.Body>
        <h2>Global Users and Armstrong Numbers</h2>
        {data.map((item, idx) => (
          <div key={idx} className="mb-4">
            <h5>User: {item.user.email} (ID: {item.user.id})</h5>
            <Table striped bordered hover responsive size="sm">
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
            </Table>
          </div>
        ))}
        <Pagination>
          <Pagination.Prev onClick={() => setPage(Math.max(1, page - 1))} />
          <Pagination.Item active>{page}</Pagination.Item>
          <Pagination.Next onClick={() => setPage(page + 1)} />
        </Pagination>
      </Card.Body>
    </Card>
  );
}

export default GlobalDashboard;