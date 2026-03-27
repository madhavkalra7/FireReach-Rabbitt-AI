# FireReach Technical Documentation

This document reflects the current production architecture of FireReach (7-agent runtime, stream-first UX, OpenAI integration, credits, and OTP payments).

## 1. Product Overview

FireReach is an AI outbound pipeline that turns a single ICP input into ranked target companies, contact candidates, and personalized outreach.

Primary operating modes:

- `manual`: user selects company, reviews and edits draft, then sends
- `auto`: system selects top-ranked company and sends directly

Credit usage:

- `manual`: 5 credits
- `auto`: 10 credits

## 2. High-Level Architecture

```text
Frontend (React + Vite)
  -> Auth, Credits, Campaign Form, Timeline, 3D Runtime Panel
  -> Calls FastAPI endpoints

Backend (FastAPI)
  -> Auth + Subscription + Payments + History
  -> 7-step agent workflow
  -> Streams NDJSON step events to frontend

Integrations
  -> OpenAI (analysis and scoring)
  -> Search/signal providers
  -> SMTP email sending
  -> Optional Twilio SMS for OTP delivery
```

## 3. Seven Agent Steps

Internal workflow in `backend/agent.py`:

1. `step1` Company discovery
2. `step2` Signal harvesting
3. `step3` Signal verification
4. `step4` Research brief generation
5. `step5` ICP + signal scoring and ranking
6. `step6` Contact discovery + suggested contact selection
7. `step7` Outreach generation and send outcome

The backend emits step updates with message + status while processing.

## 4. Runtime Stream Contract

Endpoint: `POST /run-agent?stream=true`

Response media type: `application/x-ndjson`

Event types:

- `step`
- `result`
- `error`

Step event example:

```json
{
  "type": "step",
  "step": "step4",
  "status": "in-progress",
  "message": "Generating account briefs from verified signals."
}
```

Final event example:

```json
{
  "type": "result",
  "data": {
    "status": "completed",
    "send_mode": "auto",
    "companies": [],
    "rankings": [],
    "selected_company_name": "",
    "summary": {}
  }
}
```

Frontend maps `step1..step7` to timeline and 3D serial execution track.

## 5. Scoring and Ranking

Per company:

- `signal_score`: weighted score from verified signal categories
- `icp_score`: OpenAI-based score against ICP
- `final_score`: blended score (`0.4 * signal_score + 0.6 * icp_score`)
- `avg_score`: mirrored final score for UI cards

Resilience logic:

- Robust extraction/parsing of model JSON
- Name normalization for ranking merge consistency
- Non-zero deterministic fallback when model payload is malformed

## 6. Contact and Outreach Flow

After ranking:

- `auto` mode:
  - selects rank-1 company
  - finds contacts
  - generates and attempts send
- `manual` mode:
  - returns ranked list and waits for user selection
  - `/select-company` generates contacts and outreach draft
  - `/send-email` executes final send

Frontend supports draft editing before manual send.

## 7. Auth, Credits, Plans, and Payments

### Auth routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/me`

### Credits routes

- `GET /api/credits`
- `POST /api/credits/consume`

### Payment routes (demo OTP)

- `POST /api/payments/demo/create`
- `GET /api/payments/demo/{payment_id}`
- `POST /api/payments/demo/{payment_id}/submit`
- `GET /api/payments/demo/{payment_id}/status`

Plans currently accepted in payment flow include `STARTER`, `GROWTH`, `SCALE`, `PRO`, and `ENTERPRISE`.

OTP behavior:

- generated server-side with TTL
- validated on submit
- debug OTP can be returned when SMS provider is not configured
- optional Twilio SMS if credentials are present

## 8. History

History routes:

- `POST /api/history`
- `GET /api/history`
- `GET /api/history/{history_id}`
- `PATCH /api/history/{history_id}`
- `DELETE /api/history/{history_id}`

Stored payload includes ICP, mode, optional target/test recipient, and full workflow result snapshot.

## 9. Frontend UX Notes

Dashboard runtime states:

- `idle`
- `running`
- `select_company`
- `done`

While running:

- Three.js serial pipeline advances only as stream events arrive
- status text mirrors backend step messages
- timeline and runtime mesh stay in sync

Result views include:

- ranked company cards with `avg_score`
- per-company intelligence/signal panels
- full contact table with unmasked email
- editable email preview and send controls

## 10. Environment Variables

Required:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.4-mini-2026-03-17
SERPER_API_KEY=...
SENDER_EMAIL=...
SENDER_EMAIL_APP_PASSWORD=...
JWT_SECRET=...
```

Optional:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
DEMO_OTP_DEBUG=true
DEMO_OTP_TTL_MINUTES=5
CORS_ORIGINS=http://localhost:5173
```

## 11. Local Runbook

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Suggested ICP test:

```text
We sell cybersecurity training to Series B startups
```

## 12. Deployment Notes

- Localhost is the most reliable baseline for full pipeline testing.
- Some free-tier hosts block outbound SMTP.
- Recommended production options:
  - SMTP-friendly host (for example Railway), or
  - provider API based delivery integration for email sending.

## 13. Common Failure Cases

| Symptom | Likely Cause | Fix |
|---|---|---|
| All company scores show 0 | ranking mapping issue or parse fallback not applied | verify `rankings` merge and `avg_score` in API response |
| OTP not arriving | Twilio not configured or phone invalid | use debug OTP from response or set Twilio env vars |
| Campaign fails at start | credits exhausted | check `/api/credits` and top up plan |
| OpenAI call errors | invalid key/model access | verify key and model permissions |
| Email send fails in cloud | SMTP blocked by host | move host or switch email provider API |

## 14. Extension Points

- Replace SMTP sender with API-based transactional provider
- Add websocket transport for richer realtime telemetry
- Persist step-level logs for replayable campaign sessions
- Add multi-company auto send with safety throttling
