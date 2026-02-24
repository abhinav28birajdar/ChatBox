# Aakar

**Aakar** is a full-featured, production-grade super-app for Android built with **Expo SDK 54**, **React Native 0.81 (New Architecture)**, **TypeScript**, and **Firebase**. It combines an e-commerce marketplace, real-time community chat, social discovery, and a multi-role admin system in a single cohesive product.

---

## Features

### Marketplace
- Product discovery with search, categories, and trending sections
- Full product detail pages with live inventory via Firestore
- Shopping cart with quantity management
- Multi-step checkout (address → payment → success)
- Order placement and live order tracking

### Chat & Community
- Direct Messages (1-on-1) with real-time Firestore sync
- Community Servers with text channels, categories, and roles
- Message reactions, typing indicators (Firebase Realtime Database), and media sharing
- Friend system — send, accept, decline, and block

### Seller Portal
- Dedicated seller dashboard with revenue analytics
- Product inventory management (add, edit, delete, pagination)
- Order fulfilment and earnings overview

### Admin Console
- User management with role assignment
- Seller approval workflow (pending → approved / rejected)
- Platform-wide analytics dashboard

### Authentication & Identity
- Email / Password registration with 3-step onboarding
- Google Sign-In
- Phone OTP (Firebase phone auth)
- Email verification gate
- Role-based routing: `customer`, `seller`, `admin`

### System
- Dark / Light / System theme with AsyncStorage persistence
- Real-time push notifications (Expo Push + Firebase Cloud Messaging)
- In-app notification centre with read/unread tracking
- Offline detection overlay
- Full onboarding flow with permission requests

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK ~54.0.32 + React Native 0.81.5 |
| Language | TypeScript ~5.9.2 (strict) |
| Navigation | expo-router ~6.0.23 (file-based, typed routes) |
| Auth | @react-native-firebase/auth v21 + Google Sign-In |
| Database | @react-native-firebase/firestore (real-time `onSnapshot`) |
| Realtime DB | @react-native-firebase/database (typing indicators) |
| Storage | @react-native-firebase/storage (media uploads) |
| State | React Context API (Auth, App, Chat, Server, Friend, Notifications) |
| UI | @expo/vector-icons, expo-linear-gradient, react-native-reanimated ~4.1 |
| Notifications | expo-notifications + react-native-toast-message |
| Architecture | New Architecture enabled, Hermes JS engine |

---

## User Roles

| Role | Capabilities |
|---|---|
| `customer` | Browse, purchase, chat, follow, manage orders |
| `seller` | All customer capabilities + product & order management + revenue analytics |
| `admin` | All seller capabilities + user management + seller approvals + platform analytics |

---

## CI/CD

GitHub Actions workflow at `.github/workflows/build.yml`:
- **Type check** on every push/PR
- **EAS Build** (Android APK or AAB) triggered manually or on push to `main`
- **Firebase rules deployment** on push to `main`

---

## License

Private — All rights reserved.