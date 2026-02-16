# Social Media Integration Setup Guide

This guide explains how to set up the social media integration features including Instagram (fake connection), LinkedIn (real OAuth), and Zapier scheduling.

## Features Implemented

### 1. Instagram Integration (Fake Connection)
- Shows connection status badge on Instagram creator page
- Simulates successful connection
- Allows content copying to scheduler

### 2. LinkedIn Integration (Real OAuth)
- Real LinkedIn OAuth implementation
- Requires LinkedIn Developer App credentials
- Stores tokens securely
- Supports token refresh

### 3. Content Scheduling System
- Copy content from Instagram/LinkedIn creators to scheduler
- Real-time scheduling via Zapier
- Local storage of scheduled posts
- Platform-specific scheduling

### 4. Zapier Integration
- Real-time post scheduling
- Webhook-based communication
- Status monitoring and testing

## Setup Instructions

### 1. LinkedIn OAuth Setup

1. **Create LinkedIn Developer App:**
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Create a new app
   - Note down your Client ID and Client Secret

2. **Configure OAuth Settings:**
   - Add redirect URI: `http://localhost:3001/auth/linkedin/callback`
   - Request permissions: `r_liteprofile` and `w_member_social`

3. **Set Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   LINKEDIN_CLIENT_ID=your-linkedin-client-id
   LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
   LINKEDIN_REDIRECT_URI=http://localhost:3001/auth/linkedin/callback
   ```

### 2. Zapier Setup

1. **Create Zapier Webhook:**
   - Go to [Zapier](https://zapier.com/)
   - Create a new Zap
   - Add "Webhooks by Zapier" as trigger
   - Copy the webhook URL

2. **Set Environment Variables:**
   ```env
   ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook-url
   SCHEDULE_SECRET=your-secret-key
   ```

### 3. Backend Configuration

1. **Install Dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Start the Server:**
   ```bash
   npm start
   ```

### 4. Frontend Configuration

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## Usage

### Instagram Creator
1. Navigate to Instagram creator page
2. Generate content using AI
3. Click "Copy to Scheduler" to copy content and image
4. Content will be automatically loaded in the scheduler

### LinkedIn Creator
1. Navigate to LinkedIn creator page
2. Click "Connect" to authenticate with LinkedIn
3. Generate content using AI
4. Click "Copy to Scheduler" to copy content and image

### Scheduler
1. Navigate to Scheduler page
2. Connect your social media accounts
3. Test Zapier connection
4. Schedule posts with content and timing
5. Posts will be sent to Zapier for real-time scheduling

## API Endpoints

### LinkedIn OAuth
- `GET /auth/linkedin/url` - Get authorization URL
- `POST /auth/linkedin/callback` - Handle OAuth callback
- `GET /auth/linkedin/tokens` - Get stored tokens
- `POST /auth/linkedin/refresh` - Refresh tokens

### Instagram OAuth (Fake)
- `GET /auth/instagram/url` - Get fake authorization URL
- `POST /auth/instagram/callback` - Handle fake callback

### Scheduling
- `POST /api/schedule` - Schedule a new post
- `GET /api/schedule` - Get all scheduled posts
- `DELETE /api/schedule/:id` - Delete a scheduled post

## Zapier Integration

The system sends the following payload to Zapier:

```json
{
  "action": "schedule_post",
  "platform": "instagram|linkedin",
  "content": "Post content",
  "imageUrl": "https://example.com/image.jpg",
  "publishTime": "2024-01-01T12:00:00Z",
  "postId": "unique-post-id"
}
```

## Security Notes

- LinkedIn tokens are stored locally in `linkedin_tokens.json`
- Use environment variables for sensitive data
- Implement proper token refresh mechanisms
- Add rate limiting for production use

## Troubleshooting

### LinkedIn Connection Issues
- Verify Client ID and Secret are correct
- Check redirect URI matches exactly
- Ensure app has required permissions

### Zapier Connection Issues
- Verify webhook URL is correct
- Check Zapier Zap is active
- Test webhook manually

### Content Not Copying
- Check browser console for errors
- Verify localStorage is enabled
- Ensure context provider is properly set up
