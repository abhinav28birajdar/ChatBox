/**
 * Supabase Database Types
 * Generated types for database schema
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          is_online: boolean;
          last_seen: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_online?: boolean;
          last_seen?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_online?: boolean;
          last_seen?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          status: 'online' | 'away' | 'busy' | 'offline';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          full_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          status?: 'online' | 'away' | 'busy' | 'offline';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          status?: 'online' | 'away' | 'busy' | 'offline';
          created_at?: string;
          updated_at?: string;
        };
      };
      chats: {
        Row: {
          id: string;
          name: string | null;
          type: 'direct' | 'group';
          description: string | null;
          avatar_url: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          type: 'direct' | 'group';
          description?: string | null;
          avatar_url?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          type?: 'direct' | 'group';
          description?: string | null;
          avatar_url?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_members: {
        Row: {
          id: string;
          chat_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          joined_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'member';
          joined_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'member';
          joined_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          user_id: string;
          content: string;
          type: 'text' | 'image' | 'file' | 'audio' | 'system';
          file_url: string | null;
          file_name: string | null;
          file_size: number | null;
          reply_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          user_id: string;
          content: string;
          type?: 'text' | 'image' | 'file' | 'audio' | 'system';
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          reply_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          user_id?: string;
          content?: string;
          type?: 'text' | 'image' | 'file' | 'audio' | 'system';
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          reply_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      message_reads: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          read_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          read_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          user_id?: string;
          read_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          service_name: string;
          key_name: string;
          encrypted_value: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_name: string;
          key_name: string;
          encrypted_value: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_name?: string;
          key_name?: string;
          encrypted_value?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      chat_type: 'direct' | 'group';
      message_type: 'text' | 'image' | 'file' | 'audio' | 'system';
      member_role: 'owner' | 'admin' | 'member';
      user_status: 'online' | 'away' | 'busy' | 'offline';
    };
  };
}