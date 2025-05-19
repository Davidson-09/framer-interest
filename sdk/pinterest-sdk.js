/**
 * Pinterest SDK
 *
 * A client-side SDK for integrating with the Pinterest API service
 * without requiring script tags in HTML.
 *
 * @version 1.0.0
 */

class PinterestSDK {
  /**
   * Create a new PinterestSDK instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    // Default configuration
    this.config = {
      apiBaseUrl: 'https://framer-interest.vercel.app', // Replace with your actual service URL
      pinterestTokenCookieName: 'pinterest_token',
      ...config
    };

    this.isInitialized = false;
    this.isAuthenticated = false;
  }

  /**
   * Initialize the Pinterest SDK
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async init() {
    try {
      // Check if already authenticated
      this.isAuthenticated = await this.verifyAuthentication();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Pinterest SDK:', error);
      return false;
    }
  }

  /**
   * Login with Pinterest
   * @param {string} returnUrl - URL to return to after authentication (defaults to current URL)
   */
  login(returnUrl = window.location.href) {
    const encodedReturnUrl = encodeURIComponent(returnUrl);
    window.location.href = `${this.config.apiBaseUrl}/api/auth/login?returnTo=${encodedReturnUrl}`;
  }

  /**
   * Check if the user is authenticated with Pinterest
   * @returns {boolean} - Whether the user is authenticated
   */
  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  /**
   * Handle the callback from Pinterest authentication
   * @param {string} redirectSuccess - URL to redirect on successful authentication (defaults to '/dashboard')
   * @param {string} redirectFailure - URL to redirect on failed authentication (defaults to '/login?error=pinterest_auth_failed')
   * @returns {boolean} - Whether authentication was successful
   */
  handleCallback(redirectSuccess = '/dashboard', redirectFailure = '/login?error=pinterest_auth_failed') {
    // Check if the pinterest_token cookie exists
    const tokenValue = this._getCookie(this.config.pinterestTokenCookieName);
    this.isAuthenticated = !!tokenValue;

    if (this.isAuthenticated) {
      // User is authenticated
      console.log('Pinterest authentication successful');
      // Redirect to success URL
      window.location.href = redirectSuccess;
    } else {
      // Authentication failed
      console.error('Pinterest authentication failed');
      // Redirect to failure URL
      window.location.href = redirectFailure;
    }

    return this.isAuthenticated;
  }

  /**
   * Check if a token exists (without verifying with Pinterest)
   * @param {string} accessToken - Optional access token to use instead of cookie
   * @returns {Promise<boolean>} - Whether a token exists
   */
  async verifyAuthentication(accessToken = null) {
    try {
      // Get token from cookie if not provided
      if (!accessToken) {
        accessToken = this._getCookie(this.config.pinterestTokenCookieName);
      }

      if (!accessToken) {
        console.log('No token found');
        return false;
      }

      // Simply check if the token exists and has a reasonable length
      const isReasonableLength = accessToken.length > 20; // Most OAuth tokens are longer than this

      if (!isReasonableLength) {
        console.log('Token appears to be too short to be valid');
        return false;
      }

      console.log('Token exists and has reasonable length');
      return true;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  }

  /**
   * Fetch pins from the Pinterest API
   * @param {string} accessToken - Optional access token to use instead of cookie
   * @returns {Promise<Array>} - Array of pins
   */
  async fetchPins(accessToken = null) {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      // If access token is provided, verify authentication with it
      // Otherwise, check if the user is authenticated via cookie
      if (accessToken) {
        const isAuthenticated = await this.verifyAuthentication(accessToken);
        if (!isAuthenticated) {
          throw new Error('Invalid or expired access token');
        }
      } else if (!this.isAuthenticated) {
        throw new Error('User is not authenticated with Pinterest');
      }

      // Build the URL with or without the access token
      let url = `${this.config.apiBaseUrl}/api/getPins`;
      if (accessToken) {
        url += `?access_token=${encodeURIComponent(accessToken)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Important for sending cookies (used as fallback)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch pins: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.pins || [];
    } catch (error) {
      console.error('Error fetching pins:', error);
      throw error;
    }
  }

  /**
   * Get a cookie value by name
   * @private
   * @param {string} name - Cookie name
   * @returns {string|null} - Cookie value or null if not found
   */
  _getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
}

// Export for ESM
export default PinterestSDK;

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PinterestSDK;
}

// Export for browser globals
if (typeof window !== 'undefined') {
  window.PinterestSDK = PinterestSDK;
}
