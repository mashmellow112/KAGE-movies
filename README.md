# Kage Movies 🎬

Kage Movies is a premium movie discovery and subscription platform built for a high-end cinematic experience. Users can explore the latest blockbusters, watch trailers, and unlock unlimited access through a monthly premium pass.

## ✨ Features

- **Google Authentication**: Secure and easy login using Google accounts.
- **Premium Subscription Model**: 
  - Monthly Pass for **Ugx 4,000**.
  - 30-day unlimited access to all movie content.
  - Automatic expiry tracking with real-time library sync.
- **Mobile Money Integration**: 
  - Tailored UI for **Airtel Money** and **MTN MoMo** payments.
  - Secure transaction simulation via Kage Payments.
- **Cinematic UI/UX**:
  - Dark-mode first aesthetic with high-quality posters.
  - Fluid animations and transitions powered by Framer Motion.
  - Responsive design optimized for both mobile and desktop.
- **Personalized Library**:
  - **My Library**: Instant access to all movies during an active subscription.
  - **Favorites**: Save movies you want to watch later.
- **Search & Filter**: Find movies by title, actor, or genre.

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Auth)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- Firebase project configured

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file or provide a `firebase-applet-config.json` with your Firebase credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔐 Security

The application implements strict **Firebase Security Rules** to ensure:
- Users can only read their own subscription/payment data.
- Subscriptions are immutable once created.
- Subscription validation ensures the correct amount (Ugx 4,000) and duration are set.

## 📱 User Interface

The app is designed with a "Swiss/Modern" aesthetic, featuring:
- **Inter** & **JetBrains Mono** typography.
- Glassmorphism effects with `backdrop-blur`.
- Staggered grid animations for movie cards.

## 🖼️ Media Assets

Local movie posters should be placed in `public/assets/movies/`. 
To use a local image, update the `posterUrl` in `src/constants/movies.ts`:
```typescript
{
  posterUrl: '/assets/movies/your-image.jpg',
  // ...
}
```

---

*Built with ❤️ by the Kage Movies Team.*
