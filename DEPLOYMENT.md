# FireReach Deployment Guide

## Architecture Overview

- **Frontend**: React/Vite → Deploy on **Vercel**
- **Backend**: FastAPI/Python → Deploy on **Railway** (recommended) or Render

---

## Step 1: Deploy Backend on Railway

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### 1.2 Deploy Backend
1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Select your repository
3. Railway will detect the `backend` folder - set the **Root Directory** to `backend`
4. Or click **"Add Service"** → **"GitHub Repo"** and configure:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 1.3 Add Environment Variables
In Railway dashboard → Your Service → **Variables** tab, add:

```
OPENAI_API_KEY=sk-your-openai-key
SERP_API_KEY=your-serpapi-key
SENDER_EMAIL=your-email@gmail.com
SENDER_EMAIL_APP_PASSWORD=your-app-password
PORT=8000
```

### 1.4 Get Backend URL
After deployment, Railway gives you a URL like:
`https://firereach-backend-production.up.railway.app`

**Save this URL for Step 2!**

---

## Step 2: Deploy Frontend on Vercel

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 2.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.3 Add Environment Variables
In the same deployment screen, add:

```
VITE_API_URL=https://your-railway-backend-url.up.railway.app
```

Replace with your actual Railway URL from Step 1.4!

### 2.4 Deploy
Click **"Deploy"** and wait for the build to complete.

---

## Step 3: Update CORS (Important!)

After getting your Vercel URL (e.g., `https://firereach.vercel.app`), update the backend CORS:

In `backend/main.py`, update `allow_origins` to include your specific Vercel domain for better security:
```python
allow_origins=[
    "http://localhost:5173",
    "https://firereach.vercel.app",  # Your actual Vercel URL
    "https://firereach-*.vercel.app", # Preview deployments
],
```

---

## Checklist

- [ ] Backend deployed on Railway
- [ ] Environment variables set on Railway
- [ ] Frontend deployed on Vercel
- [ ] `VITE_API_URL` set on Vercel to point to Railway backend
- [ ] CORS updated to include Vercel domain
- [ ] Test the full flow!

---

## Alternative: All-in-One Vercel (Advanced)

If you want everything on Vercel, you'd need to convert the backend to Vercel Serverless Functions. However, this has limitations:
- **10 second timeout** on free tier (your agent may exceed this)
- More complex setup
- Less suitable for long-running operations

Recommended approach is the split deployment above.

---

## Troubleshooting

### CORS Errors
- Check that `VITE_API_URL` is set correctly (no trailing slash)
- Verify backend CORS includes your Vercel domain

### 502/504 Errors
- Check Railway logs for backend errors
- Ensure all environment variables are set

### API Key Errors
- Verify API keys are correct in Railway variables
- Check OpenAI billing is active
- Check SerpAPI has available searches

---

## Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```
