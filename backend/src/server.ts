import { app } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { connectRedis } from './config/redis';

const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();
    app.listen(env.port, () => {
      console.log(`[INFO] Server started on port ${env.port}`);
    });
  } catch (error) {
    console.error('[ERROR] Startup failed:', error);
    process.exit(1);
  }
};

startServer();
