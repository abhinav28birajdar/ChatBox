import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import FriendService, { Friendship } from '@/services/FriendService';
import UserService from '@/services/UserService';
import { UserProfile } from '@/types';

interface FriendContextType {
  friends: UserProfile[];
  pendingRequests: Friendship[];
  sentRequests: Friendship[];
  blockedUsers: string[];
  loading: boolean;
  sendRequest: (userId: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendshipId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  refreshFriends: () => Promise<void>;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export function FriendProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to resolve profiles from friendships
  const resolveFriendProfiles = async (friendships: Friendship[], currentUserId: string) => {
    const profiles = await Promise.all(
      friendships.map(async (f) => {
        const friendId = f.userId === currentUserId ? f.friendId : f.userId;
        const profile = await UserService.getProfile(friendId);
        return profile;
      })
    );
    return profiles.filter((p: UserProfile | null): p is UserProfile => p !== null);
  };

  useEffect(() => {
    if (!user) {
      setFriends([]);
      setPendingRequests([]);
      setSentRequests([]);
      setBlockedUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubFriends = FriendService.subscribeToFriends(user.uid, async (friendships) => {
      const friendProfiles = await resolveFriendProfiles(friendships, user.uid);
      setFriends(friendProfiles);
      setLoading(false);
    });

    const unsubIncoming = FriendService.subscribeToFriendRequests(user.uid, 'incoming', async (requests) => {
      const enhanced = await Promise.all(
        requests.map(async (req) => {
          const profile = await UserService.getProfile(req.userId);
          return {
            ...req,
            senderName: profile?.displayName || 'User',
            senderAvatar: profile?.avatar,
            // Keep original userId (UID) — do NOT overwrite with username.
          };
        })
      );
      setPendingRequests(enhanced);
    });

    const unsubOutgoing = FriendService.subscribeToFriendRequests(user.uid, 'outgoing', async (requests) => {
      const enhanced = await Promise.all(
        requests.map(async (req) => {
          const profile = await UserService.getProfile(req.friendId);
          return {
            ...req,
            receiverName: profile?.displayName || 'User',
            receiverAvatar: profile?.avatar,
          };
        })
      );
      setSentRequests(enhanced);
    });

    // Blocked users (one-time fetch or you could add a listener)
    FriendService.getBlockedUsers().then(setBlockedUsers);

    return () => {
      unsubFriends();
      unsubIncoming();
      unsubOutgoing();
    };
  }, [user]);

  const sendRequest = useCallback(async (username: string) => {
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
    const profile = await UserService.getUserByUsername(cleanUsername);
    if (!profile) {
      throw new Error('User not found');
    }
    await FriendService.sendFriendRequest(profile.uid);
  }, []);

  const acceptRequest = useCallback(async (requestId: string) => {
    await FriendService.acceptFriendRequest(requestId);
  }, []);

  const declineRequest = useCallback(async (requestId: string) => {
    await FriendService.declineFriendRequest(requestId);
  }, []);

  const removeFriend = useCallback(async (friendshipId: string) => {
    await FriendService.removeFriend(friendshipId);
  }, []);

  const blockUser = useCallback(async (userId: string) => {
    await FriendService.blockUser(userId);
    setBlockedUsers(prev => [...prev, userId]);
  }, []);

  const unblockUser = useCallback(async (userId: string) => {
    await FriendService.unblockUser(userId);
    setBlockedUsers(prev => prev.filter(id => id !== userId));
  }, []);

  const refreshFriends = useCallback(async () => {
    // Subscriptions handle this, but keeping it for compat
  }, []);

  const value = useMemo(() => ({
    friends,
    pendingRequests,
    sentRequests,
    blockedUsers,
    loading,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    blockUser,
    unblockUser,
    refreshFriends,
  }), [friends, pendingRequests, sentRequests, blockedUsers, loading, sendRequest, acceptRequest, declineRequest, removeFriend, blockUser, unblockUser, refreshFriends]);

  return (
    <FriendContext.Provider value={value}>
      {children}
    </FriendContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendContext);
  if (context === undefined) throw new Error('useFriends must be used within FriendProvider');
  return context;
}
