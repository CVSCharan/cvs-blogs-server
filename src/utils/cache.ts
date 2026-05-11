import NodeCache from 'node-cache';

// stdTTL: (default: 0) the standard ttl as number in seconds for every generated cache element. 0 = unlimited
// checkperiod: (default: 600) The period in seconds for the used check-period of used elements. 0 = no periodic check.
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export const get = <T>(key: string): T | undefined => {
  return cache.get<T>(key);
};

export const set = (key: string, value: any, ttl?: number): boolean => {
  if (ttl) {
    return cache.set(key, value, ttl);
  }
  return cache.set(key, value);
};

export const del = (keys: string | string[]): number => {
  return cache.del(keys);
};

export const flush = (): void => {
  cache.flushAll();
};

export default cache;
