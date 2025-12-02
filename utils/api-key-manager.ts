/**
 * API Key Manager
 * Secure storage and management of API keys using Expo SecureStore
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface ApiKeys {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
}

class ApiKeyManager {
  private static instance: ApiKeyManager;
  private keys: ApiKeys = {};
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load keys from secure storage
      const storedKeys = await this.loadAllKeys();
      this.keys = { ...this.keys, ...storedKeys };
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize API keys:', error);
      this.isInitialized = true;
    }
  }

  private async loadAllKeys(): Promise<ApiKeys> {
    const keys: ApiKeys = {};
    
    try {
      const supabaseUrl = await this.getSecureItem('SUPABASE_URL');
      const supabaseAnonKey = await this.getSecureItem('SUPABASE_ANON_KEY');
      
      if (supabaseUrl) keys.SUPABASE_URL = supabaseUrl;
      if (supabaseAnonKey) keys.SUPABASE_ANON_KEY = supabaseAnonKey;

      // Also check for public env keys (for development)
      if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
        keys.EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
      }
      if (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
        keys.EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      }
    } catch (error) {
      console.warn('Failed to load API keys:', error);
    }

    return keys;
  }

  private async getSecureItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Fallback to localStorage for web
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`Failed to get secure item ${key}:`, error);
      return null;
    }
  }

  private async setSecureItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Fallback to localStorage for web
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Failed to set secure item ${key}:`, error);
      throw error;
    }
  }

  async setSupabaseConfig(url: string, anonKey: string): Promise<void> {
    await this.setSecureItem('SUPABASE_URL', url);
    await this.setSecureItem('SUPABASE_ANON_KEY', anonKey);
    
    this.keys.SUPABASE_URL = url;
    this.keys.SUPABASE_ANON_KEY = anonKey;
  }

  getSupabaseUrl(): string | null {
    return (
      this.keys.SUPABASE_URL ||
      this.keys.EXPO_PUBLIC_SUPABASE_URL ||
      process.env.EXPO_PUBLIC_SUPABASE_URL ||
      null
    );
  }

  getSupabaseAnonKey(): string | null {
    return (
      this.keys.SUPABASE_ANON_KEY ||
      this.keys.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      null
    );
  }

  hasSupabaseConfig(): boolean {
    return !!(this.getSupabaseUrl() && this.getSupabaseAnonKey());
  }

  async clearAllKeys(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('SUPABASE_URL');
        localStorage.removeItem('SUPABASE_ANON_KEY');
      } else {
        await SecureStore.deleteItemAsync('SUPABASE_URL');
        await SecureStore.deleteItemAsync('SUPABASE_ANON_KEY');
      }
      this.keys = {};
    } catch (error) {
      console.error('Failed to clear API keys:', error);
      throw error;
    }
  }

  getAllKeys(): ApiKeys {
    return { ...this.keys };
  }
}

export const apiKeyManager = ApiKeyManager.getInstance();