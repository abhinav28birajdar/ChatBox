/**
 * Offline Support Service
 * Handles offline state and queued operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface QueuedOperation {
  id: string;
  type: 'message' | 'profile_update' | 'file_upload';
  data: any;
  timestamp: number;
  retries: number;
}

export class OfflineService {
  private isOnline: boolean = true;
  private queue: QueuedOperation[] = [];
  private readonly QUEUE_KEY = 'offline_queue';
  private maxRetries = 3;
  private listeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Load queued operations
    await this.loadQueue();

    // Monitor network status
    NetInfo.addEventListener((state: any) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      this.notifyListeners();
      
      // Process queue when coming back online
      if (!wasOnline && this.isOnline) {
        this.processQueue();
      }
    });
  }

  /**
   * Check if device is online
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Add listener for online status changes
   */
  addListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
  }

  /**
   * Remove listener
   */
  removeListener(listener: (isOnline: boolean) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  /**
   * Queue an operation for later execution
   */
  async queueOperation(type: QueuedOperation['type'], data: any): Promise<string> {
    const operation: QueuedOperation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(operation);
    await this.saveQueue();

    return operation.id;
  }

  /**
   * Process queued operations
   */
  private async processQueue() {
    if (!this.isOnline || this.queue.length === 0) {
      return;
    }

    const operations = [...this.queue];
    
    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        
        // Remove from queue on success
        this.queue = this.queue.filter(op => op.id !== operation.id);
      } catch (error) {
        // Increment retry count
        const op = this.queue.find(o => o.id === operation.id);
        if (op) {
          op.retries++;
          
          // Remove if max retries exceeded
          if (op.retries >= this.maxRetries) {
            this.queue = this.queue.filter(o => o.id !== operation.id);
          }
        }
      }
    }

    await this.saveQueue();
  }

  /**
   * Execute a queued operation
   */
  private async executeOperation(operation: QueuedOperation): Promise<void> {
    // This would be implemented by the specific services
    // For now, we just throw to retry later
    throw new Error('Operation execution not implemented');
  }

  /**
   * Save queue to persistent storage
   */
  private async saveQueue() {
    try {
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      // Ignore storage errors
    }
  }

  /**
   * Load queue from persistent storage
   */
  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(this.QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      // Ignore storage errors
    }
  }

  /**
   * Clear all queued operations
   */
  async clearQueue() {
    this.queue = [];
    await this.saveQueue();
  }

  /**
   * Get number of queued operations
   */
  getQueuedCount(): number {
    return this.queue.length;
  }
}

export const offlineService = new OfflineService();
