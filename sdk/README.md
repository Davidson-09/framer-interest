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

#### `isUserAuthenticated()`

Check if the user is authenticated with Pinterest.

```javascript
const isAuthenticated = pinterest.isUserAuthenticated();
```

#### `verifyAuthentication()`

Verify if the user is authenticated with Pinterest.

```javascript
const isAuthenticated = await pinterest.verifyAuthentication();
```

#### `fetchPins()`

Fetch pins from the Pinterest API.

```javascript
try {
  const pins = await pinterest.fetchPins();
  console.log('Pins:', pins);
} catch (error) {
  console.error('Error fetching pins:', error);
}
```

## Example

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

## License

MIT
