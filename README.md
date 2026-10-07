# Creator Lab

Turn every post into something you learn from. Creator Lab helps creators run experiments, measure results, separate what is known from what is suspected or unknown, and turn that evidence into proof, collaborations and brand opportunities.

## Project structure
```
creator-lab/
├── creator-lab.html        Whole frontend: HTML, CSS, JS, seed data, state (localStorage), rule-based demo intelligence
├── server/
│   ├── index.js            Node http server: serves creator-lab.html, GET /api/status, POST /api/ai/*
│   └── services/ai.js      System prompt, response schemas, Claude API call, validation
├── scripts/eval.js         AI evaluation runner
├── tests/ai/cases.json     The 10 evaluation cases
├── package.json            No dependencies (Node 18+ built-ins only)
├── render.yaml             Render deployment config
├── .env.example            Placeholder environment variables
└── .gitignore
```
There is no src/ folder, build step, or lock file: the frontend is a single file and the server uses only Node built-ins.

## Install and run locally
```
npm install        # no dependencies; safe to run
npm start          # http://localhost:3000  (PORT env var overrides)
```
Frontend and API are served from the same origin.

## Environment variables
Copy `.env.example` to `.env` and fill in values, or export them in your shell. The server loads `.env` from the project root at startup (dotenv). Shell variables also work:
```
# macOS/Linux
AI_API_KEY=your_key AI_MODEL=gemini-2.5-flash-lite npm start
# Windows PowerShell
$env:AI_API_KEY="your_key"; $env:AI_MODEL="gemini-2.5-flash-lite"; npm start
```
- `AI_API_KEY`: Gemini API key (Google AI Studio) (server-side only)
- `AI_MODEL`: defaults to `gemini-2.5-flash-lite`
- `PORT`: optional

## AI architecture
Browser → `POST /api/ai/{next-experiment | analyze-performance | coach | generate-pitch | generate-report | collaboration-idea}` → `server/services/ai.js` → Google Gemini API (@google/genai) → JSON validated against the schema for that task → browser.
- `GET /api/status` returns `{"ai": true|false}` depending on whether `AI_API_KEY` is set. Settings shows "Growth intelligence connected" or "Demo intelligence" from it.
- If the key is missing, the provider fails, or the response is malformed, the server returns an error and the page offers Try again / Continue with demo insights (built-in rule-based logic).
- Wired in the UI today: next experiment, performance analysis, Growth Coach, brand pitch. The report and collaboration-idea endpoints exist on the server but the page does not call them yet.
- The system prompt (evidence-first, no invented causality, no guarantees, transparent sponsorship) is `SYSTEM` in `server/services/ai.js`.

## Data
Seed creator, experiments, collaborations, opportunities are in `seed()` inside `creator-lab.html`. State persists in the browser's localStorage under key `creatorlab_v1`. Learnings, proof and reports are computed from that state.

## AI evaluations
```
AI_API_KEY=your_key npm run eval:ai
```
Runs the 10 cases in `tests/ai/cases.json` against the coach endpoint logic, applies pattern checks, and prints Passed / Needs review / Failed. Cases 1, 2 and 8 are always marked for human review. Without a key it prints NOT RUN. The evaluations have not yet been run against the real AI.

## Deploy to Render
1. Push this folder to a Git repository.
2. In Render, create a Blueprint or Web Service from the repo (`render.yaml` is included; build command empty, start command `npm start`).
3. Set `AI_API_KEY` in the Render dashboard (Environment). Keep `AI_MODEL` as `gemini-2.5-flash-lite` or change it.
4. Open the deployed URL and check `/api/status` returns `{"ai":true}`.

## Security notes
- Never put the API key in `creator-lab.html`, commit `.env`, or paste it into chat. `.gitignore` excludes `.env`.
- The key is read only from `process.env` on the server.
- Auth is a local prototype: accounts and passwords are stored in plain text in the browser's localStorage. Do not use real passwords; replace with real auth before production.

## Tests
`npm test` runs mocked + local-server checks (no key needed). `npm run smoke:gemini` makes one real Gemini request using your `.env`.
