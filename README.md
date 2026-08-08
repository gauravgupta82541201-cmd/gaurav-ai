# Gaurav AI V2 🤖

A personal-assistant website with a secure Node.js backend and OpenAI Responses API connection.

## Requirements

- Node.js 18+
- An OpenAI API key

## Run locally

1. Open a terminal in `backend/`.
2. Run `npm install`.
3. Copy `backend/.env.example` to `backend/.env`.
4. Put your API key in `OPENAI_API_KEY` inside `backend/.env`.
5. Run `npm start`.
6. Open `http://localhost:3000`.

**Never put the API key in `frontend/index.html` or `frontend/script.js`.**

## What V2 adds

- Real AI chat through the backend
- Conversation history stored locally in the browser
- Existing notes/tasks/calculator preserved
- Voice input preserved
- Graceful fallback when the backend is offline
- Health endpoint at `/api/health`
