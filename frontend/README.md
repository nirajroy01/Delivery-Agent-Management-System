# Frontend UI

This app is built with Next.js, TypeScript, and Tailwind CSS.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — build the app
- `npm start` — run the production server

## Setup

1. Copy `.env.example` to `.env` if you need a custom API origin.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.

The frontend connects to the production API through Nginx at `http://3.93.44.49/api` by default. Local development can override the host in `.env` as needed.
