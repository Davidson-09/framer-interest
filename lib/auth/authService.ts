/**
 * Authentication service for handling Pinterest authentication
 */

// Check if a token exists (without verifying with Pinterest)
export async function verifyToken(token: string | null): Promise<boolean> {
  if (!token) {
    console.log('No token found');
    return false;
  }

  // Simply check if the token exists and has a reasonable length
  const isReasonableLength = token.length > 20; // Most OAuth tokens are longer than this

  if (!isReasonableLength) {
    console.log('Token appears to be too short to be valid');
    return false;
  }

  console.log('Token exists and has reasonable length');
  return true;
}

// Get token from URL (supports both 'token' and 'access_token' parameters)
export function getTokenFromUrl(url: URL): string | null {
  const token = url.searchParams.get('token') || url.searchParams.get('access_token');

  if (token) {
    console.log('Found token in URL (first 10 chars):', token.substring(0, 10) + '...');
  }

  return token;
}

// Get stored token from localStorage
export function getStoredToken(): string | null {
  try {
    const token = localStorage.getItem('pinterest_token');

    if (token) {
      console.log('Found token in localStorage (first 10 chars):', token.substring(0, 10) + '...');
    }

    return token;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
}

// Get stored email from localStorage
export function getStoredEmail(): string | null {
  try {
    return localStorage.getItem('pinterest_user_email');
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
}

// Initialize Pinterest login
export function initiatePinterestLogin(email: string): void {
  try {
    // Store email in localStorage for retrieval after Pinterest auth
    localStorage.setItem('pinterest_user_email', email);

    // Get the current URL to return to after authentication
    const currentUrl = window.location.href;
    window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(currentUrl)}`;
  } catch (error) {
    console.error('Error initiating Pinterest login:', error);
  }
}

// Clean up URL by removing token parameters
export function cleanupUrl(): void {
  try {
    const url = new URL(window.location.href);

    // Check if we have token parameters
    if (url.searchParams.has('token') || url.searchParams.has('access_token')) {
      // Remove token parameters
      url.searchParams.delete('token');
      url.searchParams.delete('access_token');

      // Update URL without reloading the page
      window.history.replaceState({}, document.title, url.toString());
      console.log('Cleaned up URL');
    }
  } catch (error) {
    console.error('Error cleaning up URL:', error);
  }
}
