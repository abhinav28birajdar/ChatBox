/**
 * Supabase Client Configuration
 * Centralized Supabase setup with automatic key management
 */

import { Database } from '@/types/supabase';
import { apiKeyManager } from '@/utils/api-key-manager';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient<Database> | null = null;

export async function initializeSupabase(): Promise<SupabaseClient<Database>> {
  // Initialize API key manager first
  await apiKeyManager.initialize();

  const url = apiKeyManager.getSupabaseUrl();
  const anonKey = apiKeyManager.getSupabaseAnonKey();

  if (!url || !anonKey) {
    throw new Error('Supabase configuration not found. Please set up your API keys.');
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return supabaseInstance;
}

export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    throw new Error('Supabase not initialized. Call initializeSupabase() first.');
  }
  return supabaseInstance;
}

export function resetSupabase(): void {
  supabaseInstance = null;
}

// Database helper functions
export class SupabaseService {
  private client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  // Auth helpers
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    return { error };
  }

  async resetPassword(email: string) {
    const { data, error } = await this.client.auth.resetPasswordForEmail(email);
    return { data, error };
  }

  async updatePassword(password: string) {
    const { data, error } = await this.client.auth.updateUser({
      password,
    });
    return { data, error };
  }

  // User helpers
  async getProfile(userId: string) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  }

  async updateProfile(userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
    const { data, error } = await this.client
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    return { data, error };
  }

  async createProfile(profileData: Database['public']['Tables']['profiles']['Insert']) {
    const { data, error } = await this.client
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
    return { data, error };
  }

  // Chat helpers
  async getUserChats(userId: string) {
    const { data, error } = await this.client
      .from('chat_members')
      .select(`
        *,
        chats:chat_id (
          *,
          messages (
            id,
            content,
            created_at,
            user:user_id (
              profiles (username, full_name, avatar_url)
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false, referencedTable: 'chats.messages' });
    
    return { data, error };
  }

  async getChatMessages(chatId: string, limit = 50, offset = 0) {
    const { data, error } = await this.client
      .from('messages')
      .select(`
        *,
        user:user_id (
          profiles (username, full_name, avatar_url)
        ),
        reply_to_message:reply_to (
          id,
          content,
          user:user_id (
            profiles (username)
          )
        )
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return { data, error };
  }

  async sendMessage(messageData: Database['public']['Tables']['messages']['Insert']) {
    const { data, error } = await this.client
      .from('messages')
      .insert(messageData)
      .select(`
        *,
        user:user_id (
          profiles (username, full_name, avatar_url)
        )
      `)
      .single();

    return { data, error };
  }

  async createChat(chatData: Database['public']['Tables']['chats']['Insert']) {
    const { data, error } = await this.client
      .from('chats')
      .insert(chatData)
      .select()
      .single();

    return { data, error };
  }

  async addChatMember(memberData: Database['public']['Tables']['chat_members']['Insert']) {
    const { data, error } = await this.client
      .from('chat_members')
      .insert(memberData)
      .select()
      .single();

    return { data, error };
  }

  // Real-time subscriptions
  subscribeToMessages(chatId: string, callback: (message: any) => void) {
    return this.client
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToChats(userId: string, callback: (payload: any) => void) {
    return this.client
      .channel(`user_chats:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_members',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToUserStatus(userId: string, callback: (payload: any) => void) {
    return this.client
      .channel(`user_status:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  // File upload helpers
  async uploadFile(bucket: string, path: string, file: File | Blob) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file);

    return { data, error };
  }

  async getPublicUrl(bucket: string, path: string) {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async deleteFile(bucket: string, path: string) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .remove([path]);

    return { data, error };
  }
}

let supabaseService: SupabaseService | null = null;

export async function getSupabaseService(): Promise<SupabaseService> {
  if (!supabaseService) {
    const client = await initializeSupabase();
    supabaseService = new SupabaseService(client);
  }
  return supabaseService;
}