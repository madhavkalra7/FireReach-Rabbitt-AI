# 🔥 FireReach — Autonomous Outreach Engine

An AI-powered B2B outreach system that autonomously researches companies, analyzes strategic fit, and sends hyper-personalized cold emails.

## ✨ Features

- **Signal Harvesting**: Real-time company research via SerpAPI (funding, hiring, news, tech stack)
- **AI-Powered Analysis**: GPT-5.4 generates strategic account briefs aligned to your ICP
- **Autonomous Email**: Writes AND sends personalized emails via Gmail SMTP
- **Live Agent Timeline**: Watch the AI agent work step-by-step
- **Dark Cyberpunk UI**: Bloomberg-meets-SaaS terminal aesthetic

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FIREREACH SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────────────────────────────────────┐   │
│  │   FRONTEND  │    │                 BACKEND                      │   │
│  │   (React)   │───▶│              (FastAPI)                       │   │
│  │             │    │                                              │   │
│  │  • Input    │    │  ┌─────────────────────────────────────┐    │   │
│  │    Form     │    │  │         AGENTIC LOOP                 │    │   │
│  │  • Timeline │    │  │      (OpenAI Function Calling)       │    │   │
│  │  • Results  │    │  │                                      │    │   │
│  └─────────────┘    │  │   ┌─────────┐  ┌─────────┐  ┌─────┐ │    │   │
│                     │  │   │ Signal  │─▶│Research │─▶│Email│ │    │   │
│                     │  │   │Harvester│  │ Analyst │  │Sender│ │    │   │
│                     │  │   └────┬────┘  └────┬────┘  └──┬──┘ │    │   │
│                     │  └────────┼────────────┼──────────┼────┘    │   │
│                     │           │            │          │          │   │
│                     └───────────┼────────────┼──────────┼──────────┘   │
│                                 │            │          │              │
│                                 ▼            ▼          ▼              │
│                           ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│                           │ SerpAPI │  │ OpenAI  │  │  Gmail  │       │
│                           │ (Real   │  │ GPT-5.4 │  │  SMTP   │       │
│                           │ Search) │  │         │  │         │       │
│                           └─────────┘  └─────────┘  └─────────┘       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
firereach/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── agent.py             # Agentic loop with function calling
│   ├── tools/
│   │   ├── signal_harvester.py     # Tool 1: SerpAPI research
│   │   ├── research_analyst.py     # Tool 2: Account analysis
│   │   └── outreach_sender.py      # Tool 3: Email generation & sending
│   ├── schemas.py           # Pydantic models
│   ├── config.py            # Environment config
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── InputForm.jsx
│   │   │   ├── AgentTimeline.jsx
│   │   │   ├── SignalCard.jsx
│   │   │   ├── ResearchBrief.jsx
│   │   │   └── EmailPreview.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── DOCS.md                  # Detailed documentation
├── .env.example             # Environment template
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API key
- SerpAPI key
- Gmail with App Password

### 1. Clone & Setup Backend

```bash
cd firereach/backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env
# Edit .env with your API keys
```

### 2. Configure API Keys

Edit `backend/.env`:

```env
OPENAI_API_KEY=sk-your-key-here
SERP_API_KEY=your-serpapi-key
SENDER_EMAIL=your@gmail.com
SENDER_EMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

**Get your keys:**
- OpenAI: https://platform.openai.com/api-keys
- SerpAPI: https://serpapi.com/manage-api-key
- Gmail App Password: Google Account → Security → App Passwords

### 3. Start Backend

```bash
cd backend
python -m prisma generate --schema=prisma/schema.python
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API running at `http://localhost:8000`

### 4. Setup & Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend running at `http://localhost:5173`

### 5. Launch!

1. Open `http://localhost:5173`
2. Enter your ICP
3. Enter target company name
4. Enter recipient email
5. Click **Launch Agent →**
6. Watch the magic happen! 🎯

## 🧪 Test Case

```
ICP: "We sell high-end cybersecurity training to Series B startups"
Company: "Vercel"
Recipient: your-test-email@example.com
```

The agent will:
1. ✅ Fetch REAL signals from SerpAPI
2. ✅ Generate analysis referencing actual data
3. ✅ Write email mentioning specific signals
4. ✅ Send via Gmail SMTP

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/outreach` | Execute full outreach pipeline |
| GET | `/api/health` | Health check |

### Request Example

```bash
curl -X POST http://localhost:8000/api/outreach \
  -H "Content-Type: application/json" \
  -d '{
    "icp": "We sell cybersecurity training to Series B startups",
    "company": "Vercel",
    "recipient_email": "test@example.com"
  }'
```

## 🎨 UI Design

- **Theme**: Dark Industrial / Cyberpunk Minimal
- **Background**: #080B14 (near-black navy)
- **Accent**: #00FF88 (electric green)
- **Fonts**: JetBrains Mono + Syne

## 📚 Documentation

See [DOCS.md](./DOCS.md) for:
- Complete logic flow explanation
- Tool schemas with examples
- System prompt breakdown
- Troubleshooting guide

## ⚠️ Important Notes

- SerpAPI calls are REAL HTTP requests (not mocked)
- Emails are ACTUALLY SENT via SMTP (not drafted)
- Agent uses OpenAI function calling (not simple chat)
- All signals in emails are verifiable

## 🛡 Security

- Never commit `.env` files
- API keys loaded from environment only
- Gmail App Password required (not main password)
- No hardcoded credentials

---

Built with 🔥 by FireReach
