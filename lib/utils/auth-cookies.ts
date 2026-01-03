/**
 * Utility functions for managing authentication cookies
 */

export function setAuthCookie(token: string) {
  // Set cookie that expires in 7 days
  const expires = new Date();
  expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  document.cookie = `auth-token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
}

export function removeAuthCookie() {
  document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth-token') {
      return value;
    }
  }
  return null;
}

