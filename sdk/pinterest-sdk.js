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
   * Verify if the user is authenticated with Pinterest
   * @returns {Promise<boolean>} - Whether the user is authenticated
   */
  async verifyAuthentication() {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/api/auth/verify`, {
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

  /**
   * Fetch pins from the Pinterest API
   * @returns {Promise<Array>} - Array of pins
   */
  async fetchPins() {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      if (!this.isAuthenticated) {
        throw new Error('User is not authenticated with Pinterest');
      }

      const response = await fetch(`${this.config.apiBaseUrl}/api/getPins`, {
        method: 'GET',
        credentials: 'include', // Important for sending cookies
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
