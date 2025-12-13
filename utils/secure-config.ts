/**
 * Secure Configuration Manager
 * Handles API keys and sensitive configuration using Expo SecureStore
 */

import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL_KEY = 'supabase_url';
const SUPABASE_ANON_KEY = 'supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Save Supabase configuration securely
 */
export async function saveSupabaseConfig(config: SupabaseConfig): Promise<void> {
  try {
    await SecureStore.setItemAsync(SUPABASE_URL_KEY, config.url);
    await SecureStore.setItemAsync(SUPABASE_ANON_KEY, config.anonKey);
  } catch (error) {
    throw new Error('Failed to save configuration securely');
  }
}

/**
 * Load Supabase configuration from secure storage
 */
export async function loadSupabaseConfig(): Promise<SupabaseConfig | null> {
  try {
    const url = await SecureStore.getItemAsync(SUPABASE_URL_KEY);
    const anonKey = await SecureStore.getItemAsync(SUPABASE_ANON_KEY);

    if (!url || !anonKey) {
      return null;
    }

    return { url, anonKey };
  } catch (error) {
    return null;
  }
}

/**
 * Check if Supabase configuration exists
 */
export async function hasSupabaseConfig(): Promise<boolean> {
  try {
    const url = await SecureStore.getItemAsync(SUPABASE_URL_KEY);
    const anonKey = await SecureStore.getItemAsync(SUPABASE_ANON_KEY);
    return Boolean(url && anonKey);
  } catch (error) {
    return false;
  }
}

/**
 * Clear all stored configuration
 */
export async function clearSupabaseConfig(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SUPABASE_URL_KEY);
    await SecureStore.deleteItemAsync(SUPABASE_ANON_KEY);
  } catch (error) {
    throw new Error('Failed to clear configuration');
  }
}

/**
 * Validate Supabase URL format
 */
export function validateSupabaseUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && urlObj.hostname.includes('supabase');
  } catch {
    return false;
  }
}

/**
 * Validate Supabase anon key format
 */
export function validateSupabaseKey(key: string): boolean {
  // Basic validation: should be a long base64-like string
  return key.length > 100 && /^[A-Za-z0-9\-_\.]+$/.test(key);
}