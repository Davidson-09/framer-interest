# Pinterest Integration SDK

A client-side SDK for integrating with the Pinterest API service without requiring script tags in HTML.

## Installation

### Using npm

```bash
npm install pinterest-integration-sdk
```

### Using yarn

```bash
yarn add pinterest-integration-sdk
```

### Using CDN

```html
<script src="https://cdn.jsdelivr.net/npm/pinterest-integration-sdk@1.0.0/pinterest-sdk.min.js"></script>
```

## Usage

### ES Modules

```javascript
import PinterestSDK from 'pinterest-integration-sdk';

const pinterest = new PinterestSDK({
  apiBaseUrl: 'https://framer-interest.vercel.app', // Replace with your actual service URL
});

// Initialize the SDK
await pinterest.init();
```

### CommonJS

```javascript
const PinterestSDK = require('pinterest-integration-sdk');

const pinterest = new PinterestSDK({
  apiBaseUrl: 'https://framer-interest.vercel.app', // Replace with your actual service URL
});

// Initialize the SDK
pinterest.init().then(() => {
  // SDK initialized
});
```

### Browser

```html
<script src="https://cdn.jsdelivr.net/npm/pinterest-integration-sdk@1.0.0/pinterest-sdk.min.js"></script>
<script>
  const pinterest = new PinterestSDK({
    apiBaseUrl: 'https://framer-interest.vercel.app', // Replace with your actual service URL
  });

  // Initialize the SDK
  pinterest.init().then(() => {
    // SDK initialized
  });
</script>
```

## API Reference

### Constructor

```javascript
const pinterest = new PinterestSDK(config);
```

#### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiBaseUrl` | String | 'https://framer-interest.vercel.app' | The base URL of your Pinterest API service |
| `pinterestTokenCookieName` | String | 'pinterest_token' | The name of the cookie that stores the Pinterest token |

### Methods

#### `init()`

Initialize the Pinterest SDK.

```javascript
const isInitialized = await pinterest.init();
```

#### `login(returnUrl)`

Login with Pinterest.

```javascript
// Login and return to the current page
pinterest.login();

// Login and return to a specific URL
pinterest.login('https://example.com/callback');
```

#### `handleCallback(redirectSuccess, redirectFailure)`

Handle the callback from Pinterest authentication. This method checks if the Pinterest token cookie exists, and redirects the user accordingly.

```javascript
// Handle callback with default redirects
// Success: /dashboard
// Failure: /login?error=pinterest_auth_failed
pinterest.handleCallback();

// Handle callback with custom redirects
pinterest.handleCallback('/home', '/login');
```

#### `isUserAuthenticated()`

Check if the user is authenticated with Pinterest.

```javascript
const isAuthenticated = pinterest.isUserAuthenticated();
```

#### `verifyAuthentication(accessToken)`

Verify if the user is authenticated with Pinterest. You can optionally provide an access token to use instead of the cookie.

```javascript
// Verify using the cookie (default)
const isAuthenticated = await pinterest.verifyAuthentication();

// Verify using an access token
const accessToken = 'your-pinterest-access-token';
const isAuthenticated = await pinterest.verifyAuthentication(accessToken);
```

#### `fetchPins(accessToken)`

Fetch pins from the Pinterest API. You can optionally provide an access token to use instead of the cookie.

```javascript
try {
  // Fetch pins using the cookie (default)
  const pins = await pinterest.fetchPins();
  console.log('Pins:', pins);

  // Or fetch pins using an access token
  const accessToken = 'your-pinterest-access-token';
  const pins = await pinterest.fetchPins(accessToken);
  console.log('Pins:', pins);
} catch (error) {
  console.error('Error fetching pins:', error);
}
```

## Examples

### Main Page Example

```javascript
import PinterestSDK from 'pinterest-integration-sdk';

// Initialize the SDK
const pinterest = new PinterestSDK({
  apiBaseUrl: 'https://framer-interest.vercel.app',
});

// Check if the user is authenticated
pinterest.init().then(async () => {
  const isAuthenticated = pinterest.isUserAuthenticated();

  if (isAuthenticated) {
    // Fetch pins
    try {
      const pins = await pinterest.fetchPins();

      // Do something with the pins
      console.log('Pins:', pins);

      // Example: Render pins to a container
      const container = document.getElementById('pinterest-pins');
      pins.forEach(pin => {
        const pinElement = document.createElement('div');
        pinElement.className = 'pinterest-pin';

        // Create pin content
        pinElement.innerHTML = `
          <div class="pinterest-pin-image">
            ${pin.media?.images?.["600x"]?.url ?
              `<img src="${pin.media.images["600x"].url}" alt="${pin.title || 'Pinterest Pin'}">` :
              '<div class="pinterest-pin-no-image">No image</div>'}
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
  } else {
    // Show login button
    const loginButton = document.getElementById('pinterest-login-btn');
    loginButton.style.display = 'block';
    loginButton.addEventListener('click', () => {
      pinterest.login();
    });
  }
});
```

### Callback Page Example

Create a separate callback page to handle the Pinterest authentication callback:

```javascript
import PinterestSDK from 'pinterest-integration-sdk';

// Initialize the SDK
const pinterest = new PinterestSDK({
  apiBaseUrl: 'https://framer-interest.vercel.app',
});

// Handle the callback
document.addEventListener('DOMContentLoaded', () => {
  // This will check for the Pinterest token cookie and redirect accordingly
  // - If authenticated: redirects to '/dashboard'
  // - If not authenticated: redirects to '/login?error=pinterest_auth_failed'
  pinterest.handleCallback();

  // You can also specify custom redirect URLs:
  // pinterest.handleCallback('/home', '/login');
});
```

### Using Access Token Instead of Cookies

If you prefer not to use cookies or are working in an environment where cookies are not available, you can use the access token directly:

```javascript
import PinterestSDK from 'pinterest-integration-sdk';

// Initialize the SDK
const pinterest = new PinterestSDK({
  apiBaseUrl: 'https://framer-interest.vercel.app',
});

// Example function to use access token instead of cookies
async function fetchPinsWithToken(accessToken) {
  try {
    // Verify the token is valid
    const isAuthenticated = await pinterest.verifyAuthentication(accessToken);

    if (isAuthenticated) {
      // Fetch pins using the access token
      const pins = await pinterest.fetchPins(accessToken);
      console.log('Pins:', pins);

      // Do something with the pins
      renderPins(pins);
    } else {
      console.error('Invalid or expired access token');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage
const accessToken = 'your-pinterest-access-token';
fetchPinsWithToken(accessToken);
```

## License

MIT
