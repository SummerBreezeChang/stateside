# Stateside web app

The application lives in this directory. It is a three-screen, fixture-first Next.js/vinext demo built with Tailwind and shadcn-style local UI primitives.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server. The sample judge flow does not require an API key because it renders from `fixtures/analysis.json`, a saved structured GPT-5.6 response.

To regenerate that fixture, create `.env.local` with `OPENAI_API_KEY`, then run:

```bash
npm run fixture:generate
```

Never commit `.env.local`; it is ignored by Git.

## Verify

```bash
npm run lint
npm test
```

The app also exposes direct demonstrations of defensive states at `/?state=loading`, `/?state=error`, and `/?state=malformed`.
