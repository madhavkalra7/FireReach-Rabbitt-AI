# FireReach

FireReach is a full-stack AI outbound engine that discovers target accounts, verifies buying signals, scores ICP fit, ranks top opportunities, finds contacts, and generates personalized outreach.

This version ships with a 7-agent backend pipeline, streaming progress events, manual and auto outreach modes, credit-based usage, OTP demo checkout, and a realtime Three.js runtime panel.

## What Makes This Version Different

- 7-stage deterministic agent workflow instead of a single monolithic call
- Live stream progress from backend to frontend (`application/x-ndjson`)
- Manual mode and auto mode with different credit cost
- Company ranking and score normalization fixes (`avg_score` + fallback scoring)
- Full contact visibility and editable email drafts before send
- OTP-based demo payment flow with optional Twilio SMS delivery
- OpenAI-backed LLM layer (`gpt-5.4-mini-2026-03-17` with `max_completion_tokens`)

## 7-Agent Runtime Flow

```text
Step 1: Company Discovery
Step 2: Signal Harvesting
Step 3: Signal Verification
Step 4: Research + ICP Scoring
Step 5: Ranking + Best Company Selection
Step 6: Contact Discovery
Step 7: Outreach Generation / Send
```

## Stack

- Backend: FastAPI, SQLAlchemy, Pydantic, JWT auth
- Frontend: React, Vite, Framer Motion, Three.js (`@react-three/fiber`, `@react-three/drei`)
- AI: OpenAI Chat Completions
- Data sources: Serper/Serp APIs, company signal tools, contact tooling
- Email: SMTP (Gmail app password) for send actions

## Repository Layout

```text
FireReach/
  backend/
    main.py
    agent.py
    database.py
    routes/
    services/
    tools/
    models/
  frontend/
    src/
      pages/
      components/
      context/
      hooks/
    package.json
  README.md
  DOCS.md
```

## Quick Start

### 1. Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4-mini-2026-03-17

SERPER_API_KEY=...
SERP_API_KEY=...

SENDER_EMAIL=your-email@gmail.com
SENDER_EMAIL_APP_PASSWORD=your-app-password

JWT_SECRET=change-this

# Optional SMS OTP delivery
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
DEMO_OTP_DEBUG=true
```

Run API:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Usage Modes and Credit Cost

- Manual mode: 5 credits per run
- Auto mode: 10 credits per run

Credit deduction happens before a run starts. On successful completion, history and remaining credits are refreshed.

## Core Endpoints

### Agent Runtime

- `POST /run-agent?stream=true` -> stream progress events + final result
- `POST /run-agent?stream=false` -> single-shot result (legacy fallback)
- `POST /select-company` -> manual mode continuation (step 6 and 7 generation)
- `POST /send-email` -> sends edited or generated outreach email

### User and Credits

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/credits`
- `POST /api/credits/consume`

### Payments and History

- `POST /api/payments/demo/create`
- `POST /api/payments/demo/{payment_id}/submit`
- `GET /api/payments/demo/{payment_id}/status`
- `GET /api/history`
- `POST /api/history`

## Streaming Event Shape

`/run-agent?stream=true` emits newline-delimited JSON events:

```json
{"type":"step","step":"step3","status":"in-progress","message":"Verifying harvested signals."}
{"type":"step","step":"step3","status":"completed","message":"Signal verification completed."}
{"type":"result","data":{}}
```

Frontend consumes these events to drive:

- Agent timeline state
- Three.js serial runtime visualization
- Live status copy in running panel

## Deployment Notes

- Localhost works out of the box with SMTP.
- Free tier hosts may block outbound SMTP.
- For production reliability:
  - Prefer Railway for SMTP-friendly hosting, or
  - Switch SMTP send path to transactional API providers.

## Troubleshooting

- All scores are 0:
  - Ensure ranking payload is present in backend result
  - Confirm frontend merges `rankings` into company cards
- OTP not received:
  - If Twilio is not configured, use debug OTP from API response
  - Confirm phone normalization to `+91XXXXXXXXXX`
- OpenAI errors:
  - Validate `OPENAI_API_KEY`
  - Validate model access for `gpt-5.4-mini-2026-03-17`
- Emails not sending:
  - Verify app password and SMTP permissions

## Docs

See [DOCS.md](DOCS.md) for deep architecture, payload contracts, scoring, and extension points.
