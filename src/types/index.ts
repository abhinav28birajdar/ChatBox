// ============================================
// ChatBox - Complete TypeScript Type Definitions
// ============================================

// ── User Types ──────────────────────────────
export type UserStatus = 'online' | 'offline' | 'busy' | 'away' | 'dnd';
export type UserRole = 'customer' | 'seller' | 'admin';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  status: UserStatus;
  customStatus?: string;
  dateOfBirth?: string;
  createdAt: string;
  lastLogin?: string;
  isVerified: boolean;
  interests?: string[];
  connectedAccounts?: ConnectedAccount[];
  settings?: UserSettings;
}

export interface UserProfile {
  id: string; // Alias for uid
  uid: string;
  username: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  avatar: string;
  banner?: string;
  bio: string;
  role: UserRole;
  status: string;
  customStatus?: string;
  statusEmoji?: string;
  interests: string[];
  createdAt: any; // Can be Timestamp or string/Date depending on perspective
  isVerified?: boolean;
  onboardingComplete?: boolean;
  stats?: {
    level: number;
    xp: number;
    coins: number;
    revenue?: number; // For sellers
    orderCount?: number;
  };
  address?: Address[];
  settings?: {
    privacy: {
      friendRequests: 'everyone' | 'friends_of_friends' | 'none';
      directMessages: 'everyone' | 'friends' | 'none';
      serverInvites: 'everyone' | 'friends' | 'none';
    };
    notifications: {
      mentions: boolean;
      directMessages: boolean;
      friendRequests: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
}

export interface Address {
  id: string;
  label: string; // Home, Office, etc.
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// Legacy compat
export interface SimpleUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy' | 'away';
}

export interface ConnectedAccount {
  platform: 'spotify' | 'steam' | 'twitter' | 'github';
  username: string;
  isPublic: boolean;
}

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  dmNotifications: boolean;
  mentionNotifications: boolean;
  friendRequestNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface PrivacySettings {
  publicProfile: boolean;
  showOnlineStatus: boolean;
  allowDMs: 'everyone' | 'friends' | 'none';
  readReceipts: boolean;
}

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  messageDisplay: 'cozy' | 'compact';
  fontSize: number;
  animationsEnabled: boolean;
}

// ── Chat / Direct Message Types ─────────────
export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  time: string;
  unread: number;
  avatar?: string;
  isGroup: boolean;
  members: string[];
  isPinned?: boolean;
  isMuted?: boolean;
  createdAt: string;
  createdBy: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  channelId?: string;
  chatId?: string;
  type: MessageType;
  attachments?: Attachment[];
  replyTo?: ReplyReference;
  reactions?: Reaction[];
  mentions?: string[];
  isPinned?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  editedAt?: string;
  createdAt: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'voice' | 'system';

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'file' | 'voice';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface ReplyReference {
  messageId: string;
  content: string;
  senderId: string;
  senderName: string;
}

export interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

// ── Server Types ────────────────────────────
export interface Server {
  id: string;
  name: string;
  icon?: string;
  banner?: string;
  description?: string;
  ownerId: string;
  type: 'public' | 'private';
  category: ServerCategory;
  memberCount: number;
  onlineCount?: number;
  inviteCode?: string;
  createdAt: string;
  features?: string[];
}

export type ServerCategory =
  | 'gaming'
  | 'education'
  | 'technology'
  | 'art'
  | 'music'
  | 'sports'
  | 'entertainment'
  | 'community'
  | 'other';

export interface ServerMember {
  userId: string;
  serverId: string;
  roles: string[];
  nickname?: string;
  joinedAt: string;
  isMuted?: boolean;
  isDeafened?: boolean;
}

export interface ServerRole {
  id: string;
  name: string;
  color: string;
  position: number;
  permissions: Permission[];
  isDefault?: boolean;
  serverId: string;
}

export type Permission =
  | 'manage_server'
  | 'manage_channels'
  | 'manage_roles'
  | 'kick_members'
  | 'ban_members'
  | 'send_messages'
  | 'manage_messages'
  | 'mention_everyone'
  | 'add_reactions'
  | 'use_voice'
  | 'mute_members'
  | 'deafen_members'
  | 'move_members'
  | 'view_audit_log'
  | 'manage_webhooks'
  | 'attach_files'
  | 'embed_links';

export interface ServerInvite {
  id: string;
  code: string;
  serverId: string;
  channelId?: string;
  createdBy: string;
  maxUses?: number;
  uses: number;
  expiresAt?: string;
  createdAt: string;
}

// ── Channel Types ───────────────────────────
export interface Channel {
  id: string;
  serverId: string;
  name: string;
  type: ChannelType;
  categoryId?: string;
  topic?: string;
  position: number;
  isPrivate: boolean;
  isNSFW?: boolean;
  slowMode?: number;
  lastMessageAt?: string;
  permissionOverrides?: ChannelPermissionOverride[];
}

export type ChannelType = 'text' | 'voice' | 'announcement';

export interface ChannelCategory {
  id: string;
  serverId: string;
  name: string;
  position: number;
  isCollapsed?: boolean;
}

export interface ChannelPermissionOverride {
  roleId: string;
  allow: Permission[];
  deny: Permission[];
}

// ── Friend Types ────────────────────────────
export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  createdAt: string;
}

export interface BlockedUser {
  id: string;
  userId: string;
  blockedUserId: string;
  blockedAt: string;
}

// ── Notification Types ──────────────────────
export type NotificationType =
  | 'mention'
  | 'dm'
  | 'friend_request'
  | 'server_invite'
  | 'system'
  | 'message'
  | 'reaction';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  data?: Record<string, string>;
  sourceUserId?: string;
  sourceUserName?: string;
  sourceUserAvatar?: string;
  serverId?: string;
  channelId?: string;
  messageId?: string;
  createdAt: string;
  actionButtons?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

// ── Voice / Video Types ─────────────────────
export interface VoiceState {
  userId: string;
  channelId: string;
  serverId: string;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  hasVideo: boolean;
  isScreenSharing: boolean;
}

export interface CallSession {
  id: string;
  type: 'voice' | 'video';
  participants: string[];
  channelId?: string;
  chatId?: string;
  startedAt: string;
  startedBy: string;
  isActive: boolean;
}

// ── Moderation Types ────────────────────────
export interface AuditLogEntry {
  id: string;
  serverId: string;
  actionType: AuditActionType;
  performedBy: string;
  targetUser?: string;
  targetChannel?: string;
  reason?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export type AuditActionType =
  | 'member_kick'
  | 'member_ban'
  | 'member_unban'
  | 'member_role_update'
  | 'channel_create'
  | 'channel_update'
  | 'channel_delete'
  | 'role_create'
  | 'role_update'
  | 'role_delete'
  | 'message_delete'
  | 'message_pin'
  | 'server_update'
  | 'invite_create'
  | 'invite_delete';

export interface Report {
  id: string;
  reporterId: string;
  targetUserId?: string;
  targetMessageId?: string;
  serverId?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface BannedUser {
  userId: string;
  serverId: string;
  bannedBy: string;
  reason?: string;
  bannedAt: string;
}

// ── Search Types ────────────────────────────
export interface SearchResult {
  type: 'message' | 'user' | 'server' | 'channel';
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  context?: string;
  timestamp?: string;
}

export interface SearchFilters {
  type?: SearchResult['type'];
  dateFrom?: string;
  dateTo?: string;
  fromUser?: string;
  inServer?: string;
  inChannel?: string;
  hasAttachments?: boolean;
  hasLinks?: boolean;
}

// ── Navigation Types ────────────────────────
export interface ChatRoomParams {
  id: string;
  name: string;
  avatar?: string;
  isGroup?: string;
}

export interface ChannelParams {
  serverId: string;
  channelId: string;
  channelName: string;
}

export interface UserProfileParams {
  userId: string;
}

// ── Utility Types ───────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  cursor?: string;
  total?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
