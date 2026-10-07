# Backend API

This folder contains the Express + TypeScript API for the Delivery Agent Management System.

## Scripts

- `npm run dev` — start the API in development mode
- `npm run build` — compile TypeScript
- `npm start` — run the built server from `dist`
- `npm test` — run Jest tests
- `npm run seed` — populate MongoDB with sample agents

## Local setup

1. Copy `.env.example` to `.env` and update values for your environment.
2. Start MongoDB and Redis using Docker Compose from the repo root:
   `docker compose up -d`
3. Install dependencies:
   `npm install`
4. Run the API:
   `npm run dev`

## Production deployment

This backend is designed for a direct Node.js deployment on Ubuntu EC2 behind Nginx, while keeping local Docker Compose support for MongoDB and Redis.

### Required environment variables

- `PORT` — default `5000`
- `NODE_ENV` — use `production` in deployed environments
- `MONGODB_URI` — MongoDB connection string
- `REDIS_URL` — Redis connection string
- `REDIS_CACHE_TTL` — cache lifetime in seconds
- `JWT_SECRET` — JWT signing secret
- `JWT_EXPIRES_IN` — token lifetime
- `FRONTEND_URL` — deployed frontend origin
- `CORS_ORIGIN` — production frontend origin used by CORS

### Production commands

```bash
npm ci
npm run build
npm test
npm start
```

The production start command executes the compiled JavaScript from `dist/server.js` and is suitable for PM2 or a systemd service.

### Health check

```bash
curl http://localhost:5000/api/health
```

## Cache behavior

The backend uses Redis with a cache-aside strategy for GET agent list and agent detail endpoints. Cache keys are generated from normalized query parameters and invalidated on create, update, and delete.

See [../DEPLOYMENT.md](../DEPLOYMENT.md) for EC2 Ubuntu deployment steps and reverse-proxy guidance.
