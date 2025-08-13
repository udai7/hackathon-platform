# 🚀 HackPub - Modern Hackathon Platform

<div align="center">

**A sleek, modern platform for creating, managing, and participating in hackathons worldwide**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.15.0-green.svg)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

</div>

## 🖼️ Screenshots

<div align="center">

### 🌟 Modern Dark UI with 3D Effects & Glassmorphism

![HackPub Platform Screenshot](public/image.png)

_Experience the sleek dark theme with neon accents, 3D card effects, and beautiful glassmorphism design_

</div>

## ✨ Features

### 🎨 **Modern Dark UI with 3D Effects**

- **Sleek Dark Theme**: Eye-catching dark interface with neon accents
- **3D Card Effects**: Interactive cards with hover animations and depth
- **Glassmorphism Design**: Beautiful glass-like components with backdrop blur
- **Particle Background**: Dynamic animated particle system
- **Responsive Design**: Optimized for all screen sizes

### 🔐 **Robust Authentication System**

- **Google OAuth Integration**: Sign in/up with Google accounts
- **Session Management**: 24-hour sessions with auto-refresh
- **JWT Token Security**: Secure token-based authentication
- **Session Status Indicator**: Real-time session monitoring
- **Multi-Provider Support**: Local and Google authentication

### 🏆 **Comprehensive Hackathon Management**

- **Create & Edit Hackathons**: Full-featured hackathon creation with rich forms
- **Advanced Search & Filtering**: Find hackathons by category, location, and more
- **Participant Management**: Handle registrations and team formations
- **Payment Integration**: Razorpay integration for registration fees
- **Project Submissions**: Submit and evaluate hackathon projects

### 📊 **Smart Dashboard**

- **Role-Based Views**: Different interfaces for hosts and participants
- **Analytics & Stats**: Track participation, completion rates, and more
- **Quick Actions**: Easy access to common tasks
- **Recent Activity**: Stay updated with latest hackathon activities

### 🎯 **Enhanced User Experience**

- **Real-time Updates**: Live session status and notifications
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Loading States**: Beautiful loading indicators and skeleton screens
- **Error Handling**: Comprehensive error messages and recovery options

## 🛠️ Tech Stack

### Frontend

- **React 18.2** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **React Router** for navigation
- **Vite** for build tooling
- **Google OAuth** for authentication

### Backend

- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Razorpay** for payments
- **Google Gemini AI** for project evaluation

### Development Tools

- **TypeScript** for type safety
- **ESLint** for code quality
- **Concurrently** for running multiple processes
- **tsx** for TypeScript execution

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Google OAuth Credentials** (optional, for Google login)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/udai7/hackathon-platform.git
   cd hackathon-platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:

   ```env
   # Server Configuration
   PORT=5000

   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/hackathon-platform?retryWrites=true&w=majority

   # Authentication
   JWT_SECRET=hackpub-super-secret-jwt-key-2024
   SESSION_SECRET=hackpub-session-secret-2024

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   VITE_GOOGLE_CLIENT_ID=your-google-client-id

   # Payment Integration (Optional)
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   ```

4. **Start the application**

   **Option 1: Run both frontend and backend together**

   ```bash
   npm run dev:full
   ```

   **Option 2: Run separately**

   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔧 Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:5173`
6. Update `.env` with your credentials

### MongoDB Setup

- **Local MongoDB**: Use `mongodb://localhost:27017/hackathon-platform`
- **MongoDB Atlas**: Get connection string from your cluster

### Payment Setup (Optional)

1. Create a [Razorpay](https://razorpay.com/) account
2. Get API keys from dashboard
3. Update `.env` with your keys

## 📁 Project Structure

```
hackathon-platform/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── Navbar.tsx     # Navigation component
│   │   ├── Footer.tsx     # Footer component
│   │   └── ...
│   ├── pages/             # Page components
│   │   ├── Home.tsx       # Landing page
│   │   ├── Login.tsx      # Authentication
│   │   ├── Dashboard.tsx  # User dashboard
│   │   └── ...
│   ├── context/           # React contexts
│   │   ├── AuthContext.tsx    # Authentication state
│   │   └── HackathonContext.tsx # Hackathon data
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── lib/               # Utility functions
├── server.ts              # Backend server
├── src/db/                # Database models and connection
└── ...
```

## 🎨 UI Components

### Custom Components

- **3D Cards**: Interactive cards with depth and hover effects
- **Glass Components**: Glassmorphism design elements
- **Neon Effects**: Glowing text and borders
- **Particle Background**: Animated particle system
- **Session Status**: Real-time session monitoring

### shadcn/ui Integration

- **Button**: Multiple variants (cyber, glass, default)
- **Input**: Modern input fields with focus states
- **Card**: Flexible card components
- **Loading**: Beautiful loading states

## 🔐 Authentication Flow

### Session Management

- **24-hour sessions** with automatic refresh
- **1-hour refresh threshold** for active users
- **Secure token storage** with expiry validation
- **Session status indicator** for user awareness

### Google OAuth Flow

1. User clicks "Sign in with Google"
2. Google OAuth popup appears
3. User authorizes the application
4. JWT credential is received and validated
5. User profile is created/updated
6. Session is established with token

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

Ensure all environment variables are set in your production environment, especially:

- `MONGODB_URI` (production database)
- `JWT_SECRET` (strong secret key)
- `GOOGLE_CLIENT_ID` (production OAuth credentials)

## 🐛 Troubleshooting

### Common Issues

**1. Network Errors**

- Ensure backend server is running on port 5000
- Check MongoDB connection string
- Verify CORS configuration

**2. Google OAuth Issues**

- Verify Google Client ID in environment variables
- Check authorized origins in Google Console
- Ensure HTTPS in production

**3. Session Problems**

- Clear browser localStorage if sessions are stuck
- Check JWT token expiry
- Verify session secret configuration

**4. Build Errors**

- Run `npm install` to ensure all dependencies
- Check TypeScript configuration
- Verify environment variables

### Debug Mode

```bash
# Backend with detailed logs
npm run backend:debug

# Check build issues
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for utility-first styling
- **React OAuth Google** for authentication
- **Lucide React** for icons
- **Framer Motion** for animations

## 📞 Contact & Support

<div align="center">

**Udai Das**

[![Email](https://img.shields.io/badge/Email-udaid347%40gmail.com-red.svg)](mailto:udaid347@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-udai7-black.svg)](https://github.com/udai7)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-blue.svg)](https://udaidas.tech/)

</div>

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by [Udai Das](https://github.com/udai7)

</div>
