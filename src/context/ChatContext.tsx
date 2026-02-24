import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from './AuthContext';
import DMService, { DirectMessage } from '@/services/DMService';
import MessageService, { Message, SendMessageData } from '@/services/MessageService';
import TypingService from '@/services/TypingService';
import { useServers } from './ServerContext';

interface ChatContextType {
  dms: DirectMessage[];
  chats: DirectMessage[]; // Alias for dms used in some screens
  messages: Message[];
  loading: boolean;
  activeChatId: string | null;
  typingUsers: string[];
  setActiveChat: (chatId: string | null) => void;
  loadDMs: () => Promise<void>;
  refreshDMs: () => Promise<void>; // Alias for loadDMs
  sendMessage: (serverId: string | null, chatId: string, data: SendMessageData) => Promise<string>;
  sendTyping: (chatId: string) => Promise<void>;
  clearTyping: (chatId: string) => Promise<void>;
  addReaction: (serverId: string | null, channelId: string, messageId: string, emoji: string) => Promise<void>;
  pinChat: (chatId: string) => Promise<void>;
  createDM: (participantIds: string[]) => Promise<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useAuth();
  const { activeServer } = useServers();
  const [dms, setDms] = useState<DirectMessage[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const messageSubRef = useRef<(() => void) | null>(null);
  const typingSubRef = useRef<(() => void) | null>(null);
  // Use ref to track DM ids to avoid re-subscribing on every render
  const dmIdsRef = useRef<Set<string>>(new Set());

  // Subscribe to user's DMs
  useEffect(() => {
    if (!user) {
      setDms([]);
      dmIdsRef.current = new Set();
      setLoading(false);
      return;
    }

    const unsubscribe = DMService.subscribeToDMs((newDms) => {
      setDms(newDms);
      dmIdsRef.current = new Set(newDms.map(dm => dm.id));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to messages and typing when active chat changes
  useEffect(() => {
    // Cleanup previous subscriptions
    if (messageSubRef.current) {
      messageSubRef.current();
      messageSubRef.current = null;
    }
    if (typingSubRef.current) {
      typingSubRef.current();
      typingSubRef.current = null;
    }

    if (activeChatId) {
      // Determine if it's a DM or Server Channel using ref (stable)
      const isDM = dmIdsRef.current.has(activeChatId);

      if (isDM) {
        messageSubRef.current = DMService.subscribeToDMMessages(activeChatId, 50, (newMsgs) => {
          setMessages(newMsgs);
        });
      } else if (activeServer) {
        // It's a server channel
        messageSubRef.current = MessageService.subscribeToMessages(activeServer.id, activeChatId, 50, (newMsgs) => {
          setMessages(newMsgs);
        });
      }

      // Typing indicators
      typingSubRef.current = TypingService.subscribeToTyping(activeChatId, (users) => {
        setTypingUsers(users);
      });
    } else {
      setMessages([]);
      setTypingUsers([]);
    }

    return () => {
      if (messageSubRef.current) messageSubRef.current();
      if (typingSubRef.current) typingSubRef.current();
    };
  }, [activeChatId, activeServer]);

  const setActiveChat = useCallback((chatId: string | null) => {
    setActiveChatId(chatId);
  }, []);

  const loadDMs = useCallback(async () => {
    setLoading(true);
    try {
      const userDMs = await DMService.getDMs();
      setDms(userDMs);
      dmIdsRef.current = new Set(userDMs.map(dm => dm.id));
    } catch (err) {
      console.error('Error loading DMs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (serverId: string | null, chatId: string, data: SendMessageData) => {
    if (serverId) {
      return await MessageService.sendMessage(serverId, chatId, data);
    } else {
      return await DMService.sendDMMessage(chatId, data);
    }
  }, []);

  const sendTyping = useCallback(async (chatId: string) => {
    if (userProfile) {
      await TypingService.sendTyping(chatId, userProfile.displayName);
    }
  }, [userProfile]);

  const clearTyping = useCallback(async (chatId: string) => {
    await TypingService.clearTyping(chatId);
  }, []);

  const addReaction = useCallback(async (serverId: string | null, channelId: string, messageId: string, emoji: string) => {
    if (serverId) {
      // Server channel reaction
      await MessageService.addReaction(serverId, channelId, messageId, emoji);
    } else {
      // DM reaction — update the message document in the DM sub-collection.
      try {
        const { db } = await import('@/config/firebase');
        const msgRef = db
          .collection('directMessages')
          .doc(channelId)
          .collection('messages')
          .doc(messageId);
        const snap = await msgRef.get();
        if (!snap.exists) return;
        const reactions: Record<string, string[]> = (snap.data()?.reactions as any) || {};
        const uid = user?.uid;
        if (!uid) return;
        const users: string[] = reactions[emoji] || [];
        if (users.includes(uid)) {
          reactions[emoji] = users.filter((u: string) => u !== uid);
        } else {
          reactions[emoji] = [...users, uid];
        }
        await msgRef.update({ reactions });
      } catch (err) {
        console.error('Error adding DM reaction:', err);
      }
    }
  }, [user]);

  const pinChat = useCallback(async (chatId: string) => {
    if (!user) return;
    try {
      const userRef = (await import('@/config/firebase')).db.collection('users').doc(user.uid);
      const doc = await userRef.get();
      const pinnedChats: string[] = doc.data()?.pinnedChats || [];
      const isPinned = pinnedChats.includes(chatId);
      await userRef.update({
        pinnedChats: isPinned
          ? pinnedChats.filter((id: string) => id !== chatId)
          : [...pinnedChats, chatId],
      });
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  }, [user]);

  const createDM = useCallback(async (participantIds: string[]) => {
    return await DMService.createDM(participantIds);
  }, []);

  const value = useMemo(() => ({
    dms,
    chats: dms,
    messages,
    loading,
    activeChatId,
    typingUsers,
    setActiveChat,
    loadDMs,
    refreshDMs: loadDMs,
    sendMessage,
    sendTyping,
    clearTyping,
    addReaction,
    pinChat,
    createDM,
  }), [dms, messages, loading, activeChatId, typingUsers, setActiveChat, loadDMs, sendMessage, sendTyping, clearTyping, addReaction, pinChat, createDM]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) throw new Error('useChat must be used within ChatProvider');
  return context;
}
