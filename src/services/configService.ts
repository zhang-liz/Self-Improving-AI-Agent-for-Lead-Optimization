import type { AttributionMode } from '../utils/sentimentAnalysis';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ScoringConfig {
  scoringWeights: Record<string, number>;
  attributionMode: AttributionMode;
  timeDecayLambda: number;
}

export async function getConfig(): Promise<ScoringConfig | null> {
  try {
    const res = await fetch(`${API_URL}/api/config`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      scoringWeights: data.scoringWeights ?? {},
      attributionMode: data.attributionMode ?? 'time_decay',
      timeDecayLambda: data.timeDecayLambda ?? 0.1
    };
  } catch {
    return null;
  }
}

export async function updateConfig(patch: Partial<ScoringConfig>): Promise<ScoringConfig | null> {
  try {
    const res = await fetch(`${API_URL}/api/config`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
