import { app } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { connectRedis, disconnectRedis } from './config/redis';

const PORT = Number(process.env.PORT || 5000);

let server: ReturnType<typeof app.listen> | undefined;

const shutdown = async (signal: string) => {
  console.log(`[INFO] Received ${signal}; shutting down gracefully`);

  if (server) {
    server.close(() => {
      console.log('[INFO] HTTP server closed');
    });
  }

  await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);
  process.exit(0);
};

const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();

    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[INFO] Server started on 0.0.0.0:${PORT} in ${env.nodeEnv} mode`);
    });

    process.on('SIGINT', () => {
      void shutdown('SIGINT');
    });

    process.on('SIGTERM', () => {
      void shutdown('SIGTERM');
    });
  } catch (error) {
    console.error('[ERROR] Startup failed:', error);
    process.exit(1);
  }
};

void startServer();
