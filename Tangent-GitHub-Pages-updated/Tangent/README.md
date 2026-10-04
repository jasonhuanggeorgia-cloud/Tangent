# Tangent — AI Course Teacher

Tangent is a browser-based AI course teacher. This repository is configured to build and deploy its static frontend to GitHub Pages.

## GitHub Pages deployment

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Push to `main` (or run **Deploy Tangent to GitHub Pages** from the Actions tab).
4. Open `https://jasonhuanggeorgia-cloud.github.io/Tangent/` after the workflow succeeds.

The workflow builds the Vite app and publishes `dist/`. The Vite base path is set for this repository.

## AI backend

GitHub Pages serves static files only, so course and lesson generation runs in a Supabase Edge Function (`supabase/functions/make-server-32df79af/index.ts`) that calls Claude. The API key lives in a Supabase secret and is never placed in frontend code.

Deploy it once:

```
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref uvhcpocdsmkovzociftg
supabase functions deploy make-server-32df79af --project-ref uvhcpocdsmkovzociftg
```

Optional secrets: `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`) and `ALLOWED_ORIGINS` (comma-separated; defaults to the GitHub Pages site and localhost). Set a monthly spend limit in the Anthropic console.

For local development, `npm run dev` uses a dev-only middleware in `vite.config.ts` that reads `OPENAI_API_KEY` from `.env`.

## Development

- Node.js 22
- `npm install`
- `npm run dev`
- `npm run build`
