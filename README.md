# Tangent — AI Course Teacher

Tangent builds personalized, interactive courses with sequenced modules, generated lessons, interactive concept models, practice exercises, and quizzes.

## Run locally
- Node.js 20.19+ (or 22.12+)
- Install: `npm install`
- Set `OPENAI_API_KEY` in your shell (never commit it). Optional: `OPENAI_BASE_URL` and `OPENAI_MODEL`.
- Start: `npm run dev`
- Build: `npm run build`

AI generation uses server-side Vite middleware at `/api/tangent`. Production hosting requires a secured server/edge function for `generate-course` and `generate-lesson`; do not expose provider keys in client-side variables.

The initial source archive is being prepared separately; this README alone is not the application source.