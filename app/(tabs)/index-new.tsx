/**
 * Chats Screen (Home)
 * Main chat list with search and real-time updates
 */

import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { EmptyState } from '@/components/common/empty-state';
import { SafeContainer } from '@/components/common/safe-container';
import { Avatar, Card, ChatListSkeleton } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { borderRadius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore, useChatStore } from '@/store';
import { Chat } from '@/types';

export default function ChatsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { chats, isLoading, loadChats } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredChats = chats.filter((chat: any) => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.last_message?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user, loadChats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  }, [loadChats]);

  const handleChatPress = (chat: Chat) => {
    router.push(`/chat/conversation?chatId=${chat.id}`);
  };

  const handleNewChat = () => {
    router.push('/chat/new-chat');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderChatItem = ({ item: chat }: { item: Chat }) => (
    <MotiView
      animate={{ opacity: 1, translateX: 0 }}
      from={{ opacity: 0, translateX: -50 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      <TouchableOpacity
        onPress={() => handleChatPress(chat)}
        activeOpacity={0.7}
      >
        <Card variant="filled" padding="md" style={styles.chatItem}>
          <View style={styles.chatContent}>
            <Avatar
              size={50}
              imageUri={chat.avatar_url}
              name={chat.name || 'Chat'}
              showStatus={true}
              status="online"
            />
            
            <View style={styles.chatDetails}>
              <View style={styles.chatHeader}>
                <Text
                  style={[
                    styles.chatName,
                    { color: theme.colors.text }
                  ]}
                  numberOfLines={1}
                >
                  {chat.name || `${chat.type === 'direct' ? 'Direct' : 'Group'} Chat`}
                </Text>
                
                {chat.last_message && (
                  <Text
                    style={[
                      styles.chatTime,
                      { color: theme.colors.textMuted }
                    ]}
                  >
                    {formatTime(chat.last_message.created_at)}
                  </Text>
                )}
              </View>
              
              <View style={styles.messagePreview}>
                <Text
                  style={[
                    styles.lastMessage,
                    { color: theme.colors.textSecondary }
                  ]}
                  numberOfLines={1}
                >
                  {chat.last_message?.content || 'No messages yet'}
                </Text>
                
                {chat.unread_count && chat.unread_count > 0 && (
                  <View
                    style={[
                      styles.unreadBadge,
                      { backgroundColor: theme.colors.primary }
                    ]}
                  >
                    <Text
                      style={[
                        styles.unreadCount,
                        { color: theme.colors.textInverse }
                      ]}
                    >
                      {chat.unread_count > 99 ? '99+' : chat.unread_count}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </MotiView>
  );

  if (isLoading && chats.length === 0) {
    return (
      <SafeContainer>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Chats
            </Text>
          </View>
          <ChatListSkeleton count={10} />
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Chats
          </Text>
          <TouchableOpacity
            onPress={handleNewChat}
            style={[styles.newChatButton, { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus" size={20} color={theme.colors.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <MotiView
          style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}
          animate={{ opacity: 1, translateY: 0 }}
          from={{ opacity: 0, translateY: -20 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
        >
          <IconSymbol 
            name="magnifyingglass" 
            size={20} 
            color={theme.colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search chats..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearch}
            >
              <IconSymbol 
                name="xmark.circle.fill" 
                size={20} 
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </MotiView>

        {/* Chat List */}
        {filteredChats.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No chats found' : 'No chats yet'}
            subtitle={searchQuery ? 'Try searching with different keywords' : 'Start a new conversation to get started'}
            iconName={searchQuery ? 'magnifyingglass' : 'message.circle'}
            actionLabel={searchQuery ? undefined : 'Start New Chat'}
            onAction={searchQuery ? undefined : handleNewChat}
          />
        ) : (
          <FlashList
            data={filteredChats}
            renderItem={renderChatItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
  },
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    paddingVertical: spacing.xs,
  },
  clearSearch: {
    marginLeft: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  chatItem: {
    marginBottom: spacing.sm,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chatName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    flex: 1,
  },
  chatTime: {
    fontSize: typography.fontSizes.sm,
    marginLeft: spacing.sm,
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: typography.fontSizes.md,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    marginLeft: spacing.sm,
  },
  unreadCount: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
});