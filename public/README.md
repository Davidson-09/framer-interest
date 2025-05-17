# Pinterest Integration for External Sites

This package provides an easy way to integrate Pinterest authentication and pin display on your external website.

## Quick Start

1. Include the script in your HTML:

```html
<script src="https://your-pinterest-service.com/pinterest-integration.js"></script>
```

2. Add the necessary HTML elements:

```html
<button id="pinterest-login-btn">Login with Pinterest</button>
<button id="pinterest-load-btn" style="display: none;">Load My Pins</button>
<div id="pinterest-loading">Loading pins...</div>
<div id="pinterest-error"></div>
<div id="pinterest-pins"></div>
```

3. Initialize and use the integration:

```javascript
// Initialize with your configuration
const pinterest = new PinterestIntegration({
  apiBaseUrl: 'https://your-pinterest-service.com',
  containerSelector: '#pinterest-pins',
  loadingSelector: '#pinterest-loading',
  errorSelector: '#pinterest-error'
});

// Handle login button click
document.getElementById('pinterest-login-btn').addEventListener('click', () => {
  pinterest.login(window.location.href);
});

// Handle load pins button click
document.getElementById('pinterest-load-btn').addEventListener('click', async () => {
  await pinterest.loadAndRenderPins();
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', async () => {
  await pinterest.init();
  
  // Update UI based on authentication status
  if (pinterest.isAuthenticated) {
    document.getElementById('pinterest-login-btn').style.display = 'none';
    document.getElementById('pinterest-load-btn').style.display = 'inline-block';
  }
});
```

## Configuration Options

The `PinterestIntegration` constructor accepts a configuration object with the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiBaseUrl` | String | 'https://your-pinterest-service.com' | The base URL of your Pinterest API service |
| `pinterestTokenCookieName` | String | 'pinterest_token' | The name of the cookie that stores the Pinterest token |
| `containerSelector` | String | '#pinterest-pins' | CSS selector for the container where pins will be rendered |
| `loadingSelector` | String | '#pinterest-loading' | CSS selector for the loading indicator element |
| `errorSelector` | String | '#pinterest-error' | CSS selector for the error message element |
| `pinTemplate` | Function | (see code) | Function that returns HTML for a pin |

## API Reference

### `init()`

Initializes the Pinterest integration and checks if the user is already authenticated.

```javascript
await pinterest.init();
```

### `login(returnUrl)`

Redirects the user to the Pinterest login page.

```javascript
// Redirect to Pinterest login and return to the current page
pinterest.login(window.location.href);

// Redirect to Pinterest login and return to a specific page
pinterest.login('https://your-site.com/dashboard');
```

### `handleCallback()`

Handles the callback from Pinterest authentication. Call this if your page is the callback URL.

```javascript
const isAuthenticated = pinterest.handleCallback();
```

### `verifyAuthentication()`

Verifies if the user is authenticated with Pinterest.

```javascript
const isAuthenticated = await pinterest.verifyAuthentication();
```

### `fetchPins()`

Fetches pins from the Pinterest API.

```javascript
const pins = await pinterest.fetchPins();
```

### `renderPins(pins, containerSelector)`

Renders pins in the specified container.

```javascript
// Render pins in the default container
pinterest.renderPins(pins);

// Render pins in a specific container
pinterest.renderPins(pins, '#custom-container');
```

### `loadAndRenderPins(containerSelector)`

Fetches and renders pins in one step.

```javascript
// Load and render pins in the default container
await pinterest.loadAndRenderPins();

// Load and render pins in a specific container
await pinterest.loadAndRenderPins('#custom-container');
```

## Handling Authentication Callbacks

When a user completes the Pinterest authentication, they will be redirected back to your site with query parameters. You need to handle this callback:

```javascript
// Check if this is a callback from Pinterest authentication
const urlParams = new URLSearchParams(window.location.search);
const isCallback = urlParams.has('code') && urlParams.has('state');

if (isCallback) {
  pinterest.handleCallback();
  // Remove the query parameters from the URL
  window.history.replaceState({}, document.title, window.location.pathname);
}
```

## Customizing Pin Display

You can customize how pins are displayed by providing a custom `pinTemplate` function:

```javascript
const pinterest = new PinterestIntegration({
  // ... other options
  pinTemplate: pin => `
    <div class="custom-pin">
      <img src="${pin.media?.images?.["600x"]?.url || ''}" alt="${pin.title || 'Pin'}">
      <h4>${pin.title || 'Untitled'}</h4>
      <p>${pin.description || ''}</p>
    </div>
  `
});
```

## Complete Example

See the included `external-site-example.html` for a complete working example.

## Troubleshooting

### CORS Issues

If you're experiencing CORS issues, make sure:

1. Your domain is registered with the Pinterest API service
2. The API service has proper CORS headers configured
3. You're using `credentials: 'include'` in fetch requests (already handled by the script)

### Cookie Issues

If authentication isn't persisting:

1. Make sure your browser accepts third-party cookies
2. Check that the Pinterest API service sets cookies with `SameSite=None` and `Secure=true`
3. Verify that the cookie name matches the `pinterestTokenCookieName` in your configuration

## Support

If you encounter any issues, please contact support at support@your-pinterest-service.com.
