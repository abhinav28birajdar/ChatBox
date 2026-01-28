# ChatBox - Real-Time Community & Messaging Platform

<div align="center">
  <img src="./assets/icon.png" width="120" height="120" alt="ChatBox Logo" />
  <br />
  <h1>ChatBox</h1>
  <p><strong>Connect. Chat. Belong.</strong></p>
  <p>A premium, Discord-inspired mobile ecosystem built for scalable real-time communities.</p>

  <p align="center">
    <a href="https://github.com/abhinav28birajdar/ChatBox/tree/main">
      <img src="https://img.shields.io/badge/View_Main_Branch-3178C6?style=for-the-badge&logo=github&logoColor=white" alt="Main Branch" />
    </a>
    <a href="https://firebase.google.com/">
      <img src="https://img.shields.io/badge/Backend_Powered_by-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    </a>
  </p>
</div>

---

## 🚀 Status: Active Development & Architecture
**ChatBox** has evolved from a high-fidelity UI prototype into a fully functional distributed system. We are actively implementing the **Real-Time Architecture** using **React Native (Expo)** on the frontend and **Firebase** serverless infrastructure on the backend.

The current focus is on optimizing data synchronization, reducing latency for instant messaging, and managing complex server/channel relationships.

---

## 🛠️ Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/FCM_(Cloud_Messaging)-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="FCM" />
  <img src="https://img.shields.io/badge/Expo_Notifications-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo Notifications" />
  <img src="https://img.shields.io/badge/Reanimated-FF5722?style=for-the-badge&logo=framer&logoColor=white" alt="Reanimated" />
</p>

* **Frontend:** React Native with Expo (Managed Workflow)
* **Language:** TypeScript (Strict Typing)
* **Navigation:** Expo Router (File-based Routing & Deep Linking)
* **Backend/Database:** Firebase (Firestore NoSQL & Realtime Database)
* **Authentication:** Firebase Auth (Email/Password, OAuth, & Session Management)
* **Real-time & Notifications:**
    * **FCM (Firebase Cloud Messaging):** High-priority push alerts for Mentions/DMs.
    * **Firestore Listeners:** WebSockets for instant message syncing and typing indicators.
* **Storage:** Firebase Cloud Storage (Media optimization & delivery)
* **Design System:** Custom Dark Theme (`#120C17` Background, `#FFE031` Accents)

---

## ⚙️ Core Modules & Implementation

### 💬 Real-Time Messaging Engine
* **Instant Communication:**
    * **Snapshot Listeners:** Messages sync instantly across devices using Firestore `onSnapshot` listeners.
    * **Media Pipeline:** Upload images, voice notes, and files directly to Firebase Storage with optimistic UI updates.
    * **CRUD Operations:** Edit and delete messages with real-time propagation to all clients.
* **Presence System:**
    * **Live Status:** Real-time tracking of "Online," "Idle," and "Do Not Disturb" states.
    * **Typing Indicators:** Ephemeral state management to show when users are composing.

### 🌐 Server & Community Management
* **Complex Data Modeling:**
    * **Hierarchical Structure:** `Server` -> `Category` -> `Channel` (Text/Voice).
    * **Sidebar Interface:** Efficient context switching between Servers and Direct Messages.
* **Role-Based Access Control (RBAC):**
    * **Permissions:** Admin, Moderator, and Member roles enforcing read/write access via Firestore Security Rules.
    * **Invite System:** Dynamic link generation for onboarding new members.

### 👤 Identity & Social Graph
* **Profile Ecosystem:**
    * **Data Persistence:** User preferences, avatars, and bio stored in Firestore `users` collection.
    * **Stats Aggregation:** Real-time calculation of join dates and server roles.
* **Friend System:**
    * **Graph Logic:** Manage Friend Requests (Pending/Accepted) and Blocked Users lists.

### 🔔 Notification Center
* **Smart Alerts:**
    * **Push Notification Service:** Integration of **FCM** and **Expo Notifications** to handle background alerts.
    * **Foreground Handling:** In-app toasts for interactions while the app is open.

---

## 🎨 Design Highlights
While technically focused, the UI remains a core differentiator:
* **Premium Palette:** Deep purple backgrounds (`#120C17`) with vibrant yellow highlights (`#FFE031`).
* **Haptic Feedback:** Tactile response on button presses using `expo-haptics`.
* **Smooth Transitions:** Shared Element Transitions and layout animations using `React Native Reanimated`.

---

## 🎯 Next Goals (Roadmap)
- [ ] **Voice & Video:** Implement WebRTC for live voice channels and low-latency video calls.
- [ ] **E2E Encryption:** Secure private Direct Messages with End-to-End Encryption signals.
- [ ] **Bots & Integrations:** Build an API layer for automated bots and webhooks.
- [ ] **Global Search:** Implement Algolia/ElasticSearch for querying messages across servers.

---

### 📂 View Latest Progress
This branch focuses on the implementation of backend logic, Firebase integration, and real-time functional components. To view the stable version or contribute:

👉 **Check the [Main Branch](https://github.com/abhinav28birajdar/ChatBox/tree/main)**

---

### 🔗 Quick Links

* [**View Main Branch Code**](https://github.com/abhinav28birajdar/ChatBox/tree/main)
* [**Report a Bug**](https://github.com/abhinav28birajdar/ChatBox/issues)
* [**Request a Feature**](https://github.com/abhinav28birajdar/ChatBox/issues)

<br />

<p align="center">Made with ❤️ for the Community.</p>