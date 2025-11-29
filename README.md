# Eunoia

AI-driven curriculum generator that aggregates structured learning roadmaps from YouTube, Google Search, and LLM logic.

## Prerequisites

- Node.js v18+
- MongoDB (Atlas or Local)
- Google Cloud Console Project (Custom Search, YouTube Data API)
- Google AI Studio Key (Gemini)
- SerpAPI Key (Optional, fallback)

## Installation

### Backend

1. Navigate to server:

   ```bash
   cd server
   npm install
   ```

2. Create `.env` in `server/`:

   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/eunoia

   # Auth
   JWT_SECRET=your_secure_secret
   NODE_ENV=development

   # AI & Search
   GEMINI_API_KEY=AIza...
   YOUTUBE_API_KEY=AIza...

   # Primary Search (Google Custom Search JSON API)
   GOOGLE_SEARCH_API_KEY=AIza...
   GOOGLE_CX=012345...

   # Fallback Search
   SERP_API_KEY=e45...
   ```

3. Start server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to client:

   ```bash
   cd client
   npm install
   ```

2. Configure proxy (ensure `vite.config.js` targets backend port).

3. Start client:
   ```bash
   npm run dev
   ```

## Architecture

**Stack:** MongoDB, Express, React, Node.js (MERN) + Vite.

**Core Logic:**

1. **Curriculum Generation:** `geminiService.js` prompts Gemini 2.0/1.5 models for structured JSON modules.
2. **Resource Retrieval:**
   - **Video:** YouTube Data API (Top 3 results).
   - **Text:** Google Custom Search (Top 3 filtered results).
   - **Fallback:** SerpAPI triggers automatically if Google Search quota receives 429/403.
   - **Failover:** Gemini hallucinated URLs (last resort) or Wikipedia search construction.
3. **Auth:** HttpOnly Cookies containing JWTs. LocalStorage used strictly for non-sensitive UI state.

## Key Features

- **Multi-Model Fallback:** Automatically rotates through `gemini-2.0-flash`, `gemini-3-pro-preview`, and `gemini-1.5-pro` on failure.
- **Strict Typing:** Mongoose schemas enforce resource types (VIDEO, ARTICLE, DOCUMENTATION).
- **Quota Management:** Console logs explicitly identify quota exhaustion for Google/SerpAPI.
- **Resource filtering:** Auto-detects documentation vs courses vs books based on URL patterns.
- **Protected Routes:** Middleware verifies JWT before allowing goal creation or dashboard access.

```

```
