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
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
    
    document.cookie = `${USER_COOKIE_NAME}=${encodeURIComponent(userData)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
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
    
    const userData = userCookie.split('=')[1];
    const decodedData = decodeURIComponent(userData);
    const user = JSON.parse(decodedData);
    
    console.log('✅ [COOKIE AUTH] User loaded from cookie:', user.email);
    return user;
  } catch (error) {
    console.error('❌ [COOKIE AUTH] Error reading user from cookie:', error);
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