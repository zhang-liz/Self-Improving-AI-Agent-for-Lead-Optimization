import type { Lead, TeamMetrics, Recommendations, Interaction } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** Build feedback metadata for preference learning and ML (stage, source, recencyNorm, countNorm, sentimentNorm, intentNorm) */
export function buildFeedbackMetadata(lead: Lead, interactions?: Interaction[]): FeedbackMetadata {
  const now = Date.now();
  const lastTs = lead.lastInteraction ? new Date(lead.lastInteraction).getTime() : now;
  const recencyDays = (now - lastTs) / (24 * 60 * 60 * 1000);
  const recencyNorm = 1 / (1 + recencyDays / 30);

  const count = lead.totalInteractions ?? interactions?.length ?? 0;
  const countNorm = Math.min(count / 20, 1);

  let sentimentNorm = 0.5;
  if (interactions && interactions.length > 0) {
    const sum = interactions.reduce((s, i) => s + (i.sentimentScore ?? 0), 0);
    sentimentNorm = (sum / interactions.length + 1) / 2;
  }

  let intentNorm = 0;
  const signals = lead.intentSignals ?? [];
  if (signals.some(s => s.strength === 'high')) intentNorm = 1;
  else if (signals.some(s => s.strength === 'medium')) intentNorm = 0.5;

  return {
    stage: lead.stage,
    source: lead.source,
    recencyNorm,
    countNorm,
    sentimentNorm,
    intentNorm
  };
}

export async function getRecommendations(
  leads: Lead[],
  teamMetrics?: TeamMetrics | null,
  interactions?: Interaction[] | null
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
        lastInteraction: l.lastInteraction,
        totalInteractions: l.totalInteractions,
        email: l.email,
        position: l.position,
        source: l.source
      })),
      teamMetrics: teamMetrics ?? undefined,
      interactions: (interactions ?? []).map(i => ({
        id: i.id,
        leadId: i.leadId,
        type: i.type,
        content: i.content,
        sentiment: i.sentiment,
        sentimentScore: i.sentimentScore,
        timestamp: i.timestamp,
        source: i.source,
        metadata: i.metadata,
        intentSignals: i.intentSignals
      }))
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

/** Lead metadata for preference learning and ML (stage, source, normalized features) */
export interface FeedbackMetadata {
  stage?: string;
  source?: string;
  /** 0–1, recency of last interaction */
  recencyNorm?: number;
  /** 0–1, interaction count cap at 20 */
  countNorm?: number;
  /** 0–1, average sentiment from interactions */
  sentimentNorm?: number;
  /** 0, 0.5, or 1 for intent strength */
  intentNorm?: number;
}

export async function recordFeedback(
  leadId: string,
  outcomeType: 'helpful' | 'not_helpful' | 'contacted' | 'dismissed',
  recommendationId?: string | null,
  metadata?: FeedbackMetadata | null
): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/agent/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, outcomeType, recommendationId, metadata: metadata ?? {} })
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

export interface MLScoreResult {
  leadId: string;
  engagementScore: number;
  mlScore: number;
  featureContributions: Record<string, number>;
}

export async function getMLScores(
  leads: Lead[],
  interactions?: Interaction[] | null
): Promise<{ scores: MLScoreResult[]; featureImportance: Record<string, number> | null } | null> {
  try {
    const payload = {
      leads: leads.map(l => ({
        id: l.id,
        stage: l.stage,
        source: l.source,
        lastInteraction: l.lastInteraction,
        totalInteractions: l.totalInteractions,
        engagementScore: l.engagementScore,
        intentSignals: l.intentSignals
      })),
      interactions: (interactions ?? []).map(i => ({
        leadId: i.leadId,
        sentimentScore: i.sentimentScore
      }))
    };
    const res = await fetch(`${API_URL}/api/score/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { scores: data.scores ?? [], featureImportance: data.featureImportance ?? null };
  } catch {
    return null;
  }
}
