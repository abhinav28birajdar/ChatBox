/**
 * Cache Service
 * In-memory and persistent caching for better performance
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class CacheService {
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get item from cache (memory first, then persistent)
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && Date.now() < memoryItem.expiresAt) {
      return memoryItem.data;
    }

    // Check persistent cache
    try {
      const persistentItem = await AsyncStorage.getItem(`cache:${key}`);
      if (persistentItem) {
        const parsed: CacheItem<T> = JSON.parse(persistentItem);
        if (Date.now() < parsed.expiresAt) {
          // Restore to memory cache
          this.memoryCache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch (error) {
      // Ignore cache errors
    }

    return null;
  }

  /**
   * Set item in cache (both memory and persistent)
   */
  async set<T>(key: string, data: T, ttl: number = this.defaultTTL): Promise<void> {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    // Set in memory cache
    this.memoryCache.set(key, item);

    // Set in persistent cache
    try {
      await AsyncStorage.setItem(`cache:${key}`, JSON.stringify(item));
    } catch (error) {
      // Ignore cache errors
    }
  }

  /**
   * Remove item from cache
   */
  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    try {
      await AsyncStorage.removeItem(`cache:${key}`);
    } catch (error) {
      // Ignore cache errors
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      // Ignore cache errors
    }
  }

  /**
   * Clean expired items
   */
  async cleanExpired(): Promise<void> {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (now >= item.expiresAt) {
        this.memoryCache.delete(key);
      }
    }

    // Clean persistent cache
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));
      
      for (const key of cacheKeys) {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          const parsed: CacheItem<any> = JSON.parse(item);
          if (now >= parsed.expiresAt) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      // Ignore cache errors
    }
  }
}

export const cacheService = new CacheService();
