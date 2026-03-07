# 🚀 Aakar - MVP Specification
**Aakar** (Sanskrit for *Form/Shape*) is a high-performance, production-ready super-app designed to bridge the gap between social community interaction and e-commerce.

---

## 🎯 Vision
To create a seamless "Social Commerce" experience where users can discover products, discuss them in real-time communities, and purchase them without ever leaving the application.

---

## 👥 Target Audience
1. **General Consumers**: Looking for a curated marketplace with a social touch.
2. **Community Members**: Groups interested in specific niches (tech, fashion, gaming) who want a place to chat and trade.
3. **Small-to-Medium Sellers**: Business owners wanting a direct-to-consumer platform with integrated chat support.

---

## ✨ Core MVP Features (Must-Haves)

### 1. Robust Authentication & Onboarding
- **Multi-method Login**: Secure sign-in via Email/Password, Google Sign-In, and Phone OTP (Firebase).
- **Role-Based Profiles**: Integrated onboarding flow to distinguish between Buyers, Sellers, and Admins.
- **Identity Verification**: Email verification gates to ensure platform security.

### 2. Marketplace Essentials
- **Product Discovery**: Search and category-based browsing with real-time Firestore synchronization.
- **Dynamic Product Pages**: High-fidelity product details, rich media support, and live inventory tracking.
- **Seamless Transactions**: 
    - Intuitive Shopping Cart.
    - Simplified Checkout Flow (Address Management → Secure Payment Gateway).
    - Real-time Order Tracking.

### 3. Real-Time Communication
- **Direct Messaging (DMs)**: Private 1-on-1 chats with real-time sync, typing indicators, and read receipts.
- **Friend System**: Management of social circles (Add/Accept/Decline/Block).
- **Push Notifications**: Instant alerts for messages, order updates, and platform announcements.

### 4. System & UX Core
- **Advanced Theming**: Fluid Switching between Light, Dark, and System modes with local persistence.
- **Performance**: Built on React Native "New Architecture" (Fabric/TurboModules) for near-native responsiveness.
- **Offline Resilience**: Intelligent connection monitoring with user-friendly overlays.

---

## 🎨 UI/UX Design System
The Aakar MVP prioritizes a **Premium, State-of-the-Art Aesthetic**:
- **Typography**: Utilizing `Inter` and `Outfit` for a modern, readable feel.
- **Vibe**: Glassmorphism elements, subtle gradients, and micro-animations via `React Native Reanimated`.
- **Consistency**: A unified design language across the Marketplace and Chat modules.

---

## ⚙️ Technical Stack
| Layer | Technology |
|---|---|
| **Mobile Framework** | Expo SDK 54 + React Native 0.81 |
| **Language** | TypeScript (Strict Mode) |
| **Backend/DB** | Firebase (Firestore, Realtime DB, Auth, Storage) |
| **Client State** | React Context API + Custom Hooks |
| **Navigation** | Expo Router (Typed, File-based) |
| **Styling** | Native Wind / Vanilla Styles with Reanimated |

---

## 🏗️ Beyond MVP (Roadmap)

### Phase 2: Professional Expansion
- **Seller Portal**: Dedicated dashboard for inventory management and revenue analytics.
- **Community Servers**: Discord-style servers with text channels, categories, and hierarchical roles.
- **Media Optimization**: Integrated image editor and video previews for products.

### Phase 3: AI & Optimization
- **AI Personal Shopper**: Recommendation engine based on chat and browsing history.
- **Automated Moderation**: AI-powered chat filtering and seller verification.
- **Global Scaling**: Multi-language support and international payment integrations.
