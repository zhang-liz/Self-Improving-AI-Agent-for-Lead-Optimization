// TTL for recommendation cache: 5–15 min (env RECOMMEND_CACHE_TTL_MIN, default 10)
const TTL_MIN = Math.min(15, Math.max(5, Number(process.env.RECOMMEND_CACHE_TTL_MIN) || 10));
const TTL_MS = TTL_MIN * 60 * 1000;
const cache = new Map();

/** Hash lead-set + teamMetrics + interactions for cache key (same inputs => same recommendations). */
function leadSetHash(leads, teamMetrics, interactions) {
  const payload = {
    leads: leads.map(l => l.id).sort(),
    teamMetrics: teamMetrics || {},
    interactions: (interactions || []).map(i => ({ leadId: i.leadId, id: i.id })).sort((a, b) => (a.leadId + a.id).localeCompare(b.leadId + b.id))
  };
  const str = JSON.stringify(payload);
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i) | 0;
  }
  return String(h);
}

export function getCached(leads, teamMetrics, interactions) {
  const key = leadSetHash(leads, teamMetrics, interactions);
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.result;
}

export function setCached(leads, teamMetrics, result, interactions) {
  const key = leadSetHash(leads, teamMetrics, interactions);
  cache.set(key, { result, expiresAt: Date.now() + TTL_MS });
}
