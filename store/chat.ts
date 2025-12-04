/**
 * Chat Store
 * Zustand store for managing chat state and real-time messaging
 */

import { Chat, ChatMember, Message } from '@/types';
import { getSupabaseService } from '@/utils/supabase';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useAuthStore } from './auth';

interface ChatState {
  // Chat data
  chats: Chat[];
  activeChat: Chat | null;
  activeChatId: string | null;
  messages: Record<string, Message[]>;
  chatMembers: Record<string, ChatMember[]>;
  
  // UI state
  isLoading: boolean;
  isLoadingMessages: boolean;
  isTyping: Record<string, string[]>; // chatId -> userIds[]
  
  // Real-time subscriptions
  subscriptions: Map<string, any>;
}

interface ChatActions {
  // Chat management
  loadChats: () => Promise<void>;
  setActiveChat: (chatId: string | null) => void;
  createChat: (type: 'direct' | 'group', participantIds: string[], name?: string) => Promise<string | null>;
  createDirectChat: (participantId: string) => Promise<string | null>;
  createGroupChat: (name: string, participantIds: string[]) => Promise<string | null>;
  leaveChat: (chatId: string) => Promise<boolean>;
  
  // Message management
  loadMessages: (chatId: string, offset?: number) => Promise<void>;
  sendMessage: (chatId: string, content: string, type?: 'text' | 'image' | 'file' | 'audio') => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  
  // User search
  searchUsers: (query: string) => Promise<any[]>;
  
  // Real-time
  subscribeToChat: (chatId: string) => void;
  unsubscribeFromChat: (chatId: string) => void;
  subscribeToMessages: (chatId: string) => void;
  unsubscribeFromMessages: (chatId: string) => void;
  setUserTyping: (chatId: string, isTyping: boolean) => void;
  
  // Utilities
  clearStore: () => void;
  setLoading: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    chats: [],
    activeChat: null,
    activeChatId: null,
    messages: {},
    chatMembers: {},
    isLoading: false,
    isLoadingMessages: false,
    isTyping: {},
    subscriptions: new Map(),

    // Actions
    loadChats: async () => {
      const { user } = useAuthStore.getState();
      if (!user) return;

      set({ isLoading: true });

      try {
        const supabase = await getSupabaseService();
        const { data, error } = await supabase.getUserChats(user.id);

        if (!error && data) {
          const formattedChats: Chat[] = (data as any[]).map((chatMember: any) => ({
            id: chatMember.chats?.id,
            name: chatMember.chats?.name,
            type: chatMember.chats?.type,
            description: chatMember.chats?.description,
            avatar_url: chatMember.chats?.avatar_url,
            created_by: chatMember.chats?.created_by,
            created_at: chatMember.chats?.created_at,
            updated_at: chatMember.chats?.updated_at,
            last_message: chatMember.chats?.messages?.[0] ? {
              ...chatMember.chats.messages[0],
              user: chatMember.chats.messages[0].user?.profiles,
            } : undefined,
            unread_count: 0, // TODO: Calculate unread count
          }));

          set({ chats: formattedChats });
        }
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        set({ isLoading: false });
      }
    },

    setActiveChat: (chatId: string | null) => {
      const { chats, subscriptions } = get();
      
      // Unsubscribe from previous chat
      const currentChatId = get().activeChatId;
      if (currentChatId) {
        get().unsubscribeFromMessages(currentChatId);
      }

      if (chatId) {
        const activeChat = chats.find(chat => chat.id === chatId) || null;
        set({ activeChat, activeChatId: chatId });
        
        // Subscribe to new chat
        get().subscribeToMessages(chatId);
        
        // Load messages if not already loaded
        if (!get().messages[chatId]) {
          get().loadMessages(chatId);
        }
      } else {
        set({ activeChat: null, activeChatId: null });
      }
    },

    createChat: async (type: 'direct' | 'group', participantIds: string[], name?: string) => {
      const { user } = useAuthStore.getState();
      if (!user) return null;

      try {
        const supabase = await getSupabaseService();
        
        // Create chat
        const { data: chat, error: chatError } = await supabase.createChat({
          type,
          name,
          created_by: user.id,
        });

        if (chatError || !chat) {
          console.error('Error creating chat:', chatError);
          return null;
        }

        // Add creator as owner
        await supabase.addChatMember({
          chat_id: (chat as any).id,
          user_id: user.id,
          role: 'owner',
        });

        // Add other participants as members
        for (const participantId of participantIds) {
          await supabase.addChatMember({
            chat_id: (chat as any).id,
            user_id: participantId,
            role: 'member',
          });
        }

        // Refresh chats
        await get().loadChats();

        return (chat as any).id;
      } catch (error) {
        console.error('Error creating chat:', error);
        return null;
      }
    },

    leaveChat: async (chatId: string) => {
      const { user } = useAuthStore.getState();
      if (!user) return false;

      try {
        // TODO: Implement leave chat logic
        return true;
      } catch (error) {
        console.error('Error leaving chat:', error);
        return false;
      }
    },

    loadMessages: async (chatId: string, offset = 0) => {
      set({ isLoadingMessages: true });

      try {
        const supabase = await getSupabaseService();
        const { data, error } = await supabase.getChatMessages(chatId, 50, offset);

        if (!error && data) {
          const formattedMessages: Message[] = (data as any[]).reverse().map((msg: any) => ({
            ...msg,
            user: msg.user?.profiles,
            reply_to_message: msg.reply_to_message,
          }));

          set((state) => ({
            messages: {
              ...state.messages,
              [chatId]: offset === 0 ? formattedMessages : [...formattedMessages, ...(state.messages[chatId] || [])],
            },
          }));
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        set({ isLoadingMessages: false });
      }
    },

    sendMessage: async (chatId: string, content: string, type = 'text') => {
      const { user } = useAuthStore.getState();
      if (!user) return false;

      try {
        const supabase = await getSupabaseService();
        const { data, error } = await supabase.sendMessage({
          chat_id: chatId,
          user_id: user.id,
          content,
          type,
        });

        if (error) {
          console.error('Error sending message:', error);
          return false;
        }

        // Optimistically add message to local state
        if (data) {
          const newMessage: Message = {
            ...(data as any),
            user: (data as any).user?.profiles,
          };

          set((state) => ({
            messages: {
              ...state.messages,
              [chatId]: [...(state.messages[chatId] || []), newMessage],
            },
          }));
        }

        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    },

    deleteMessage: async (messageId: string) => {
      try {
        // TODO: Implement delete message logic
        return true;
      } catch (error) {
        console.error('Error deleting message:', error);
        return false;
      }
    },

    subscribeToChat: (chatId: string) => {
      // TODO: Implement chat subscription (for chat updates, member changes, etc.)
    },

    unsubscribeFromChat: (chatId: string) => {
      const { subscriptions } = get();
      const subscription = subscriptions.get(`chat_${chatId}`);
      if (subscription) {
        subscription.unsubscribe();
        subscriptions.delete(`chat_${chatId}`);
      }
    },

    subscribeToMessages: (chatId: string) => {
      const { subscriptions } = get();
      
      // Don't subscribe if already subscribed
      if (subscriptions.has(`messages_${chatId}`)) return;

      try {
        // Subscribe to real-time messages
        const supabase = getSupabaseService();
        // Note: This is a synchronous call since we need the subscription immediately
        // In a real implementation, you'd handle the async nature properly
        
        // Placeholder for real-time subscription
        const subscription = {
          unsubscribe: () => {
            // Unsubscribe logic
          },
        };

        subscriptions.set(`messages_${chatId}`, subscription);
      } catch (error) {
        console.error('Error subscribing to messages:', error);
      }
    },

    unsubscribeFromMessages: (chatId: string) => {
      const { subscriptions } = get();
      const subscription = subscriptions.get(`messages_${chatId}`);
      if (subscription) {
        subscription.unsubscribe();
        subscriptions.delete(`messages_${chatId}`);
      }
    },

    setUserTyping: (chatId: string, isTyping: boolean) => {
      const { user } = useAuthStore.getState();
      if (!user) return;

      set((state) => ({
        isTyping: {
          ...state.isTyping,
          [chatId]: isTyping
            ? [...(state.isTyping[chatId] || []), user.id].filter((id, index, arr) => arr.indexOf(id) === index)
            : (state.isTyping[chatId] || []).filter(id => id !== user.id),
        },
      }));
    },

    clearStore: () => {
      // Unsubscribe from all subscriptions
      const { subscriptions } = get();
      subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });

      set({
        chats: [],
        activeChat: null,
        activeChatId: null,
        messages: {},
        chatMembers: {},
        isLoading: false,
        isLoadingMessages: false,
        isTyping: {},
        subscriptions: new Map(),
      });
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    setLoadingMessages: (loading: boolean) => {
      set({ isLoadingMessages: loading });
    },

    // Additional methods for new chat functionality
    createDirectChat: async (participantId: string): Promise<string | null> => {
      const { user } = useAuthStore.getState();
      if (!user) return null;

      try {
        const supabase = await getSupabaseService();
        
        // Create the chat
        const chatData = {
          type: 'direct' as const,
          created_by: user.id,
        };
        
        const result = await supabase.createChat(chatData);
        
        if (result.error || !result.data) {
          console.error('Error creating chat:', result.error);
          return null;
        }
        
        const chatId = result.data.id;
        
        // Add members to the chat
        await supabase.addChatMember({
          chat_id: chatId,
          user_id: user.id,
          role: 'owner',
        });
        
        await supabase.addChatMember({
          chat_id: chatId,
          user_id: participantId,
          role: 'member',
        });
        
        // Reload chats to include the new one
        await get().loadChats();
        
        return chatId;
      } catch (error) {
        console.error('Error creating direct chat:', error);
        return null;
      }
    },

    createGroupChat: async (name: string, participantIds: string[]): Promise<string | null> => {
      const { user } = useAuthStore.getState();
      if (!user) return null;

      try {
        const supabase = await getSupabaseService();
        
        // Create the chat
        const chatData = {
          type: 'group' as const,
          name,
          created_by: user.id,
        };
        
        const result = await supabase.createChat(chatData);
        
        if (result.error || !result.data) {
          console.error('Error creating chat:', result.error);
          return null;
        }
        
        const chatId = result.data.id;
        
        // Add the creator as owner
        await supabase.addChatMember({
          chat_id: chatId,
          user_id: user.id,
          role: 'owner',
        });
        
        // Add other participants as members
        for (const participantId of participantIds) {
          await supabase.addChatMember({
            chat_id: chatId,
            user_id: participantId,
            role: 'member',
          });
        }
        
        // Reload chats to include the new one
        await get().loadChats();
        
        return chatId;
      } catch (error) {
        console.error('Error creating group chat:', error);
        return null;
      }
    },

    searchUsers: async (query: string): Promise<any[]> => {
      try {
        const supabase = await getSupabaseService();
        const { data, error } = await supabase.supabaseClient
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
          .limit(20);

        if (error) {
          console.error('Error searching users:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error searching users:', error);
        return [];
      }
    },
  }))
);