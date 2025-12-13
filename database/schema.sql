-- =============================================
-- ChatBox Complete Database Schema
-- Production-Ready Supabase PostgreSQL Schema
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  full_name TEXT NOT NULL CHECK (char_length(full_name) >= 1),
  avatar_url TEXT,
  bio TEXT CHECK (char_length(bio) <= 500),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- =============================================
-- CHATS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chats_type ON chats(type);
CREATE INDEX IF NOT EXISTS idx_chats_created_by ON chats(created_by);

-- =============================================
-- CHAT_MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS chat_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 1),
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'audio', 'file', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'mention', 'system', 'chat_invite')),
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================
-- USER_SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  vibration_enabled BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'en',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BLOCKED_USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS blocked_users (
  blocker_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- =============================================
-- MESSAGE_READ_RECEIPTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user ON message_read_receipts(user_id);

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage buckets for avatars and files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-files', 'chat-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for chat files
CREATE POLICY "Chat files accessible to chat members"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-files'
    AND EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.file_url LIKE '%' || name
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Chat members can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own uploaded files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chat-files'
    AND EXISTS (
      SELECT 1 FROM messages
      WHERE messages.file_url LIKE '%' || name
      AND messages.user_id = auth.uid()
    )
  );

-- =============================================
-- FUNCTIONS
-- =============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User')
  );
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- CHATS POLICIES
DROP POLICY IF EXISTS "Users can view chats they are members of" ON chats;
CREATE POLICY "Users can view chats they are members of"
  ON chats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = chats.id
      AND chat_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create chats" ON chats;
CREATE POLICY "Users can create chats"
  ON chats FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Chat owners can update chats" ON chats;
CREATE POLICY "Chat owners can update chats"
  ON chats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = chats.id
      AND chat_members.user_id = auth.uid()
      AND chat_members.role IN ('owner', 'admin')
    )
  );

-- CHAT_MEMBERS POLICIES
DROP POLICY IF EXISTS "Users can view chat members of their chats" ON chat_members;
CREATE POLICY "Users can view chat members of their chats"
  ON chat_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members AS cm
      WHERE cm.chat_id = chat_members.chat_id
      AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Chat owners can add members" ON chat_members;
CREATE POLICY "Chat owners can add members"
  ON chat_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_members AS cm
      WHERE cm.chat_id = chat_members.chat_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
    )
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Users can leave chats" ON chat_members;
CREATE POLICY "Users can leave chats"
  ON chat_members FOR DELETE
  USING (auth.uid() = user_id);

-- MESSAGES POLICIES
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
CREATE POLICY "Users can view messages in their chats"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = messages.chat_id
      AND chat_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Chat members can send messages" ON messages;
CREATE POLICY "Chat members can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = messages.chat_id
      AND chat_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (auth.uid() = user_id);

-- NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- USER_SETTINGS POLICIES
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- BLOCKED_USERS POLICIES
DROP POLICY IF EXISTS "Users can view own blocks" ON blocked_users;
CREATE POLICY "Users can view own blocks"
  ON blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can block others" ON blocked_users;
CREATE POLICY "Users can block others"
  ON blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can unblock others" ON blocked_users;
CREATE POLICY "Users can unblock others"
  ON blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);

-- MESSAGE_READ_RECEIPTS POLICIES
DROP POLICY IF EXISTS "Users can view read receipts in their chats" ON message_read_receipts;
CREATE POLICY "Users can view read receipts in their chats"
  ON message_read_receipts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_members cm ON cm.chat_id = m.chat_id
ALTER PUBLICATION supabase_realtime ADD TABLE message_read_receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
      WHERE m.id = message_read_receipts.message_id
      AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own read receipts" ON message_read_receipts;
CREATE POLICY "Users can insert own read receipts"
  ON message_read_receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- REALTIME PUBLICATION
-- =============================================

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_members;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================
-- INITIAL DATA & INDEXES
-- =============================================

-- Add full-text search for messages
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON messages USING gin(to_tsvector('english', content));

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_user ON chat_members(chat_id, user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at DESC);

-- Table comments for documentation
COMMENT ON TABLE profiles IS 'User profiles with extended information and online status';
COMMENT ON TABLE chats IS 'Chat conversations supporting both direct and group messaging';
COMMENT ON TABLE chat_members IS 'Junction table managing chat membership and roles';
COMMENT ON TABLE messages IS 'All chat messages with support for text, media, and file types';
COMMENT ON TABLE message_read_receipts IS 'Tracks which users have read which messages';
COMMENT ON TABLE notifications IS 'User notifications for mentions, messages, and system events';
COMMENT ON TABLE user_settings IS 'User preferences including theme, notifications, and language';
COMMENT ON TABLE blocked_users IS 'Manages blocked user relationships for privacy';

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get unread message count for a chat
CREATE OR REPLACE FUNCTION get_unread_count(p_chat_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM messages m
  WHERE m.chat_id = p_chat_id
  AND m.user_id != p_user_id
  AND NOT EXISTS (
    SELECT 1 FROM message_read_receipts mrr
    WHERE mrr.message_id = m.id
    AND mrr.user_id = p_user_id
  );
$$ LANGUAGE SQL STABLE;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(p_chat_id UUID, p_user_id UUID)
RETURNS VOID AS $$
  INSERT INTO message_read_receipts (message_id, user_id)
  SELECT m.id, p_user_id
  FROM messages m
  WHERE m.chat_id = p_chat_id
  AND m.user_id != p_user_id
  AND NOT EXISTS (
    SELECT 1 FROM message_read_receipts mrr
    WHERE mrr.message_id = m.id
    AND mrr.user_id = p_user_id
  )
  ON CONFLICT (message_id, user_id) DO NOTHING;
$$ LANGUAGE SQL VOLATILE;

COMMENT ON FUNCTION get_unread_count IS 'Returns the count of unread messages in a chat for a specific user';
COMMENT ON FUNCTION mark_messages_read IS 'Marks all messages in a chat as read for a specific user';

-- =============================================
-- END OF SCHEMA
-- =============================================