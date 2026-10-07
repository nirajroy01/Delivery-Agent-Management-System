import mongoose from 'mongoose';
import { env } from './env';

export const connectDatabase = async (): Promise<void> => {
  if (!env.mongoUri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log(`[INFO] MongoDB connected in ${env.nodeEnv} mode`);
  } catch (error) {
    console.error('[ERROR] MongoDB connection failed:', error instanceof Error ? error.message : error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[INFO] MongoDB disconnected');
  }
};
