import React, { useEffect } from 'react';
import PinterestSDK from 'pinterest-integration-sdk';

// Initialize the SDK
const pinterest = new PinterestSDK({
  apiBaseUrl: 'https://framer-interest.vercel.app', // Replace with your actual service URL
});

function PinterestCallback() {
  useEffect(() => {
    // Handle the callback when the component mounts
    // This will check for the Pinterest token cookie and redirect accordingly
    pinterest.handleCallback('/dashboard', '/login');
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Processing Pinterest Authentication</h2>
      <p>Please wait while we process your authentication...</p>
      <div className="spinner" style={{
        display: 'inline-block',
        width: '40px',
        height: '40px',
        border: '4px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '50%',
        borderTopColor: '#e60023',
        animation: 'spin 1s ease-in-out infinite'
      }}></div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PinterestCallback;
