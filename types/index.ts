/**
 * Core Type Definitions for ChatBox
 */

import { Database } from './supabase';

// User Types
export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  created_at: string;
  updated_at: string;
}

// Chat Types
export interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  description?: string;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'system';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  reply_to?: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
  read_by?: MessageRead[];
}

export interface MessageRead {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export interface ChatMember {
  id: string;
  chat_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user?: Profile;
}

// Authentication Types
export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  full_name: string;
}

export interface ResetPasswordData {
  email: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form Types
export interface FormFieldError {
  message: string;
  type: string;
}

export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  errors: Record<string, FormFieldError>;
}

// Navigation Types
export interface TabParamList {
  index: undefined;
  explore: undefined;
  chat: undefined;
  profile: undefined;
  settings: undefined;
}

export interface AuthParamList {
  welcome: undefined;
  'sign-in': undefined;
  'sign-up': undefined;
  'forgot-password': undefined;
  'reset-password': { token: string };
  'verify-email': { email: string };
  'two-factor-auth': { email: string };
  'role-selection': undefined;
  'account-recovery-help': undefined;
  onboarding: {
    'slide-1': undefined;
    'slide-2': undefined;
    'slide-3': undefined;
    'slide-4': undefined;
  };
}

export interface ChatParamList {
  index: undefined;
  conversation: { chatId: string };
  'new-chat': undefined;
  'chat-settings': { chatId: string };
}

// Settings Types
export interface AppSettings {
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    push: boolean;
  };
  chat: {
    enterToSend: boolean;
    readReceipts: boolean;
    typingIndicators: boolean;
  };
  privacy: {
    lastSeen: boolean;
    profilePhoto: boolean;
    status: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
  };
}

// File Upload Types
export interface FileUpload {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Search Types
export interface SearchResult {
  type: 'user' | 'chat' | 'message';
  id: string;
  title: string;
  subtitle?: string;
  avatar_url?: string;
  data: any;
}

// Notification Types
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
}

// Database Types
export type Tables = Database['public']['Tables'];
export type DbUser = Tables['users']['Row'];
export type DbProfile = Tables['profiles']['Row'];
export type DbChat = Tables['chats']['Row'];
export type DbMessage = Tables['messages']['Row'];
export type DbChatMember = Tables['chat_members']['Row'];

// Utility Types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;