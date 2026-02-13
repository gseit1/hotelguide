# 🚀 Quick Start Deployment Guide

## Prerequisites
- GitHub account
- Render account (free): https://render.com
- Netlify account (free): https://netlify.com

## 📋 Step-by-Step Instructions

### 1️⃣ Prepare Your Repository

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

2. Create a new repository on GitHub

3. Push your code:
```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy Backend to Render

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `hotel-booking-api` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Add Environment Variables (click "Advanced"):
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your-random-secret-key-here` (generate a random string)
   - `FRONTEND_URL` = (leave empty for now, we'll update this)

6. Add Persistent Disk:
   - Click **"Add Disk"**
   - **Mount Path**: `/opt/render/project/src`
   - **Size**: `1 GB`
   - **Name**: `booking-data`

7. Click **"Create Web Service"**

8. Wait for deployment (takes 2-5 minutes)

9. **Copy your Render URL**: `https://YOUR-APP-NAME.onrender.com`

### 3️⃣ Deploy Frontend to Netlify

#### Option A: Using Netlify CLI (Recommended)

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

When prompted:
- **Publish directory**: `.` (current directory)
- **Deploy path**: `.`

#### Option B: Using Netlify Dashboard

1. Go to https://app.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Select your repository
5. Configure:
   - **Build command**: (leave empty)
   - **Publish directory**: `.`
6. Click **"Deploy site"**

7. Wait for deployment (takes 1-2 minutes)

8. **Copy your Netlify URL**: `https://YOUR-SITE-NAME.netlify.app`

### 4️⃣ Connect Frontend and Backend

1. **Update Netlify Configuration**:
   - Open `netlify.toml`
   - Replace `https://your-app-name.onrender.com` with your actual Render URL
   - Save and commit:
   ```bash
   git add netlify.toml
   git commit -m "Update Render API URL"
   git push
   ```

2. **Update Render Environment Variable**:
   - Go to your Render dashboard
   - Select your web service
   - Go to **"Environment"** tab
   - Update `FRONTEND_URL` with your Netlify URL: `https://YOUR-SITE-NAME.netlify.app`
   - Click **"Save Changes"**
   - Render will automatically redeploy

### 5️⃣ Test Your Deployment

1. Visit your Netlify URL: `https://YOUR-SITE-NAME.netlify.app`
2. Try logging in with the default admin account:
   - **Email**: `admin@azurehotel.com`
   - **Password**: `admin123`
3. Test booking functionality
4. Check browser console for any errors

## 🎯 Your URLs

After deployment, save these URLs:

- **Frontend (Netlify)**: `https://YOUR-SITE-NAME.netlify.app`
- **Backend (Render)**: `https://YOUR-APP-NAME.onrender.com`
- **Admin Login**: `https://YOUR-SITE-NAME.netlify.app/admin.html`

## 🔧 Troubleshooting

### CORS Errors
✅ Already fixed! Your server is configured to accept requests from your Netlify domain.

### Backend Not Responding
- Render free tier spins down after 15 minutes of inactivity
- First request may take 30-60 seconds to wake up
- This is normal on the free tier

### Database Not Saving
- Verify persistent disk is attached in Render dashboard
- Check that mount path is `/opt/render/project/src`

### API Calls Failing
- Open browser DevTools (F12)
- Check Network tab for failed requests
- Verify the API URL in netlify.toml matches your Render URL

## 💰 Costs

Both services are **FREE** with these limits:
- **Netlify**: 100GB bandwidth/month, 300 build minutes/month
- **Render**: 750 hours/month (enough for 1 service running 24/7)

## 🔄 Future Updates

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push
```

Both Netlify and Render will automatically detect changes and redeploy!

## 📚 Additional Resources

- [Full Deployment Guide](./DEPLOYMENT.md)
- [Netlify Documentation](https://docs.netlify.com/)
- [Render Documentation](https://render.com/docs)

## ✅ Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Environment variables configured on Render
- [ ] Persistent disk attached on Render
- [ ] Render URL copied
- [ ] Frontend deployed on Netlify
- [ ] Netlify URL copied
- [ ] netlify.toml updated with Render URL
- [ ] FRONTEND_URL updated on Render
- [ ] Tested login functionality
- [ ] Tested booking functionality

---

**🎉 Congratulations!** Your hotel booking system is now live!
