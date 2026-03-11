# FireReach Documentation

## Overview

FireReach is an autonomous B2B outreach engine that uses AI to research companies and send personalized cold emails.

## Deployment Note

**Important**: The application works perfectly on localhost. However, when deploying to **Vercel + Render free tier**, Gmail SMTP is blocked by the hosting providers.

**Solutions**:
1. **Deploy on Railway** - Railway does not block SMTP outbound connections
2. **Use SendGrid API** - Replace Gmail SMTP with SendGrid email API

---

## How It Works

```
User Input (ICP, Company, Email)
           │
           ▼
┌─────────────────────────┐
│  1. Signal Harvester    │  → SerpAPI searches for funding, hiring, news
└─────────────────────────┘
           │
           ▼
┌─────────────────────────┐
│  2. Research Analyst    │  → AI analyzes signals against ICP
└─────────────────────────┘
           │
           ▼
┌─────────────────────────┐
│  3. Outreach Sender     │  → AI writes email + sends via SMTP
└─────────────────────────┘
```

---

## API Endpoint

**POST** `/api/outreach`

```json
{
  "icp": "Your ideal customer profile",
  "company": "Target company name",
  "recipient_email": "email@example.com"
}
```

---

## Environment Variables

```
OPENAI_API_KEY=your_openai_key
SERPAPI_KEY=your_serpapi_key
SENDER_EMAIL=your_gmail@gmail.com
SENDER_EMAIL_APP_PASSWORD=your_app_password
```

---

## How to Run

### Prerequisites

- Python 3.10+
- Node.js 18+
- Gmail account with App Password enabled
- OpenAI API key
- SerpAPI key

### Step 1: Clone and Setup Backend

```bash
# Navigate to backend directory
cd firereach/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
OPENAI_API_KEY=sk-your-openai-api-key
SERP_API_KEY=your-serpapi-key
SENDER_EMAIL=your-gmail@gmail.com
SENDER_EMAIL_APP_PASSWORD=your-16-char-app-password
```

**Getting API Keys:**

1. **OpenAI API Key**: https://platform.openai.com/api-keys
2. **SerpAPI Key**: https://serpapi.com/manage-api-key
3. **Gmail App Password**: 
   - Go to Google Account → Security → 2-Step Verification
   - At the bottom, click "App passwords"
   - Generate a new app password for "Mail"

### Step 3: Start Backend Server

```bash
# From backend directory
python main.py
# or
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Step 4: Setup Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Step 5: Test the System

1. Open `http://localhost:5173` in your browser
2. Enter your ICP (e.g., "We sell cybersecurity training to Series B startups")
3. Enter a target company (e.g., "Vercel")
4. Enter recipient email
5. Click "Launch Agent →"
6. Watch the agent harvest signals, analyze, and send!

---

## API Reference

### POST /api/outreach

Execute the full outreach pipeline.

**Request Body**:
```json
{
  "icp": "We sell cybersecurity training to Series B startups",
  "company": "Vercel",
  "recipient_email": "john@example.com"
}
```

**Response**:
```json
{
  "signals": {
    "company": "Vercel",
    "funding": "...",
    "hiring": "...",
    "news": ["...", "..."],
    "tech_stack": ["...", "..."]
  },
  "account_brief": "...",
  "email_subject": "...",
  "email_body": "...",
  "sent": true,
  "steps": [
    {"tool_name": "tool_signal_harvester", "status": "completed", "result": {...}},
    {"tool_name": "tool_research_analyst", "status": "completed", "result": {...}},
    {"tool_name": "tool_outreach_automated_sender", "status": "completed", "result": {...}}
  ]
}
```

### GET /api/health

Health check endpoint.

**Response**:
```json
{
  "status": "ok"
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SerpAPI returns empty | Check API key; verify quota not exceeded |
| Email not sending | Verify Gmail App Password; check 2FA is enabled |
| OpenAI errors | Check API key; verify model access (gpt-5.4) |
| CORS errors | Ensure backend is running on port 8000 |
