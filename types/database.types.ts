// Database types generated from Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          status: 'online' | 'away' | 'busy' | 'offline'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          full_name: string
          avatar_url?: string | null
          bio?: string | null
          status?: 'online' | 'away' | 'busy' | 'offline'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          status?: 'online' | 'away' | 'busy' | 'offline'
          created_at?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          name: string | null
          type: 'direct' | 'group'
          description: string | null
          avatar_url: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          type: 'direct' | 'group'
          description?: string | null
          avatar_url?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          type?: 'direct' | 'group'
          description?: string | null
          avatar_url?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_members: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          content: string
          type: 'text' | 'image' | 'file' | 'audio' | 'system'
          file_url: string | null
          file_name: string | null
          file_size: number | null
          reply_to: string | null
          edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          content: string
          type?: 'text' | 'image' | 'file' | 'audio' | 'system'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          reply_to?: string | null
          edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          content?: string
          type?: 'text' | 'image' | 'file' | 'audio' | 'system'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          reply_to?: string | null
          edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}