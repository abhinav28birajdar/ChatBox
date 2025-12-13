/**
 * Storage Service
 * Handles file uploads to Supabase Storage with retry logic and progress tracking
 */

import { getSupabaseService } from '@/utils/supabase';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class StorageService {
  private maxRetries = 3;
  private retryDelay = 1000;

  /**
   * Upload avatar image
   */
  async uploadAvatar(
    userId: string,
    file: Blob,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ url: string | null; error: Error | null }> {
    try {
      const fileExt = 'jpg'; // Default to jpg for avatars
      const fileName = `${userId}/avatar.${fileExt}`;
      
      const supabase = await getSupabaseService();
      
      // Upload with retry logic
      const { data, error } = await this.uploadWithRetry(
        'avatars',
        fileName,
        file,
        { upsert: true }
      );

      if (error) {
        return { url: null, error };
      }

      const publicUrl = await supabase.getPublicUrl('avatars', fileName);
      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error: error as Error };
    }
  }

  /**
   * Upload chat file (image, document, etc.)
   */
  async uploadChatFile(
    chatId: string,
    userId: string,
    file: Blob,
    fileName: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ url: string | null; error: Error | null }> {
    try {
      const timestamp = Date.now();
      const filePath = `${chatId}/${userId}/${timestamp}-${fileName}`;
      
      const supabase = await getSupabaseService();
      
      const { data, error } = await this.uploadWithRetry(
        'chat-files',
        filePath,
        file
      );

      if (error) {
        return { url: null, error };
      }

      const publicUrl = await supabase.getPublicUrl('chat-files', filePath);
      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error: error as Error };
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<{ error: Error | null }> {
    try {
      const supabase = await getSupabaseService();
      const { error } = await supabase.deleteFile(bucket, path);
      
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Upload with retry logic
   */
  private async uploadWithRetry(
    bucket: string,
    path: string,
    file: Blob,
    options?: { upsert?: boolean }
  ): Promise<{ data: any; error: Error | null }> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const supabase = await getSupabaseService();
        const { data, error } = await supabase.uploadFile(bucket, path, file);
        
        if (!error) {
          return { data, error: null };
        }
        
        lastError = new Error(error.message);
        
        // Wait before retry (exponential backoff)
        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
        }
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
        }
      }
    }
    
    return { data: null, error: lastError };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const storageService = new StorageService();
