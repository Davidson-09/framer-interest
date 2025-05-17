/**
 * Pinterest Integration Script
 * 
 * This script provides easy integration with the Pinterest API for external websites.
 * It handles authentication, fetching pins, and rendering them on your site.
 * 
 * @version 1.0.0
 */

(function(window) {
  'use strict';

  // Default configuration
  const DEFAULT_CONFIG = {
    apiBaseUrl: 'https://framer-interest.vercel.app', // Replace with your actual service URL
    pinterestTokenCookieName: 'pinterest_token',
    containerSelector: '#pinterest-pins',
    loadingSelector: '#pinterest-loading',
    errorSelector: '#pinterest-error',
    pinTemplate: pin => `
      <div class="pinterest-pin">
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
      </div>
    `
  };

  /**
   * PinterestIntegration class
   */
  class PinterestIntegration {
    /**
     * Create a new PinterestIntegration instance
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.isInitialized = false;
      this.isAuthenticated = false;
    }

    /**
     * Initialize the Pinterest integration
     * @returns {Promise<boolean>} - Whether initialization was successful
     */
    async init() {
      try {
        // Check if already authenticated
        this.isAuthenticated = await this.verifyAuthentication();
        this.isInitialized = true;
        return true;
      } catch (error) {
        console.error('Failed to initialize Pinterest integration:', error);
        this._showError('Failed to initialize Pinterest integration');
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
     * Handle the callback from Pinterest authentication
     * @returns {boolean} - Whether authentication was successful
     */
    handleCallback() {
      // Check if the pinterest_token cookie exists
      const hasPinterestToken = this._getCookie(this.config.pinterestTokenCookieName);
      this.isAuthenticated = !!hasPinterestToken;
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
      this._showLoading(true);
      
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
        this._showLoading(false);
        return data.pins || [];
      } catch (error) {
        this._showLoading(false);
        this._showError(error.message);
        console.error('Error fetching pins:', error);
        return [];
      }
    }

    /**
     * Render pins in the specified container
     * @param {Array} pins - Array of pins to render
     * @param {string} containerSelector - CSS selector for the container (overrides config)
     */
    renderPins(pins, containerSelector = null) {
      const container = document.querySelector(containerSelector || this.config.containerSelector);
      
      if (!container) {
        console.error(`Container not found: ${containerSelector || this.config.containerSelector}`);
        return;
      }

      // Clear the container
      container.innerHTML = '';

      if (!pins || pins.length === 0) {
        container.innerHTML = '<div class="pinterest-no-pins">No pins found</div>';
        return;
      }

      // Render each pin
      pins.forEach(pin => {
        const pinElement = document.createElement('div');
        pinElement.className = 'pinterest-pin-container';
        pinElement.innerHTML = this.config.pinTemplate(pin);
        container.appendChild(pinElement);
      });
    }

    /**
     * Load and render pins in one step
     * @param {string} containerSelector - CSS selector for the container (overrides config)
     * @returns {Promise<Array>} - Array of pins that were rendered
     */
    async loadAndRenderPins(containerSelector = null) {
      const pins = await this.fetchPins();
      this.renderPins(pins, containerSelector);
      return pins;
    }

    /**
     * Get a cookie value by name
     * @private
     * @param {string} name - Cookie name
     * @returns {string|null} - Cookie value or null if not found
     */
    _getCookie(name) {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
          return cookie.substring(name.length + 1);
        }
      }
      return null;
    }

    /**
     * Show or hide the loading indicator
     * @private
     * @param {boolean} show - Whether to show or hide the loading indicator
     */
    _showLoading(show) {
      const loadingElement = document.querySelector(this.config.loadingSelector);
      if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
      }
    }

    /**
     * Show an error message
     * @private
     * @param {string} message - Error message
     */
    _showError(message) {
      const errorElement = document.querySelector(this.config.errorSelector);
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
      }
    }
  }

  // Expose the PinterestIntegration class to the global scope
  window.PinterestIntegration = PinterestIntegration;

})(window);
