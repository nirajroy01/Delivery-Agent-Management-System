import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import agentRoutes from './routes/agent.routes';
import analyticsRoutes from './routes/analytics.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { notFoundMiddleware } from './middleware/not-found.middleware';
import { env } from './config/env';

export const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
