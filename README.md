# CampusFix — Campus Issue Reporting & Management App

**CampusFix** ("Making Campus Better, Together.") is a full-stack mobile application built with React Native (Expo SDK 58), Express.js, and MongoDB Atlas that helps university students report campus maintenance issues, attach photos, track resolution progress, and support issues raised by fellow students.

---

## 1. Problem Statement

Students frequently encounter broken classroom equipment, plumbing leaks, electrical faults, Wi-Fi dead zones, and hostel maintenance issues without a clear way to report them or track their status. CampusFix centralizes reporting, tracking, and community prioritization in one clean mobile app.

---

## 2. Key Features

### Core Screens (10 Screens)
1. **Splash Screen:** Branded Forest Green & Warm Ivory launch screen with Lottie pulse animation and automatic session routing.
2. **Onboarding (3 Slides):** Real campus photography introducing issue reporting, live tracking, and community support.
3. **Authentication:** Login, Create Account, and Forgot Password flows backed by `bcryptjs` password hashing and JWT tokens.
4. **Home Dashboard:** Personalized greeting, campus hero banner, live summary stats (Total, In Progress, Resolved), quick actions, and recent activity feed.
5. **Report an Issue:** Title, category chips, campus location selector, priority, description, gallery/camera photo upload (`expo-image-picker`), anonymous toggle, and Lottie confirmation modal with generated reference ID (`CF-2026-XXXX`).
6. **Explore Issues:** Search bar, category & status filters, and Recent/Popular sorting.
7. **Issue Details:** Photo gallery, metadata, 5-step vertical status timeline (`Submitted` → `Acknowledged` → `Assigned` → `In Progress` → `Resolved`), staff response notes, and discussion comments.
8. **My Reports:** Filterable tabs (`All`, `Pending`, `In Progress`, `Resolved`, `Drafts`) for user-submitted reports.
9. **Notifications:** MongoDB-backed activity feed with unread indicators, tap-to-read, and "Mark all as read".
10. **Profile & Settings:** Student profile card, report stats, inline name editing (`PUT /api/auth/me`), notification preference toggle, help/about dialogs, and logout.

### 3 Additional Practical Features
- **Community Support ("Issue Affects Me Too"):** Students can upvote existing issues with duplicate-vote prevention (`supporters` array in MongoDB) and `· Popular` badges.
- **Campus Location Explorer:** Interactive 10-zone campus map grid (`Block A`, `Block B`, `Library`, `Main Building`, `Computer Laboratory`, `Science Laboratory`, `Cafeteria`, `Hostel`, `Sports Ground`, `Parking Area`) with live issue count badges and `+ Report Here` shortcut.
- **Offline Report Drafts:** Automatically queues failed network submissions or manual offline drafts locally in `AsyncStorage` (`Waiting for Connection`) until submitted online.

---

## 3. Design System & Visual Identity

- **Primary Background:** Warm Ivory (`#F6F4EF`), Soft White (`#FFFFFF`)
- **Brand Primary:** Forest Green (`#285C4D`), Deep Green (`#1D4036`)
- **Secondary Accents:** Muted Sage (`#A8B8A1`), Terracotta (`#C8754B`), Warm Sand (`#E7DDCE`), Soft Beige (`#EFEAE0`)
- **Photography:** Royalty-free campus photographs stored locally in `campusfix-mobile/src/assets/images/` (`campus-hero.jpg`, `campus-library.jpg`, `campus-walkway.jpg`).

---

## 4. Technology Stack

- **Mobile Framework:** React Native `0.88.1`, Expo SDK `~58.1.0`, React `19.3.0` (JavaScript / JSX)
- **Navigation:** `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- **Animations & Gestures:** `react-native-reanimated`, `react-native-gesture-handler`, `react-native-worklets`, `lottie-react-native`
- **Backend & Database:** Node.js, Express.js, MongoDB Atlas, Mongoose, `bcryptjs`, `jsonwebtoken`
- **Device & Storage:** `expo-image-picker`, `@react-native-async-storage/async-storage`, `@expo/vector-icons`, `expo-font`

---

## 5. Data Storage & Architecture

- **MongoDB Atlas (via `campusfix-server`):** Stores `User` accounts (bcrypt-hashed passwords), `Issue` reports, comments, `supporters` upvotes, and `Notification` records.
- **AsyncStorage (on-device):** Stores the active JWT session (`campusfix_token`, `campusfix_user`), onboarding flag (`campusfix_onboarded`), and offline drafts (`campusfix_drafts_v1`).

---

## 6. Project Structure

```text
CampusFix/
├── README.md
├── .gitignore
├── campusfix-server/                   # Express + MongoDB Atlas Backend
│   ├── .env.example
│   ├── server.js
│   ├── middleware/auth.js              # JWT & Role-based authorization
│   ├── models/                         # User, Issue, Notification, Task
│   └── routes/                         # authRoutes, issueRoutes, notificationRoutes
└── campusfix-mobile/                   # Expo SDK 58 Mobile App
    ├── App.js
    ├── app.json
    ├── eas.json
    ├── assets/                         # CampusFix app & adaptive icons
    └── src/
        ├── assets/                     # Campus photography & Lottie JSONs
        ├── components/                 # Reusable UI & AnimatedCard components
        ├── constants/theme.js          # Warm Ivory & Forest Green design tokens
        ├── navigation/AppNavigator.js  # Stack + 5-Tab Bottom Navigator
        ├── screens/                    # 11 screens (Splash → Profile + LocationExplorer)
        └── services/issueService.js    # REST API client + offline drafts
```

---

## 7. Local Setup & APK Build

### Backend (`campusfix-server`)
```bash
cd campusfix-server
npm install
# Configure PORT, MONGODB_URI, and JWT_SECRET in .env
npm start
```

### Mobile (`campusfix-mobile`)
```bash
cd campusfix-mobile
npm install
npx expo start
```

### Build Standalone Android APK (EAS)
```bash
cd campusfix-mobile
eas build -p android --profile preview
```
