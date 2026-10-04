# Tangent — AI Course Teacher

Tangent is a browser-based AI course teacher. This repository is configured in the accompanying source package to build and deploy its static frontend to GitHub Pages.

## GitHub Pages deployment

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Add the source package and workflow to `main`, or upload the ZIP contents through the GitHub website.
4. After the Pages workflow succeeds, open `https://jasonhuanggeorgia-cloud.github.io/Tangent/`.

The workflow builds the Vite app and publishes `dist/`. The Vite base path is set for this repository.

## AI backend requirement

GitHub Pages serves static assets only. It cannot run the Vite development API middleware, and an AI provider secret must never be placed in frontend code. The current frontend calls a Supabase Edge Function, but the included server function only implements a health check; it does not yet implement the `generate-course` or `generate-lesson` endpoints. Deploy and configure a secure Edge Function implementing those endpoints and set appropriate CORS/origin restrictions before expecting live AI generation to work. Never commit provider secrets.

## Development

- Node.js 22
- `npm install`
- `npm run dev`
- `npm run build`
