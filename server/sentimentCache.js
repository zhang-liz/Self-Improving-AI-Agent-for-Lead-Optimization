import crypto from 'crypto';

const MAX_ENTRIES = 10000;
const cache = new Map();
const keyOrder = [];

function contentHash(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function evictIfNeeded() {
  while (cache.size >= MAX_ENTRIES && keyOrder.length > 0) {
    const oldest = keyOrder.shift();
    cache.delete(oldest);
  }
}

export function getCached(text) {
  const key = contentHash(text);
  return cache.get(key) ?? null;
}

export function setCached(text, result) {
  const key = contentHash(text);
  if (cache.has(key)) return;
  evictIfNeeded();
  keyOrder.push(key);
  cache.set(key, result);
}
