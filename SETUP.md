# Postora Setup Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# AI API Keys
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_LEONARD_API_KEY=your_leonard_api_key_here

# App Configuration
VITE_APP_URL=https://postora.app
VITE_BACKEND_URL=http://localhost:3001

# Zapier Webhook (Scheduling via Zapier)
VITE_ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/<app_id>/<trigger_id>

# Instagram Graph API (Optional - for production)
VITE_INSTAGRAM_APP_ID=your_instagram_app_id
VITE_INSTAGRAM_APP_SECRET=your_instagram_app_secret

# LinkedIn Marketing API (Optional - for production)
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

## Required API Keys

### 1. Firebase
- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project or use existing one
- Enable Authentication (Email/Password and Google)
- Enable Firestore Database
- Get your config from Project Settings > General > Your apps

### 2. Groq API
- Sign up at [Groq](https://console.groq.com/)
- Get your API key from the console
- This is used for AI content generation

### 3. Leonard API
- Sign up at [Leonardo AI](https://leonardo.ai/)
- Get your API key from the dashboard
- This is used for AI image generation

## Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

2. Set up environment variables (see above)

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

## Features Implemented

### ✅ Authentication
- Firebase Authentication with Email/Password
- Google Sign-in
- Protected routes
- User account management

### ✅ AI Content Generation
- Instagram posts with Groq API
- LinkedIn posts with Groq API
- URL summarization
- Multiple output formats

### ✅ AI Image Generation
- Instagram-style images with Leonard API
- LinkedIn-style images with Leonard API
- Multiple style options
- Download functionality

### ✅ Content Management
- Copy to clipboard
- PDF generation and download
- Multiple sharing options (social media, email, QR code)
- Shareable links

### ✅ Scheduling System
- Zapier-based scheduling via webhook
- Post scheduling with datetime picker
- Post management (edit, delete, status tracking)

### ✅ Enhanced UI
- Responsive design
- Modern animations
- Toast notifications
- Loading states
- Error handling

## Demo Video Setup

To add your demo video:

1. Place your video file in the `public` folder
2. Update the video path in `src/pages/Index.tsx`:
```tsx
<video 
  controls 
  className="w-full h-full rounded-lg"
  src="/your-demo-video.mp4"
>
  Your browser does not support the video tag.
</video>
```

## Production Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service

3. Set production environment variables

4. Configure your domain in Firebase

## Backend Integration

For Zapier scheduling, set `VITE_ZAPIER_WEBHOOK_URL` and publish a Zap with:
1) Trigger: Webhooks by Zapier → Catch Hook
2) Action: Delay by Zapier → Delay Until `publishTime`
3) Paths: Route on `platform` (instagram/linkedin)
4) Actions: Post to the selected platform
Optionally send a callback to your backend to update status.

## Support

For issues or questions, please check the code comments or create an issue in the repository.
