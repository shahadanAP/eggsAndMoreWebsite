import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-page" style={{
      textAlign: 'center',
      padding: '50px',
      minHeight: '60vh'
    }}>
      <h1 style={{ fontSize: '4rem', color: 'var(--accent-color)' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ margin: '20px 0', fontSize: '1.2rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: 'var(--accent-color)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          marginTop: '20px'
        }}
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;