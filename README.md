# TikTok Clone - Social Media App

![App Screenshot](https://github.com/jmdonovan0227/tt-clone/blob/main/assets/images/Screenshot%202025-12-20%20at%205.51.41%E2%80%AFPM.png)

> Built with React Native & Expo to master real-time features and backend integration.
> Based on [Tutorial Creator]'s course.

## 🎯 Learning Goals

- Master Supabase RLS policies, auth, and relational database design
- Implement global auth state management with Zustand + Supabase Auth
- Build real-time features using Supabase Realtime subscriptions
- Create production-ready React Native components and screens

## ✨ Key Features

- Infinite scroll video feed with optimized performance
- Video upload with cloud storage (Supabase)
- User authentication (sign up/sign in)
- Real-time likes and comments
- Comment editing and deletion
- Video sharing capability
- User profiles

## 🛠️ Tech Stack

- **Framework:** React Native (Expo)
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Realtime)
- **State Management:** Zustand (auth), TanStack Query (server state)
- **Validation:** React Hook Form + Zod
- **Type Safety:** TypeScript
- **Code Review:** CodeRabbit

## 📱 Installation
```bash
# Clone repository
git clone https://github.com/jmdonovan0227/tt-clone.git

# Install dependencies
npm install

# Configure environment variables by creating a .env file and adding env_example.txt variables

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 💡 What I Learned

**Database & Security**
- Designed relational schema for users, posts, likes, and comments
- Implemented Row Level Security policies to protect user-generated content
- Managed database relationships and foreign key constraints

**Real-time Features**
- Set up Supabase Realtime channels for live updates
- Handled optimistic UI updates for immediate user feedback
- Synchronized state across multiple users viewing the same content

**State Management**
- Separated auth state (Zustand) from server state (TanStack Query)
- Persisted auth sessions across app restarts
- Managed complex form state with React Hook Form

**Type Safety & Validation**
- Generated TypeScript types from Supabase schema
- Created Zod schemas for runtime validation
- Prevented common bugs with strict typing

## 🔧 Key Modifications from Tutorial

- ✅ Added **real-time likes and comments** with Supabase subscriptions
- ✅ Implemented **video sharing** functionality
- ✅ Integrated **React Hook Form + Zod** for type-safe form validation
- ✅ Improved performance by switching from FlatList to **FlashList**

## 🚀 Future Improvements

- Friend system (add, view, remove friends)
- Direct messaging with real-time inbox
- Enhanced profile page with settings and user stats
- Smooth animations using Reanimated
- Push notifications for new likes/comments

---
*Tutorial by notjustdev:* [TikTok Clone Tutorial](https://www.youtube.com/watch?v=IxfnhAHnfCM)
