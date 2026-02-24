import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import ServerService, { Server } from '@/services/ServerService';
import ChannelService, { Channel } from '@/services/ChannelService';
import { db } from '@/config/firebase';

interface ServerContextType {
  userServers: Server[];
  exploreServers: Server[];
  channels: Channel[];
  loading: boolean;
  activeServer: Server | null;
  activeChannel: Channel | null;
  setActiveServer: (server: Server | string | null) => void;
  setActiveChannel: (channel: Channel | string | null) => void;
  refreshExploreServers: () => Promise<void>;
  createServer: (data: any) => Promise<string>;
  joinServer: (serverId: string) => Promise<void>;
  leaveServer: (serverId: string) => Promise<void>;
  updateServer: (serverId: string, updates: Partial<Server>) => Promise<void>;
  deleteServer: (serverId: string) => Promise<void>;
  // For backward compatibility while refactoring
  servers: Server[];
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export function ServerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userServers, setUserServers] = useState<Server[]>([]);
  const [exploreServers, setExploreServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServerState] = useState<Server | null>(null);
  const [activeChannel, setActiveChannelState] = useState<Channel | null>(null);

  // Real-time listener for user's joined servers
  useEffect(() => {
    if (!user) {
      setUserServers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = ServerService.subscribeToUserServers(user.uid, (servers) => {
      setUserServers(servers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Initial fetch for explore servers
  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const { servers } = await ServerService.getPublicServers(undefined, 20);
        setExploreServers(servers);
      } catch (err) {
        console.error('Error fetching explore servers:', err);
      }
    };
    fetchExplore();
  }, []);

  // Subscribe to channels when active server changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (activeServer) {
      unsubscribe = ChannelService.subscribeToChannels(activeServer.id, (newChannels) => {
        setChannels(newChannels);
      });
    } else {
      setChannels([]);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeServer]);

  const [channels, setChannels] = useState<Channel[]>([]);

  const setActiveServer = useCallback((serverOrId: Server | string | null) => {
    if (!serverOrId) {
      setActiveServerState(null);
      return;
    }
    if (typeof serverOrId === 'string') {
      const server = userServers.find(s => s.id === serverOrId) || exploreServers.find(s => s.id === serverOrId);
      if (server) setActiveServerState(server);
    } else {
      setActiveServerState(serverOrId);
    }
  }, [userServers, exploreServers]);

  const setActiveChannel = useCallback((channelOrId: Channel | string | null) => {
    if (!channelOrId) {
      setActiveChannelState(null);
      return;
    }
    if (typeof channelOrId === 'string') {
      const channel = channels.find(c => c.id === channelOrId);
      if (channel) setActiveChannelState(channel);
    } else {
      setActiveChannelState(channelOrId);
    }
  }, [channels]);

  const refreshExploreServers = useCallback(async () => {
    try {
      const { servers } = await ServerService.getPublicServers();
      setExploreServers(servers);
    } catch (err) {
      console.error('Error refreshing explore servers:', err);
    }
  }, []);

  const createServer = useCallback(async (data: any) => {
    const serverId = await ServerService.createServer(data);
    return serverId;
  }, []);

  const joinServer = useCallback(async (serverId: string) => {
    await ServerService.joinServer(serverId);
    // Real-time listener will pick up the new server
  }, []);

  const leaveServer = useCallback(async (serverId: string) => {
    await ServerService.leaveServer(serverId);
    if (activeServer?.id === serverId) {
      setActiveServerState(null);
    }
  }, [activeServer]);

  const updateServer = useCallback(async (serverId: string, updates: Partial<Server>) => {
    await ServerService.updateServer(serverId, updates);
  }, []);

  const deleteServer = useCallback(async (serverId: string) => {
    await ServerService.deleteServer(serverId);
    if (activeServer?.id === serverId) {
      setActiveServerState(null);
    }
  }, [activeServer]);

  const value = useMemo(() => ({
    userServers,
    exploreServers,
    servers: userServers, // Alias for backward compatibility
    channels,
    loading,
    activeServer,
    activeChannel,
    setActiveServer,
    setActiveChannel,
    refreshExploreServers,
    createServer,
    joinServer,
    leaveServer,
    updateServer,
    deleteServer,
  }), [userServers, exploreServers, channels, loading, activeServer, activeChannel, setActiveServer, setActiveChannel, refreshExploreServers, createServer, joinServer, leaveServer, updateServer, deleteServer]);

  return (
    <ServerContext.Provider value={value}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServers() {
  const context = useContext(ServerContext);
  if (context === undefined) throw new Error('useServers must be used within ServerProvider');
  return context;
}
