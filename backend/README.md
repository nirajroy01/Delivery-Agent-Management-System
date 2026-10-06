# Backend API

This folder contains the Express + TypeScript API for the Delivery Agent Management System.

## Scripts

- `npm run dev` — start the API in development mode
- `npm run build` — compile TypeScript
- `npm start` — run the built server
- `npm test` — run Jest tests
- `npm run seed` — populate MongoDB with sample agents

## Local setup

1. Copy `.env.example` to `.env` and update values if needed.
2. Start MongoDB and Redis using Docker Compose from the repo root:
   `docker compose up -d`
3. Install dependencies:
   `npm install`
4. Run the API:
   `npm run dev`

## Environment variables

- `PORT` — default `5000`
- `MONGODB_URI` — MongoDB connection string
- `REDIS_URL` — Redis connection string
- `REDIS_CACHE_TTL` — cache lifetime in seconds
- `JWT_SECRET` — JWT signing secret
- `JWT_EXPIRES_IN` — token lifetime
- `CORS_ORIGIN` — frontend origin

## Cache behavior

The backend uses Redis with a cache-aside strategy for GET agent list and agent detail endpoints. Cache keys are generated from normalized query parameters and invalidated on create, update, and delete.
