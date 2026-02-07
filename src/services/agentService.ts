import type { Lead, TeamMetrics, Recommendations } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getRecommendations(
  leads: Lead[],
  teamMetrics?: TeamMetrics | null
): Promise<Recommendations | null> {
  try {
    const payload = {
      leads: leads.map(l => ({
        id: l.id,
        name: l.name,
        company: l.company,
        engagementScore: l.engagementScore,
        trend: l.trend,
        stage: l.stage,
        lastInteraction: l.lastInteraction
      })),
      teamMetrics: teamMetrics ?? undefined
    };
    const res = await fetch(`${API_URL}/api/agent/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function recordFeedback(
  leadId: string,
  outcomeType: 'helpful' | 'not_helpful' | 'contacted' | 'dismissed',
  recommendationId?: string | null
): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/agent/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, outcomeType, recommendationId })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function runImprove(): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/api/agent/improve`, { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, message: data.message };
  } catch {
    return { success: false };
  }
}
