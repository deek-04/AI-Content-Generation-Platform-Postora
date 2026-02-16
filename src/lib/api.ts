import axios from 'axios';

// RapidAPI client for image generation
export const rapidApiImageClient = axios.create({
  baseURL: import.meta.env.VITE_RAPIDAPI_IMAGE_BASE_URL,
  headers: {
    "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
    "X-RapidAPI-Host": import.meta.env.VITE_RAPIDAPI_HOST,
    "Content-Type": "application/json",
  },
});
// Stability AI API configuration
export const stabilityApi = axios.create({
  baseURL: 'https://api.stability.ai/v1',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_STABILITY_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
// Groq API configuration
export const groqApi = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Leonard API configuration
export const leonardApi = axios.create({
  baseURL: 'https://api.leonardo.ai/v1',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_LEONARD_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Instagram Graph API configuration
export const instagramApi = axios.create({
  baseURL: 'https://graph.facebook.com/v18.0',
  headers: {
    'Content-Type': 'application/json',
  },
});

// LinkedIn Marketing API configuration
export const linkedinApi = axios.create({
  baseURL: 'https://api.linkedin.com/v2',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Backend API configuration
export const backendApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Zapier Webhook configuration
export const zapierWebhookClient = axios.create({
  baseURL: import.meta.env.VITE_ZAPIER_WEBHOOK_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});