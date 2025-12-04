/**
 * New Chat Screen
 * Create new conversations and group chats
 */

import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { SafeContainer } from '@/components/common/safe-container';
import { Avatar, Button, Card, LoadingSpinner } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { borderRadius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore, useChatStore } from '@/store';
import { User } from '@/types';

interface UserListItemProps {
  user: User;
  isSelected: boolean;
  onPress: (user: User) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, isSelected, onPress }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={() => onPress(user)} activeOpacity={0.7}>
      <Card variant="filled" padding="sm" style={styles.userItem}>
        <View style={styles.userContent}>
          <Avatar
            size={40}
            imageUri={user.avatar_url}
            name={user.full_name}
            showStatus={true}
            status="online"
          />

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user.full_name}
            </Text>
            <Text style={[styles.userEmail, { color: theme.colors.textMuted }]}>
              {user.email}
            </Text>
          </View>

          {isSelected && (
            <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
              <IconSymbol name="checkmark" size={16} color={theme.colors.textInverse} />
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default function NewChatScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { createDirectChat, createGroupChat, searchUsers } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState('');

  const searchForUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchUsers(query);
      // Filter out current user
      setUsers(results.filter((u: any) => u.id !== user?.id));
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, searchUsers]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchForUsers(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, searchForUsers]);

  const handleUserSelect = (selectedUser: User) => {
    if (chatType === 'direct') {
      // For direct chats, select only one user
      setSelectedUsers([selectedUser]);
    } else {
      // For group chats, allow multiple selections
      setSelectedUsers(prev => {
        const isAlreadySelected = prev.some(u => u.id === selectedUser.id);
        if (isAlreadySelected) {
          return prev.filter(u => u.id !== selectedUser.id);
        } else {
          return [...prev, selectedUser];
        }
      });
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;

    setIsCreating(true);
    try {
      let chatId: string | null;

      if (chatType === 'direct') {
        chatId = await createDirectChat(selectedUsers[0].id);
      } else {
        if (!groupName.trim()) {
          alert('Please enter a group name');
          return;
        }
        chatId = await createGroupChat(
          groupName.trim(),
          selectedUsers.map((u: any) => u.id)
        );
      }

      // Navigate to the new chat
      if (chatId) {
        router.replace(`/chat/conversation?chatId=${chatId}`);
      } else {
        alert('Failed to create chat. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
      alert('Failed to create chat. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const renderSelectedUser = ({ item: selectedUser }: { item: User }) => (
    <MotiView
      animate={{ opacity: 1, scale: 1 }}
      from={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'timing', duration: 200 }}
      style={styles.selectedUserChip}
    >
      <Avatar size={24} imageUri={selectedUser.avatar_url} name={selectedUser.full_name} />
      <Text style={[styles.selectedUserName, { color: theme.colors.text }]}>
        {selectedUser.full_name}
      </Text>
      <TouchableOpacity
        onPress={() => handleUserSelect(selectedUser)}
        style={styles.removeUserButton}
      >
        <IconSymbol name="xmark" size={12} color={theme.colors.textMuted} />
      </TouchableOpacity>
    </MotiView>
  );

  const renderUser = ({ item: foundUser }: { item: User }) => (
    <UserListItem
      user={foundUser}
      isSelected={selectedUsers.some(u => u.id === foundUser.id)}
      onPress={handleUserSelect}
    />
  );

  const canCreateChat = selectedUsers.length > 0 && 
    (chatType === 'direct' || (chatType === 'group' && groupName.trim()));

  return (
    <SafeContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            New Chat
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Chat Type Toggle */}
        <View style={styles.chatTypeContainer}>
          <TouchableOpacity
            style={[
              styles.chatTypeButton,
              chatType === 'direct' && { backgroundColor: theme.colors.primary },
              { backgroundColor: chatType === 'direct' ? theme.colors.primary : theme.colors.surface },
            ]}
            onPress={() => setChatType('direct')}
          >
            <Text
              style={[
                styles.chatTypeText,
                { color: chatType === 'direct' ? theme.colors.textInverse : theme.colors.text },
              ]}
            >
              Direct Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chatTypeButton,
              { backgroundColor: chatType === 'group' ? theme.colors.primary : theme.colors.surface },
            ]}
            onPress={() => setChatType('group')}
          >
            <Text
              style={[
                styles.chatTypeText,
                { color: chatType === 'group' ? theme.colors.textInverse : theme.colors.text },
              ]}
            >
              Group Chat
            </Text>
          </TouchableOpacity>
        </View>

        {/* Group Name Input */}
        {chatType === 'group' && (
          <MotiView
            animate={{ opacity: 1, height: 'auto' }}
            from={{ opacity: 0, height: 0 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            <TextInput
              style={[
                styles.groupNameInput,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Enter group name..."
              placeholderTextColor={theme.colors.textMuted}
              value={groupName}
              onChangeText={setGroupName}
            />
          </MotiView>
        )}

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <View style={styles.selectedUsersContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Selected ({selectedUsers.length})
            </Text>
            <FlatList
              data={selectedUsers}
              renderItem={renderSelectedUser}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedUsersList}
            />
          </View>
        )}

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
          <IconSymbol
            name="magnifyingglass"
            size={20}
            color={theme.colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search users..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Users List */}
        <View style={styles.usersContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner size={32} color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
                Searching users...
              </Text>
            </View>
          ) : users.length > 0 ? (
            <FlatList
              data={users}
              renderItem={renderUser}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.usersList}
            />
          ) : searchQuery.length > 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="person.slash" size={48} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                No users found
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <IconSymbol name="magnifyingglass" size={48} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                Search for users to start a conversation
              </Text>
            </View>
          )}
        </View>

        {/* Create Button */}
        {canCreateChat && (
          <MotiView
            animate={{ opacity: 1, translateY: 0 }}
            from={{ opacity: 0, translateY: 50 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.createButtonContainer}
          >
            <Button
              title={isCreating ? 'Creating...' : `Create ${chatType === 'direct' ? 'Chat' : 'Group'}`}
              onPress={handleCreateChat}
              disabled={isCreating}
              isLoading={isCreating}
              style={styles.createButton}
            />
          </MotiView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  },
  chatTypeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  chatTypeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  chatTypeText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  groupNameInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.md,
    marginBottom: spacing.md,
  },
  selectedUsersContainer: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedUsersList: {
    paddingBottom: spacing.sm,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
  selectedUserName: {
    fontSize: typography.fontSizes.sm,
    marginHorizontal: spacing.xs,
    maxWidth: 80,
  },
  removeUserButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.md,
  },
  usersContainer: {
    flex: 1,
  },
  usersList: {
    paddingBottom: spacing.lg,
  },
  userItem: {
    marginBottom: spacing.sm,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  userEmail: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
  },
  createButtonContainer: {
    paddingVertical: spacing.md,
  },
  createButton: {
    marginTop: spacing.md,
  },
});