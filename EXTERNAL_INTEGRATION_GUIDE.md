# External Integration Guide for Pinterest Authentication and API

This guide explains how to integrate your external website with our Pinterest authentication and API services.

## Overview

Our service provides:
1. Pinterest OAuth authentication
2. API endpoints to fetch Pinterest boards and pins

## Integration Options

We offer two ways to integrate with our Pinterest service:

1. **SDK Integration (Recommended)**: Use our JavaScript SDK to easily integrate Pinterest functionality
2. **Direct API Integration**: Make direct API calls to our endpoints

## Authentication Options

We support two methods for authentication:

1. **Cookie-based Authentication (Default)**: The Pinterest access token is stored in a cookie
2. **Query Parameter Authentication**: The Pinterest access token is passed as a query parameter

## Prerequisites

- Your external site must be able to make cross-origin requests
- You need to register your domain with us to enable CORS

## SDK Integration (Recommended)

### 1. Install the SDK

You can install our Pinterest SDK using npm, yarn, or include it directly via CDN.

#### Using npm

```bash
npm install pinterest-integration-sdk
```

#### Using yarn

```bash
yarn add pinterest-integration-sdk
```

#### Using CDN

```html
<script src="https://cdn.jsdelivr.net/npm/pinterest-integration-sdk@1.0.0/pinterest-sdk.min.js"></script>
```

### 2. Initialize the SDK

```javascript
// ES Modules
import PinterestSDK from 'pinterest-integration-sdk';

// CommonJS
// const PinterestSDK = require('pinterest-integration-sdk');

// Create a new instance
const pinterest = new PinterestSDK({
  apiBaseUrl: 'https://framer-interest.vercel.app', // Replace with your actual service URL
});

// Initialize the SDK
async function initPinterest() {
  try {
    await pinterest.init();
    const isAuthenticated = pinterest.isUserAuthenticated();

    if (isAuthenticated) {
      // User is already authenticated, fetch pins
      const pins = await pinterest.fetchPins();
      console.log('Pins:', pins);
      // Render pins on your page
      renderPins(pins);
    } else {
      // Show login button
      showLoginButton();
    }
  } catch (error) {
    console.error('Error initializing Pinterest SDK:', error);
  }
}

// Call the initialization function
initPinterest();
```

### 3. Authenticate Users

When a user wants to log in with Pinterest, use the SDK's login method:

```javascript
function handleLogin() {
  // This will redirect to Pinterest for authentication
  // and return to the current page after authentication
  pinterest.login(window.location.href);
}

// Add click event to your login button
document.getElementById('pinterest-login-btn').addEventListener('click', handleLogin);
```

### 4. Fetch and Display Pins

Once authenticated, you can fetch pins using the SDK:

```javascript
async function fetchAndDisplayPins() {
  try {
    // Fetch pins
    const pins = await pinterest.fetchPins();

    // Display pins
    const container = document.getElementById('pinterest-pins');

    // Clear container
    container.innerHTML = '';

    // Render pins
    pins.forEach(pin => {
      const pinElement = document.createElement('div');
      pinElement.className = 'pinterest-pin';

      const imageUrl = pin.media?.images?.["600x"]?.url;

      pinElement.innerHTML = `
        <div class="pinterest-pin-image">
          ${imageUrl ? `<img src="${imageUrl}" alt="${pin.title || 'Pinterest Pin'}">` : ''}
        </div>
        <div class="pinterest-pin-content">
          <h3>${pin.title || 'Untitled'}</h3>
          <p>${pin.description || ''}</p>
          ${pin.link ? `<a href="${pin.link}" target="_blank" rel="noopener noreferrer">Visit</a>` : ''}
        </div>
      `;

      container.appendChild(pinElement);
    });
  } catch (error) {
    console.error('Error fetching pins:', error);
  }
}
```

## Direct API Integration

If you prefer to integrate directly with our API endpoints without using the SDK, you can follow these steps:

### 1. Authentication Flow

#### Step 1: Redirect to Login

When a user wants to log in with Pinterest, redirect them to our login endpoint:

```javascript
function loginWithPinterest() {
  // The returnTo parameter should be your callback URL on your site
  const returnUrl = encodeURIComponent('https://infam.framer.website/moodboard-1');
  window.location.href = 'https://framer-interest.vercel.app/api/auth/login?returnTo=' + returnUrl;
}
```

#### Step 2: Handle the Callback

After authentication, the user will be redirected back to your site with the access token in a cookie. The cookie will be set with:
- `SameSite=none`
- `Secure=true`
- `httpOnly=false` (to allow JavaScript access)

Create a callback page on your site to handle the redirect:

```javascript
// On your callback page (e.g., /pinterest-callback)
function handlePinterestCallback() {
  // Check if the pinterest_token cookie exists
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  const tokenValue = getCookie('pinterest_token');

  if (tokenValue) {
    // User is authenticated
    console.log('Pinterest authentication successful');
    // Redirect to your app's main page or dashboard
    window.location.href = '/dashboard';
  } else {
    // Authentication failed
    console.error('Pinterest authentication failed');
    // Redirect to login page or show error
    window.location.href = '/login?error=pinterest_auth_failed';
  }
}

// Call this function when the callback page loads
window.onload = handlePinterestCallback;
```

### 2. Verifying Authentication

Before making API requests, you can verify if the user is authenticated. You can use either cookie-based authentication or pass the access token as a query parameter:

#### Using Cookies (Default)

```javascript
async function verifyAuthenticationWithCookie() {
  try {
    const response = await fetch('https://framer-interest.vercel.app/api/auth/verify', {
      method: 'GET',
      credentials: 'include', // Important for sending cookies
    });

    const data = await response.json();
    return data.isAuthenticated;
  } catch (error) {
    console.error('Error verifying authentication:', error);
    return false;
  }
}
```

#### Using Query Parameter

```javascript
async function verifyAuthenticationWithToken(accessToken) {
  try {
    const response = await fetch(`https://framer-interest.vercel.app/api/auth/verify?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'GET',
      // No need for credentials: 'include' when using query parameter
    });

    const data = await response.json();
    return data.isAuthenticated;
  } catch (error) {
    console.error('Error verifying authentication:', error);
    return false;
  }
}
```

### 3. Fetching Pins

Once authenticated, you can fetch pins from our API. You can use either cookie-based authentication or pass the access token as a query parameter:

#### Using Cookies (Default)

```javascript
async function fetchPinsWithCookie() {
  try {
    // The credentials: 'include' is crucial to send cookies in cross-origin requests
    const response = await fetch('https://framer-interest.vercel.app/api/getPins', {
      method: 'GET',
      credentials: 'include', // Important for sending cookies
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pins');
    }

    const data = await response.json();
    return data.pins;
  } catch (error) {
    console.error('Error fetching pins:', error);
    return [];
  }
}
```

#### Using Query Parameter

```javascript
async function fetchPinsWithToken(accessToken) {
  try {
    const response = await fetch(`https://framer-interest.vercel.app/api/getPins?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'GET',
      // No need for credentials: 'include' when using query parameter
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pins');
    }

    const data = await response.json();
    return data.pins;
  } catch (error) {
    console.error('Error fetching pins:', error);
    return [];
  }
}
```

## Security Considerations

1. **CORS**: Our API is configured to accept requests only from registered domains.
2. **Cookies**: The Pinterest token is stored in a cookie with appropriate security settings.
3. **Token Expiration**: The Pinterest token expires after 24 hours.

## Troubleshooting

### Common Issues

1. **Cookie Not Set**: Ensure your browser accepts third-party cookies.
2. **CORS Errors**: Make sure your domain is registered with our service.
3. **Authentication Failures**: Check if the user has granted the required permissions.

### Support

If you encounter any issues, please contact us at support@framer-interest.vercel.app.
