# Self-Improving AI Agent for Lead Optimization

**Prioritize leads with AI-driven scoring and a self-improving agent.** A dashboard that turns emails, chats, support tickets, and calls into actionable lead scores—and gets better over time from your feedback.
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)

---

## What it does

This agent turns emails, chats, support tickets, and calls into a **0–100 lead score** per lead so you can optimize who you focus on. Use it to:

- See which leads are **hot** (80+), **warm** (60–79), or **cold** (&lt;60)
- Filter and sort by score, stage, source, and last interaction
- Drill into a lead’s **interaction timeline** and **score history**
- View **analytics** on score distribution, stages, and sources

It works with mock data out of the box. The scoring logic is designed so you can plug in real NLP (e.g. OpenAI, Google Natural Language) or your own API, and the self-improving agent refines recommendations from thumbs up/down feedback.

---

## Features

| Feature | Description |
|--------|-------------|
| **Dashboard** | Lead cards with lead score, trend, stage, and last interaction. Filter by temperature (hot/warm/cold), score range, stage, source, and search. |
| **Lead profile** | Per-lead view with score gauge, score breakdown (positivity, engagement, responsiveness, interest), interaction timeline, and score history chart. |
| **Analytics** | Team-level metrics (avg score, high-quality leads, conversion rate) and charts for score distribution, stage, and source. |
| **Settings** | Backend status, agent improvement trigger, score thresholds, integrations. |
| **Sentiment engine** | Keyword-based sentiment (positive/neutral/negative); backend supports optional AI provider. |
| **AI recommendations** | Backend agent returns prioritized leads and suggested actions; cache by lead-set hash with short TTL (5–15 min); thumbs up/down feedback. |
| **Caching** | Sentiment cached by content hash; recommendations cached by lead-set hash with configurable TTL to reduce cost and latency. |
| **Self-improving agent** | Feedback store, config versioning, optional “Run agent improvement” to refine scoring from feedback. |

---

## Tech stack

- **React 18** + **TypeScript**
- **Vite** for dev and build
- **Tailwind CSS** for styling
- **Lucide React** for icons

---

## Getting started

### Prerequisites

- **Node.js** 18+ (recommend 20+)
- **npm** (or yarn/pnpm)

### Install and run

```bash
# Clone the repo
git clone https://github.com/your-username/lead-optimization-agent.git
cd lead-optimization-agent

# Install dependencies
npm install

# Start frontend (http://localhost:5173)
npm run dev

# In another terminal: start backend for AI recommendations (http://localhost:3000)
npm run server
```

### Environment variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Scope | Description |
|----------|--------|-------------|
| `PORT` | Server | Backend port (default `3000`) |
| `CORS_ORIGIN` | Server | Allowed frontend origin (e.g. `http://localhost:5173`) |
| `SENTIMENT_PROVIDER` | Server | Sentiment engine: `keyword` (default) or an AI provider |
| `RECOMMEND_CACHE_TTL_MIN` | Server | Recommendation cache TTL in minutes (5–15; default `10`) |
| `VITE_API_URL` | Frontend | Backend API base URL (default `http://localhost:3000`) |

Without the backend, the app runs with mock data and no AI recommendations.

### Other scripts

```bash
npm run build   # Production build (output in dist/)
npm run preview # Preview production build locally
npm run lint    # Run ESLint
npm run server  # Start backend API (sentiment, agent, feedback, config)
```

---

## Project structure

```
server/                   # Backend API (Node, Express)
├── index.js              # Routes: health, sentiment, agent recommend/feedback/improve, config
├── sentimentKeyword.js   # Keyword-based sentiment
├── agentConfig.js        # Tunable scoring weights, config versioning, rollback
├── feedbackStore.js      # In-memory feedback for self-improvement
└── recommendCache.js     # Recommendation cache (10 min TTL)

src/
├── App.tsx               # Root app, view routing, lead selection
├── main.tsx
├── index.css             # Global + Tailwind
├── components/
│   ├── Navbar.tsx
│   ├── Dashboard.tsx     # Lead grid, AI recommendations panel, filters
│   ├── DashboardFilters.tsx
│   ├── LeadCard.tsx
│   ├── LeadProfile.tsx   # Lead detail + suggested action + feedback
│   ├── ScoreGauge.tsx
│   ├── InteractionTimeline.tsx
│   ├── ScoreHistoryChart.tsx
│   ├── MetricsCards.tsx
│   ├── Analytics.tsx
│   └── Settings.tsx     # Backend status, Run agent improvement
├── services/
│   └── agentService.ts   # getRecommendations, recordFeedback, runImprove
├── data/
│   └── mockData.ts
├── types/
│   └── index.ts          # Lead, Recommendations, etc.
└── utils/
    └── sentimentAnalysis.ts
```

---

## Data model (high level)

- **Lead**: id, name, email, company, position, engagementScore, trend, stage, source, lastInteraction, etc.
- **Interaction**: type (email, chat, support_ticket, call), content, sentiment, sentimentScore, timestamp.
- **LeadScore**: current/previous/change, trend, breakdown (positivity, engagement, responsiveness, interest).
- **TeamMetrics**: total leads, average score, high-quality leads, conversion rate, etc.

Stages: `prospect` → `qualified` → `opportunity` → `customer`.

---

## Contributing

Contributions are welcome. Please open an issue to discuss larger changes, or send a pull request for bugs and small improvements.

1. Fork the repo and create a branch from `main`.
2. Make your changes and run `npm run lint`.
3. Open a PR with a short description of what changed and why.

---

## License

This project is open source. If no license file is present, assume usage under the repository’s default license (check the repo for a LICENSE file).
