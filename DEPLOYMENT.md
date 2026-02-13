# Deployment Guide

This project is configured to be deployed with:
- **Frontend**: Netlify
- **Backend**: Render

## Backend Deployment (Render)

### Option 1: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and set up your service
6. Once deployed, copy your Render URL (e.g., `https://hotel-booking-api.onrender.com`)

### Option 2: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: hotel-booking-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add environment variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (generate a random string)
6. Add a persistent disk:
   - **Mount Path**: `/opt/render/project/src`
   - **Size**: 1GB (for SQLite database)
7. Click "Create Web Service"
8. Copy your Render URL once deployed

## Frontend Deployment (Netlify)

### Step 1: Update API URL

1. Open `netlify.toml`
2. Replace `https://your-app-name.onrender.com` with your actual Render URL
3. Save the file

### Step 2: Deploy to Netlify

#### Option 1: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Deploy
netlify deploy --prod
```

#### Option 2: Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `.`
5. Click "Deploy site"

### Step 3: Update CORS Settings

After deployment, update your backend `server.js` to allow requests from your Netlify domain:

```javascript
const allowedOrigins = [
  'https://your-site.netlify.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

## Environment Variables

### Backend (Render)
- `JWT_SECRET`: Secret key for JWT tokens (auto-generated or set manually)
- `NODE_ENV`: Set to `production`
- `PORT`: Set to `3000` (or leave default)

### Frontend (Netlify)
- No environment variables needed for static site
- API URL is configured in `netlify.toml` redirect rules

## Database Persistence

The SQLite database (`booking.db`) will be stored on Render's persistent disk.

⚠️ **Important**: Render's free tier may spin down after inactivity. The disk data persists, but the first request after spin-down will be slower.

## Testing

After deployment:

1. Visit your Netlify URL (e.g., `https://your-site.netlify.app`)
2. Test the login functionality
3. Check browser console for any API errors
4. Verify the database is working by creating a booking

## Troubleshooting

### CORS Errors
- Ensure your Render URL is added to CORS allowedOrigins in server.js
- Check netlify.toml has correct Render URL

### Database Not Persisting
- Verify persistent disk is attached in Render dashboard
- Check disk mount path matches where booking.db is saved

### 503 Service Unavailable (Render)
- Free tier services spin down after inactivity
- Wait 30-60 seconds for service to wake up

## Costs

- **Netlify**: Free tier (100GB bandwidth, 300 build minutes/month)
- **Render**: Free tier (750 hours/month, spins down after inactivity)

Both services offer paid plans for better performance and no spin-down.
