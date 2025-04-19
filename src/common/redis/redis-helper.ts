import redis from './redis-client';

const CACHE_TTL_SECONDS = 300; // 5 minutes

export const getFromCache = async (key: string): Promise<string | null> => {
  return await redis.get(key);
};

export const setCache = async (key: string, value: any, ttl: number = CACHE_TTL_SECONDS): Promise<void> => {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
};

export const deleteCache = async (key: string): Promise<void> => {
  await redis.del(key);
};
