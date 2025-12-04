/**
 * Cookie-based authentication utilities
 * Simple and reliable user session management
 */

import { User } from '../types';

const USER_COOKIE_NAME = 'don_agustin_user';
const COOKIE_EXPIRY_DAYS = 7;

/**
 * Save user data to cookie
 */
export function saveUserToCookie(user: User): void {
  try {
    const userData = JSON.stringify(user);
    const encodedData = btoa(userData);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);

    document.cookie = `${USER_COOKIE_NAME}=${encodedData}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    console.log('✅ [COOKIE AUTH] User saved to cookie:', user.email);
  } catch (error) {
    console.error('❌ [COOKIE AUTH] Error saving user to cookie:', error);
  }
}

/**
 * Get user data from cookie
 */
export function getUserFromCookie(): User | null {
  try {
    const cookies = document.cookie.split(';');
    const userCookie = cookies.find(cookie =>
      cookie.trim().startsWith(`${USER_COOKIE_NAME}=`)
    );

    if (!userCookie) {
      console.log('ℹ️ [COOKIE AUTH] No user cookie found');
      return null;
    }

    const encodedData = userCookie.split('=')[1];

    if (!encodedData || encodedData.trim() === '') {
      console.warn('⚠️ [COOKIE AUTH] Cookie exists but is empty, removing');
      removeUserCookie();
      return null;
    }

    const decodedData = atob(encodedData);
    const user = JSON.parse(decodedData);

    if (!user || !user.user_id || !user.email) {
      console.warn('⚠️ [COOKIE AUTH] Cookie data is invalid or incomplete, removing');
      removeUserCookie();
      return null;
    }

    console.log('✅ [COOKIE AUTH] User loaded from cookie:', user.email);
    return user;
  } catch (error) {
    if (error instanceof DOMException) {
      console.error('❌ [COOKIE AUTH] Invalid base64 encoding in cookie, removing:', error.message);
    } else if (error instanceof SyntaxError) {
      console.error('❌ [COOKIE AUTH] Invalid JSON in cookie, removing:', error.message);
    } else {
      console.error('❌ [COOKIE AUTH] Unexpected error reading cookie, removing:', error);
    }
    removeUserCookie();
    return null;
  }
}

/**
 * Remove user cookie
 */
export function removeUserCookie(): void {
  try {
    document.cookie = `${USER_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log('✅ [COOKIE AUTH] User cookie removed');
  } catch (error) {
    console.error('❌ [COOKIE AUTH] Error removing user cookie:', error);
  }
}

/**
 * Check if user cookie exists
 */
export function hasUserCookie(): boolean {
  return document.cookie.includes(`${USER_COOKIE_NAME}=`);
}