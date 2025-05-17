/**
 * Pinterest SDK TypeScript Definitions
 */

interface PinterestSDKConfig {
  /**
   * Base URL of the Pinterest API service
   * @default 'https://framer-interest.vercel.app'
   */
  apiBaseUrl?: string;

  /**
   * Name of the cookie that stores the Pinterest token
   * @default 'pinterest_token'
   */
  pinterestTokenCookieName?: string;
}

interface PinterestPin {
  id: string;
  title?: string;
  description?: string;
  link?: string;
  media?: {
    images?: {
      [key: string]: {
        url: string;
        width: number;
        height: number;
      }
    }
  };
  [key: string]: any;
}

declare class PinterestSDK {
  /**
   * Create a new PinterestSDK instance
   * @param config - Configuration options
   */
  constructor(config?: PinterestSDKConfig);

  /**
   * Configuration options
   */
  config: PinterestSDKConfig;

  /**
   * Whether the SDK has been initialized
   */
  isInitialized: boolean;

  /**
   * Whether the user is authenticated with Pinterest
   */
  isAuthenticated: boolean;

  /**
   * Initialize the Pinterest SDK
   * @returns Whether initialization was successful
   */
  init(): Promise<boolean>;

  /**
   * Login with Pinterest
   * @param returnUrl - URL to return to after authentication (defaults to current URL)
   */
  login(returnUrl?: string): void;

  /**
   * Check if the user is authenticated with Pinterest
   * @returns Whether the user is authenticated
   */
  isUserAuthenticated(): boolean;

  /**
   * Handle the callback from Pinterest authentication
   * @param redirectSuccess - URL to redirect on successful authentication (defaults to '/dashboard')
   * @param redirectFailure - URL to redirect on failed authentication (defaults to '/login?error=pinterest_auth_failed')
   * @returns Whether authentication was successful
   */
  handleCallback(redirectSuccess?: string, redirectFailure?: string): boolean;

  /**
   * Verify if the user is authenticated with Pinterest
   * @param accessToken - Optional access token to use instead of cookie
   * @returns Whether the user is authenticated
   */
  verifyAuthentication(accessToken?: string | null): Promise<boolean>;

  /**
   * Fetch pins from the Pinterest API
   * @param accessToken - Optional access token to use instead of cookie
   * @returns Array of pins
   */
  fetchPins(accessToken?: string | null): Promise<PinterestPin[]>;

  /**
   * Get a cookie value by name
   * @private
   * @param name - Cookie name
   * @returns Cookie value or null if not found
   */
  private _getCookie(name: string): string | null;
}

export default PinterestSDK;
