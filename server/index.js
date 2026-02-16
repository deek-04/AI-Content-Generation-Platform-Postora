const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID);

const express = require('express');
const fs = require('fs');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const googleSheetsService = require('./googleSheetsService');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3001;
const SCHEDULE_SECRET = process.env.SCHEDULE_SECRET || '';
const SCHEDULE_FILE = path.join(__dirname, 'schedules.json');

// Initialize Google Sheets service
googleSheetsService.initialize().catch(console.error);

// LinkedIn OAuth Configuration
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3001/auth/linkedin/callback';

// Ensure schedules file exists
if (!fs.existsSync(SCHEDULE_FILE)) fs.writeFileSync(SCHEDULE_FILE, JSON.stringify([]));

function readSchedules() {
  try {
    return JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8')) || [];
  } catch (e) {
    return [];
  }
}

function writeSchedules(data) {
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(data, null, 2));
}

// Simple in-memory timers map for demo
const timers = new Map();

function schedulePublish(item) {
  const publishAt = new Date(item.publishTime).getTime();
  const now = Date.now();
  const delay = Math.max(0, publishAt - now);

  if (timers.has(item.id)) clearTimeout(timers.get(item.id));
  const t = setTimeout(() => {
    // Forward to Zapier when publish time arrives
    axios.post(ZAP_URL, item).catch(err => console.error('Failed to forward to Zapier', err?.message || err));
    // mark as published in file
    const schedules = readSchedules();
    const idx = schedules.findIndex(s => s.id === item.id);
    if (idx !== -1) {
      schedules[idx].status = 'published';
      writeSchedules(schedules);
    }
    timers.delete(item.id);
  }, delay);
  timers.set(item.id, t);
}

// LinkedIn OAuth endpoints
app.get('/auth/linkedin/url', (req, res) => {
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&` +
    `scope=r_liteprofile%20w_member_social&` +
    `state=${Date.now()}`;
  
  res.json({ authUrl });
});

app.post('/auth/linkedin/callback', async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', 
      `grant_type=authorization_code&` +
      `code=${code}&` +
      `client_id=${LINKEDIN_CLIENT_ID}&` +
      `client_secret=${LINKEDIN_CLIENT_SECRET}&` +
      `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Get user profile
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const tokens = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + (expires_in * 1000),
      platform: 'linkedin',
      userId: profileResponse.data.id,
      profile: profileResponse.data
    };

    // Store tokens (in a real app, you'd store this in a database)
    const tokensFile = path.join(__dirname, 'linkedin_tokens.json');
    fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2));

    res.json(tokens);
  } catch (error) {
    console.error('LinkedIn OAuth error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to complete LinkedIn authentication' });
  }
});

app.get('/auth/linkedin/tokens', (req, res) => {
  try {
    const tokensFile = path.join(__dirname, 'linkedin_tokens.json');
    if (fs.existsSync(tokensFile)) {
      const tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
      // Check if token is expired
      if (tokens.expiresAt > Date.now()) {
        res.json(tokens);
      } else {
        res.status(401).json({ error: 'Token expired' });
      }
    } else {
      res.status(404).json({ error: 'No tokens found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tokens' });
  }
});

app.post('/auth/linkedin/refresh', async (req, res) => {
  try {
    const tokensFile = path.join(__dirname, 'linkedin_tokens.json');
    if (!fs.existsSync(tokensFile)) {
      return res.status(404).json({ error: 'No tokens found' });
    }

    const tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
    
    const refreshResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken',
      `grant_type=refresh_token&` +
      `refresh_token=${tokens.refreshToken}&` +
      `client_id=${LINKEDIN_CLIENT_ID}&` +
      `client_secret=${LINKEDIN_CLIENT_SECRET}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = refreshResponse.data;
    
    const newTokens = {
      ...tokens,
      accessToken: access_token,
      refreshToken: refresh_token || tokens.refreshToken,
      expiresAt: Date.now() + (expires_in * 1000)
    };

    fs.writeFileSync(tokensFile, JSON.stringify(newTokens, null, 2));
    res.json(newTokens);
  } catch (error) {
    console.error('LinkedIn refresh error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh tokens' });
  }
});

// Pinterest OAuth endpoints (fake implementation)
app.get('/auth/pinterest/url', (req, res) => {
  // This is a fake endpoint since Pinterest API requires business verification
  res.json({ 
    authUrl: 'https://www.pinterest.com/oauth/authorize?client_id=fake&redirect_uri=fake&scope=basic&response_type=code' 
  });
});

app.post('/auth/pinterest/callback', (req, res) => {
  // Fake Pinterest callback
  res.json({
    accessToken: 'fake_pinterest_token',
    refreshToken: 'fake_refresh_token',
    expiresAt: Date.now() + (3600 * 1000),
    platform: 'pinterest'
  });
});

app.get('/auth/pinterest/tokens', (req, res) => {
  res.status(404).json({ error: 'Pinterest tokens not available' });
});

app.post('/auth/pinterest/refresh', (req, res) => {
  res.status(404).json({ error: 'Pinterest refresh not available' });
});

// Enhanced scheduling endpoint with Google Sheets integration
app.post('/api/schedule', async (req, res) => {
  // validate secret header
  const incomingSecret = req.headers['x-schedule-secret'] || '';
  if (SCHEDULE_SECRET && incomingSecret !== SCHEDULE_SECRET) {
    return res.status(403).json({ error: 'Forbidden - invalid secret' });
  }
  const payload = req.body;
  if (!payload || !payload.platform || !payload.publishTime) {
    return res.status(400).json({ error: 'invalid payload' });
  }

  try {
    const item = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      platform: payload.platform,
      title: payload.title || '',
      content: payload.content,
      imageUrl: payload.imageUrl || null,
      publishTime: payload.publishTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to Google Sheets
    await googleSheetsService.addPost(item);
    console.log('Post added to Google Sheets successfully');

    // Also keep local backup
    const schedules = readSchedules();
    schedules.push(item);
    writeSchedules(schedules);

    res.json({ ok: true, item, message: 'Post scheduled and added to Google Sheets' });
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({ error: 'Failed to schedule post', details: error.message });
  }
});

app.get('/api/schedule', async (req, res) => {
  try {
    // Try to get from Google Sheets first
    const sheetsPosts = await googleSheetsService.getAllPosts();
    res.json(sheetsPosts);
  } catch (error) {
    console.error('Error getting posts from Google Sheets, falling back to local:', error);
    // Fallback to local storage
    res.json(readSchedules());
  }
});

app.delete('/api/schedule/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Delete from Google Sheets
    await googleSheetsService.deletePost(id);
    console.log(`Post ${id} deleted from Google Sheets`);
  } catch (error) {
    console.error('Error deleting from Google Sheets:', error);
  }
  
  // Also delete from local storage
  const schedules = readSchedules();
  const filteredSchedules = schedules.filter(s => s.id !== id);
  writeSchedules(filteredSchedules);
  
  // Cancel timer if exists
  if (timers.has(id)) {
    clearTimeout(timers.get(id));
    timers.delete(id);
  }
  
  res.json({ ok: true, message: 'Post deleted successfully' });
});

// Update post status endpoint
app.put('/api/schedule/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  try {
    // Update in Google Sheets
    await googleSheetsService.updatePostStatus(id, status);
    
    // Also update local storage
    const schedules = readSchedules();
    const postIndex = schedules.findIndex(s => s.id === id);
    if (postIndex !== -1) {
      schedules[postIndex].status = status;
      schedules[postIndex].updatedAt = new Date().toISOString();
      writeSchedules(schedules);
    }
    
    res.json({ ok: true, message: `Post status updated to ${status}` });
  } catch (error) {
    console.error('Error updating post status:', error);
    res.status(500).json({ error: 'Failed to update post status' });
  }
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
