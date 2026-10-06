import crypto from 'crypto';
import { env } from '../config/env';
import { redisClient } from '../config/redis';

const defaultTtl = env.redisCacheTtl;

export const normalizeAgentListQuery = (query: Record<string, any>) => {
  const normalized = { ...query };
  const ordered: Record<string, any> = {};
  for (const key of Object.keys(normalized).sort()) {
    if (normalized[key] !== undefined && normalized[key] !== null && normalized[key] !== '') {
      ordered[key] = normalized[key];
    }
  }
  return ordered;
};

export const buildAgentListCacheKey = (query: Record<string, any>) => {
  const normalized = normalizeAgentListQuery(query);
  const hash = crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  return `agents:list:${hash}`;
};

export const buildAgentCacheKey = (id: string) => `agents:id:${id}`;

const isRedisAvailable = async (): Promise<boolean> => {
  try {
    return !!redisClient && redisClient.isOpen;
  } catch {
    return false;
  }
};

export const getCachedAgent = async (id: string) => {
  try {
    if (!(await isRedisAvailable())) return null;
    const key = buildAgentCacheKey(id);
    const cached = await redisClient.get(key);
    if (cached) {
      console.log('[INFO] Cache HIT:', key);
      return JSON.parse(cached);
    }
    console.log('[INFO] Cache MISS:', key);
    return null;
  } catch (error) {
    console.error('[ERROR] Redis getCachedAgent failed:', error);
    return null;
  }
};

export const setCachedAgent = async (id: string, value: unknown) => {
  try {
    if (!(await isRedisAvailable())) return;
    const key = buildAgentCacheKey(id);
    await redisClient.set(key, JSON.stringify(value), { EX: defaultTtl });
  } catch (error) {
    console.error('[ERROR] Redis setCachedAgent failed:', error);
  }
};

export const getCachedAgentList = async (query: Record<string, any>) => {
  try {
    if (!(await isRedisAvailable())) return null;
    const key = buildAgentListCacheKey(query);
    const cached = await redisClient.get(key);
    if (cached) {
      console.log('[INFO] Cache HIT:', key);
      return JSON.parse(cached);
    }
    console.log('[INFO] Cache MISS:', key);
    return null;
  } catch (error) {
    console.error('[ERROR] Redis getCachedAgentList failed:', error);
    return null;
  }
};

export const setCachedAgentList = async (query: Record<string, any>, value: unknown) => {
  try {
    if (!(await isRedisAvailable())) return;
    const key = buildAgentListCacheKey(query);
    await redisClient.set(key, JSON.stringify(value), { EX: defaultTtl });
  } catch (error) {
    console.error('[ERROR] Redis setCachedAgentList failed:', error);
  }
};

export const invalidateAgentCache = async (id: string) => {
  try {
    if (!(await isRedisAvailable())) return;
    const key = buildAgentCacheKey(id);
    await redisClient.del(key);
    console.log('[INFO] Cache invalidated:', key);
  } catch (error) {
    console.error('[ERROR] Redis invalidateAgentCache failed:', error);
  }
};

export const invalidateAgentListCaches = async () => {
  try {
    if (!(await isRedisAvailable())) return;
    for await (const key of redisClient.scanIterator({ MATCH: 'agents:list:*', COUNT: 100 })) {
      await redisClient.del(key);
    }
    console.log('[INFO] Cache invalidated: all agent list caches');
  } catch (error) {
    console.error('[ERROR] Redis invalidateAgentListCaches failed:', error);
  }
};
