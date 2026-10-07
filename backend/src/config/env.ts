import dotenv from 'dotenv';

dotenv.config();

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
};

const getOptionalLocalDefault = (key: string, fallback: string): string => {
  const value = process.env[key];
  if (value && value.trim()) {
    return value.trim();
  }

  return process.env.NODE_ENV === 'production' ? getRequiredEnv(key) : fallback;
};

const getCorsOrigins = (): string | string[] => {
  const configuredOrigins = [process.env.CORS_ORIGIN, process.env.FRONTEND_URL]
    .filter((value): value is string => Boolean(value && value.trim()))
    .flatMap((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean));

  if (configuredOrigins.length > 0) {
    return configuredOrigins.length === 1 ? configuredOrigins[0] : configuredOrigins;
  }

  return process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3000', 'http://localhost:3001'];
};

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: getOptionalLocalDefault('MONGODB_URI', 'mongodb://localhost:27017/delivery_agent_management'),
  redisUrl: getOptionalLocalDefault('REDIS_URL', 'redis://localhost:6379'),
  redisCacheTtl: Number(process.env.REDIS_CACHE_TTL || 60),
  jwtSecret: process.env.JWT_SECRET || getRequiredEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  corsOrigin: getCorsOrigins(),
};
