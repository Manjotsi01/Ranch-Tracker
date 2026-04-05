interface CacheEntry<T> {
  data:      T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export const cached = async <T>(
  key:   string,
  ttlMs: number,
  fn:    () => Promise<T>,
): Promise<T> => {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.data as T;
  }
  const data = await fn();
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
  return data;
};

export const invalidate = (prefix: string): void => {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
};

export const clearAll = (): void => store.clear();