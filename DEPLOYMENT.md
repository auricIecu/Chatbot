# 🚀 Deployment Instructions for Orito Chatbot

## Prerequisites
- Groq API Key (already configured in backend/.env)
- Netlify account for frontend deployment
- Backend hosting service (Railway, Render, or similar)

## Deployment Steps

### 1. Backend Deployment (First)
1. Deploy backend to your preferred service (Railway, Render, etc.)
2. Set environment variables:
   - `GROQ_API_KEY`: Your Groq API key
   - `FRONTEND_URL`: Your frontend URL (will be provided after frontend deployment)

### 2. Frontend Deployment (Second)
1. Update `netlify.toml` with your backend URL:
   - Replace `https://your-backend-url.com` with actual backend URL
2. Deploy to Netlify using the provided `netlify.toml` configuration

### 3. Final Configuration
1. Update backend `FRONTEND_URL` environment variable with actual Netlify URL
2. Both services should now communicate properly

## Files Created for Deployment
- ✅ `netlify.toml` - Netlify deployment configuration
- ✅ `frontend/chatbotui/.env.template` - Environment template
- ✅ Updated `vite.config.js` - Production build configuration
- ✅ Updated `backend/app.py` - Production CORS configuration

## Environment Variables Summary

### Backend (.env)
```
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=https://your-netlify-app.netlify.app
```

### Frontend (set in Netlify)
```
VITE_API_URL=https://your-backend-url.com
```

## Ready for Deployment ✅
All necessary files have been created and configured for deployment.
