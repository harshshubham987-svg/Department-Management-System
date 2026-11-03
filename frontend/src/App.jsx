import React, { useState, useEffect } from 'react';

function App() {
  const [backendMessage, setBackendMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Backend server (port 5000) par GET request bhejna
    fetch('http://localhost:5000/')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setBackendMessage(data.message);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error connecting to backend:', err);
        setError('Failed to connect to backend server.');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Department Management System</h1>
      <h2>Backend Connectivity Status</h2>
      
      {loading && <p>Connecting to backend...</p>}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {backendMessage && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#e6ffed', display: 'inline-block', borderRadius: '5px', border: '1px solid #b7eb8f' }}>
          <p style={{ color: '#52c41a', fontWeight: 'bold', fontSize: '18px' }}>
            {backendMessage}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;