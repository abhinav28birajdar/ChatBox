# 💬 ChatBox - Production-Ready React Native Chat Application

A modern, feature-rich chat application built with React Native, Expo, and Supabase. ChatBox provides real-time messaging, user authentication, profile management, and a beautiful dark mode UI.

[![React Native](https://img.shields.io/badge/React%20Native-0.76-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E.svg)](https://supabase.com/)

## ✨ Features

### 🔐 Authentication & Security
- **Email/Password Authentication** - Secure user registration and login
- **Email Verification** - Two-factor authentication support
- **Password Recovery** - Complete account recovery flow
- **Secure Storage** - Encrypted API key management with expo-secure-store
- **Row Level Security** - Database-level access control

### 💬 Chat & Messaging
- **Real-time Messaging** - Instant message delivery with Supabase Realtime
- **Direct Messages** - One-on-one private conversations
- **Group Chats** - Multi-user group messaging
- **Message Status** - Read receipts and delivery indicators
- **User Search** - Find and connect with other users

### 👤 Profile Management
- **User Profiles** - Customizable user information
- **Avatar Upload** - Profile photo management
- **Bio & Status** - Personal information display
- **Privacy Settings** - Granular privacy controls
- **Account Verification** - Verified badge system

### 🎨 Modern UI/UX
- **Dark Mode** - Automatic light/dark theme switching
- **Smooth Animations** - Moti-powered transitions
- **Responsive Design** - Optimized for all screen sizes
- **Modern Components** - Beautiful, accessible UI components
- **Performance** - FlashList for optimized scrolling

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Expo CLI** (installed globally)
- **Supabase Account** (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/chatbox.git
cd chatbox
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**

Create a new Supabase project at [https://supabase.com](https://supabase.com)

4. **Run database migrations**

Execute the SQL schema located in `database/schema.sql` in your Supabase SQL editor:

```sql
-- Copy and paste contents of database/schema.sql
```

This will create:
- User profiles table
- Chats and chat members tables
- Messages table
- Notifications table
- User settings and blocked users tables
- Row Level Security policies
- Database triggers and functions
- Necessary indexes for performance

5. **Start the development server**
```bash
npm start
```

6. **Configure Supabase credentials**

On first launch, you'll be prompted to enter:
- Supabase Project URL (e.g., `https://xxxxx.supabase.co`)
- Supabase Anon/Public Key

These are securely stored on your device using encrypted storage.

## 📱 Running the App

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web
```bash
npm run web
```

## 🏗️ Project Structure

```
chatbox/
├── app/                      # Application screens
│   ├── (auth)/              # Authentication flows
│   │   ├── welcome.tsx      # Welcome screen
│   │   ├── sign-in.tsx      # Sign in screen
│   │   ├── sign-up.tsx      # Registration screen
│   │   ├── forgot-password.tsx
│   │   ├── supabase-config.tsx  # API key setup
│   │   └── onboarding/      # Onboarding slides
│   ├── (tabs)/              # Main app tabs
│   │   ├── index.tsx        # Home/Chats
│   │   └── explore.tsx      # Discover
│   ├── chat/                # Chat screens
│   │   ├── new-chat.tsx     # Create new chat
│   │   └── [id].tsx         # Chat conversation
│   └── profile/             # Profile management
│       ├── index.tsx        # View profile
│       └── edit.tsx         # Edit profile
├── components/              # Reusable components
│   ├── ui/                  # UI components
│   │   ├── input.tsx
│   │   ├── collapsible.tsx
│   │   └── icon-symbol.tsx
│   ├── forms/               # Form components
│   └── common/              # Common components
├── constants/               # App constants
│   └── theme.ts            # Theme configuration
├── database/               # Database
│   └── schema.sql          # PostgreSQL schema
├── hooks/                  # Custom React hooks
│   ├── use-theme.ts
│   └── use-color-scheme.ts
├── store/                  # State management
│   ├── auth.ts            # Auth store (Zustand)
│   └── chat.ts            # Chat store (Zustand)
├── types/                  # TypeScript types
├── utils/                  # Utilities
│   ├── supabase.ts        # Supabase client wrapper
│   └── secure-config.ts   # Secure API key manager
└── assets/                # Static assets
    └── images/
```

## 🗄️ Database Schema

### Tables

- **profiles** - User profile information
  - `id` (UUID, PK) - User ID (references auth.users)
  - `username`, `full_name`, `bio`
  - `avatar_url`, `role`
  - `email_verified`, `phone_verified`
  - Timestamps and metadata

- **chats** - Chat rooms
  - `id` (UUID, PK)
  - `type` - 'direct' or 'group'
  - `name`, `description`
  - `created_by` (FK → profiles)
  - `last_message_at`

- **chat_members** - Chat membership
  - `chat_id` (FK → chats)
  - `user_id` (FK → profiles)
  - `role` - 'owner', 'admin', 'member'
  - `joined_at`, `last_read_at`

- **messages** - Chat messages
  - `id` (UUID, PK)
  - `chat_id` (FK → chats)
  - `sender_id` (FK → profiles)
  - `content`, `message_type`
  - `is_edited`, `is_deleted`

- **notifications** - User notifications
- **user_settings** - User preferences
- **blocked_users** - Blocked user relationships

### Row Level Security (RLS)

All tables have RLS policies enforcing:
- Users can only access their own data
- Chat members can only see their chats
- Profile data respects privacy settings
- Secure message delivery

## 🔧 Configuration

### Environment Variables

The app uses secure storage for sensitive credentials. No `.env` file required!

### Theme Customization

Edit `constants/theme.ts` to customize:
- Colors (light/dark mode)
- Typography
- Spacing
- Border radius
- Shadows

Example:
```typescript
export const Colors = {
  light: {
    primary: '#007AFF',
    background: '#FFFFFF',
    text: '#000000',
    // ...
  },
  dark: {
    primary: '#0A84FF',
    background: '#000000',
    text: '#FFFFFF',
    // ...
  },
};
```

## 🔐 Security Features

1. **Encrypted Storage** - API keys stored with expo-secure-store
2. **Row Level Security** - Database-level access control
3. **Input Validation** - Client-side and server-side validation
4. **Authentication Tokens** - Secure JWT-based authentication
5. **Password Hashing** - Supabase handles secure password storage
6. **HTTPS Only** - All API communication over HTTPS

## 📊 Performance Optimizations

- **FlashList** - Optimized list rendering
- **Image Caching** - Efficient image loading
- **Lazy Loading** - Component code splitting
- **Memoization** - React.memo for expensive components
- **Database Indexes** - Optimized query performance
- **Real-time Subscriptions** - Efficient WebSocket connections

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 🚢 Deployment

### Build for Production

#### iOS
```bash
eas build --platform ios
```

#### Android
```bash
eas build --platform android
```

### Environment Setup

Configure your EAS build in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "APP_VARIANT": "production"
      }
    }
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new files
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update tests for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo** - Amazing React Native framework
- **Supabase** - Excellent Firebase alternative
- **React Native** - Cross-platform mobile development
- **Moti** - Beautiful animations
- **Zustand** - Simple state management

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/chatbox/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/chatbox/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/chatbox/discussions)

## 🗺️ Roadmap

- [ ] Voice messages
- [ ] Video calls
- [ ] File sharing
- [ ] Message reactions
- [ ] Push notifications
- [ ] End-to-end encryption
- [ ] Story/Status feature
- [ ] Message search
- [ ] Chat export
- [ ] Multi-language support

---

Made with ❤️ using React Native & Supabase