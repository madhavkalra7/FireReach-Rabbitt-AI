# FireReach Agent Documentation

## Overview

FireReach is an autonomous B2B outreach engine that uses AI agents to research companies, analyze fit against your Ideal Customer Profile (ICP), and send hyper-personalized cold emails — all automatically.

---

## Logic Flow

The FireReach agent operates in a strict sequential pipeline:

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INPUT                                   │
│  • ICP (Ideal Customer Profile)                                 │
│  • Target Company Name                                          │
│  • Recipient Email                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: SIGNAL HARVESTER                                       │
│  ─────────────────────────                                      │
│  • Queries SerpAPI for REAL, live data                         │
│  • Searches: funding, hiring, news, tech stack                 │
│  • Returns: SignalData object with factual information         │
│                                                                 │
│  WHY: Grounds all subsequent steps in real, verifiable data    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: RESEARCH ANALYST                                       │
│  ────────────────────────                                       │
│  • Takes SignalData + ICP as input                             │
│  • Uses GPT-5.4 to analyze strategic fit                       │
│  • Outputs: 2-paragraph Account Brief                          │
│                                                                 │
│  WHY: Creates context-rich analysis for email personalization  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: OUTREACH SENDER                                        │
│  ───────────────────────                                        │
│  • Takes Signals + Brief + ICP + Recipient                     │
│  • GPT-5.4 generates personalized email (JSON response)        │
│  • Email sent via Gmail SMTP (real send, not draft)            │
│  • Returns: subject, body, sent status                         │
│                                                                 │
│  WHY: Ensures every email references actual signals            │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Sequence Matters

1. **Signal-First Approach**: By harvesting signals BEFORE any AI generation, we ensure the agent never fabricates information. Every claim in the email is backed by real search results.

2. **ICP Alignment**: The research analyst step explicitly connects company signals to your ICP, ensuring relevance and strategic fit.

3. **Grounded Personalization**: The email writer receives both raw signals AND analyzed brief, enabling hyper-specific personalization that references actual facts.

---

## Tool Schemas

### 1. tool_signal_harvester

**Description**: Harvests real-time signals about a target company using SerpAPI Google searches.

**Input Parameters**:
| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| company   | string | Yes      | Name of the target company to research |

**Output Format** (SignalData):
```json
{
  "company": "string",
  "funding": "string",
  "hiring": "string",
  "news": ["string", "string", "string"],
  "tech_stack": ["string", "string"]
}
```

**Example Output**:
```json
{
  "company": "Vercel",
  "funding": "Vercel raised $150M in Series D funding at a $2.5B valuation in May 2024, led by GV with participation from existing investors.",
  "hiring": "Vercel is actively hiring for 47 open positions including Senior Frontend Engineers, Platform Engineers, and AI/ML specialists across their San Francisco and remote teams.",
  "news": [
    "Vercel launches v0 AI product: Revolutionary AI-powered development tool announced at Next.js Conf 2024",
    "Next.js 15 released: Major performance improvements with new compiler and caching system",
    "Vercel expands enterprise partnerships: New deals with Fortune 500 companies announced"
  ],
  "tech_stack": ["React", "Next.js", "TypeScript", "Vercel Edge", "Turborepo", "Node.js"]
}
```

**Search Queries Executed**:
1. `{company} funding 2024 2025`
2. `{company} hiring jobs site:linkedin.com OR site:greenhouse.io`
3. `{company} news announcement 2025`
4. `{company} tech stack`

---

### 2. tool_research_analyst

**Description**: Analyzes harvested signals against the ICP and generates a strategic account brief.

**Input Parameters**:
| Parameter | Type   | Required | Description                             |
|-----------|--------|----------|-----------------------------------------|
| signals   | object | Yes      | SignalData object from signal_harvester |
| icp       | string | Yes      | Ideal Customer Profile description      |

**Output Format**:
```json
{
  "account_brief": "string (2 paragraphs)"
}
```

**Example Output**:
```json
{
  "account_brief": "Vercel is experiencing explosive growth, having just closed a $150M Series D at a $2.5B valuation in May 2024. The company is aggressively scaling with 47 open engineering positions, signaling rapid team expansion. Their recent launch of v0, an AI-powered development tool, and Next.js 15 demonstrates heavy investment in cutting-edge technology. The engineering-heavy hiring surge suggests they're building complex systems at scale.\n\nThis growth trajectory creates urgent security training needs. With 47+ new engineers onboarding, Vercel faces the classic scale-up security challenge: rapid team growth outpacing security culture. Their AI product launch and enterprise expansion increase their attack surface and compliance requirements. Series D companies like Vercel typically prioritize developer productivity initially, creating gaps in security awareness that become critical as they move upmarket to enterprise clients."
}
```

---

### 3. tool_outreach_automated_sender

**Description**: Writes a hyper-personalized cold email using AI and sends it via Gmail SMTP.

**Input Parameters**:
| Parameter       | Type   | Required | Description                             |
|-----------------|--------|----------|-----------------------------------------|
| signals         | object | Yes      | SignalData object from signal_harvester |
| account_brief   | string | Yes      | Account brief from research_analyst     |
| icp             | string | Yes      | Ideal Customer Profile description      |
| recipient_email | string | Yes      | Email address to send outreach to       |

**Output Format**:
```json
{
  "subject": "string",
  "body": "string",
  "sent": boolean,
  "recipient": "string"
}
```

**Example Output**:
```json
{
  "subject": "47 new engineers = 47 new attack vectors?",
  "body": "Hi,\n\nCaught the news about your 47 open engineering roles — that's serious scale-up energy. Having helped other Series D dev tools companies navigate this exact inflection point, I know the security training gap that rapid hiring creates.\n\nWhen you're shipping AI products like v0 and expanding enterprise contracts, every new engineer becomes a potential entry point. The playbook we've seen work: get ahead of it before your first enterprise security audit becomes a fire drill.\n\nWould a 15-min call to share what we learned from similar scale-ups be useful?\n\nBest,\n[Your name]",
  "sent": true,
  "recipient": "john@vercel.com"
}
```

---

## System Prompt

The agent operates with the following system prompt, which enforces strict data-grounded behavior:

```
You are FireReach, an autonomous B2B outreach agent. You operate with precision 
and always ground your outreach in real, harvested data.

Your persona: Strategic, efficient, data-driven. You never guess — you research first.

Your constraints:
1. ALWAYS call tool_signal_harvester first before any analysis
2. ALWAYS call tool_research_analyst before writing any email
3. ALWAYS call tool_outreach_automated_sender to send — never just draft
4. Never fabricate signals — only use what tool_signal_harvester returns
5. The email MUST reference specific signals (numbers, facts, names)
6. Complete all 3 tool calls sequentially — never skip steps
```

### Constraint Explanations

| Constraint | Purpose |
|------------|---------|
| #1 - Signal First | Ensures all data is real/fresh; prevents hallucination |
| #2 - Research Before Email | Provides strategic context for personalization |
| #3 - Send Not Draft | Ensures full automation; no manual intervention needed |
| #4 - No Fabrication | Maintains credibility; every claim is verifiable |
| #5 - Signal References | Forces specificity; avoids generic templates |
| #6 - No Skipping | Guarantees complete pipeline execution |

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
