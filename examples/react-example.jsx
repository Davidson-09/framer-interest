import React, { useEffect, useState } from 'react';
import PinterestSDK from 'pinterest-integration-sdk';

// Initialize the SDK
const pinterest = new PinterestSDK({
  apiBaseUrl: 'https://framer-interest.vercel.app', // Replace with your actual service URL
});

function PinterestIntegration() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize the SDK
    async function initPinterest() {
      try {
        await pinterest.init();
        const authenticated = pinterest.isUserAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          await fetchPins();
        }
      } catch (err) {
        setError('Failed to initialize Pinterest SDK');
        console.error('Error initializing Pinterest SDK:', err);
      } finally {
        setLoading(false);
      }
    }

    initPinterest();
  }, []);

  async function fetchPins() {
    try {
      setLoading(true);
      const pinsData = await pinterest.fetchPins();
      setPins(pinsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pins');
      console.error('Error fetching pins:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogin() {
    pinterest.login(window.location.href);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h2>Pinterest Integration</h2>
        <p>You need to log in with Pinterest to view your pins.</p>
        <button onClick={handleLogin}>Login with Pinterest</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Your Pinterest Pins</h2>
      {pins.length === 0 ? (
        <p>No pins found.</p>
      ) : (
        <div className="pinterest-pins-grid">
          {pins.map(pin => (
            <div key={pin.id} className="pinterest-pin">
              {pin.media?.images?.["600x"]?.url && (
                <div className="pinterest-pin-image">
                  <img 
                    src={pin.media.images["600x"].url} 
                    alt={pin.title || 'Pinterest Pin'} 
                  />
                </div>
              )}
              <div className="pinterest-pin-content">
                <h3>{pin.title || 'Untitled'}</h3>
                <p>{pin.description || ''}</p>
                {pin.link && (
                  <a 
                    href={pin.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Visit
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PinterestIntegration;
