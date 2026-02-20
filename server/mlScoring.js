/**
 * ML-style lead scoring: linear model over features (stage, recency, interaction count, sentiment, intent).
 * Weights can be trained from feedback (logistic regression) or use defaults.
 * Research: B2B lead conversion is well predicted by source, lead status, and engagement (González-Flores et al. 2025).
 */

const STAGES = ['prospect', 'qualified', 'opportunity', 'customer'];

function sigmoid(x) {
  const t = Math.max(-500, Math.min(500, x));
  return 1 / (1 + Math.exp(-t));
}

/**
 * Extract a fixed feature vector for a lead.
 * @param {Object} lead - { stage, source, lastInteraction, totalInteractions, engagementScore }
 * @param {Array} interactions - that lead's interactions (for sentiment/intent)
 * @returns {Object} { vec: number[], keys: string[] }
 */
export function extractFeatures(lead, interactions = []) {
  const now = Date.now();
  const lastTs = lead.lastInteraction ? new Date(lead.lastInteraction).getTime() : now;
  const recencyDays = (now - lastTs) / (24 * 60 * 60 * 1000);
  const recencyNorm = 1 / (1 + recencyDays / 30); // 0-1, recent = high

  const count = lead.totalInteractions ?? interactions.length ?? 0;
  const countNorm = Math.min(count / 20, 1);

  let avgSentiment = 0;
  if (interactions.length > 0) {
    const sum = interactions.reduce((s, i) => s + (i.sentimentScore ?? 0), 0);
    avgSentiment = sum / interactions.length;
  }
  const sentimentNorm = (avgSentiment + 1) / 2; // -1..1 -> 0..1

  let intentStrength = 0;
  const signals = lead.intentSignals || [];
  if (signals.some(s => s.strength === 'high')) intentStrength = 1;
  else if (signals.some(s => s.strength === 'medium')) intentStrength = 0.5;

  const stageIdx = STAGES.indexOf(lead.stage);
  const stageOneHot = STAGES.map((_, i) => (i === stageIdx ? 1 : 0));

  const vec = [
    ...stageOneHot,
    recencyNorm,
    countNorm,
    sentimentNorm,
    intentStrength
  ];
  const keys = [
    'stage_prospect', 'stage_qualified', 'stage_opportunity', 'stage_customer',
    'recency', 'count', 'sentiment', 'intent'
  ];
  return { vec, keys };
}

/**
 * Default weights (bias + 8 features). Tuned so score spreads roughly 20-80 without training.
 */
function getDefaultWeights() {
  return {
    bias: -0.8,
    stage_prospect: -0.2,
    stage_qualified: 0.1,
    stage_opportunity: 0.4,
    stage_customer: 0.5,
    recency: 0.6,
    count: 0.3,
    sentiment: 0.5,
    intent: 0.8
  };
}

/**
 * Compute ML score 0-100 from feature vector and weights.
 */
export function scoreFromFeatures(vec, keys, weights) {
  const w = weights || getDefaultWeights();
  let z = w.bias ?? -0.8;
  for (let i = 0; i < keys.length; i++) {
    z += (w[keys[i]] ?? 0) * (vec[i] ?? 0);
  }
  return Math.round(100 * sigmoid(z));
}

/**
 * Score one lead; returns mlScore and featureContributions for explainability.
 */
export function scoreLead(lead, interactions, weights) {
  const { vec, keys } = extractFeatures(lead, interactions);
  const w = weights || getDefaultWeights();
  const contributions = {};
  let z = w.bias ?? -0.8;
  for (let i = 0; i < keys.length; i++) {
    const term = (w[keys[i]] ?? 0) * (vec[i] ?? 0);
    contributions[keys[i]] = Math.round(100 * term) / 100;
    z += term;
  }
  const mlScore = Math.round(100 * sigmoid(z));
  return { mlScore, contributions, featureVector: keys };
}

/**
 * Batch score leads. interactionsByLead: Map<leadId, interactions[]> or object.
 */
export function scoreLeadsBatch(leads, interactionsByLead, weights) {
  const byLead = new Map();
  if (Array.isArray(interactionsByLead)) {
    for (const i of interactionsByLead) {
      if (!byLead.has(i.leadId)) byLead.set(i.leadId, []);
      byLead.get(i.leadId).push(i);
    }
  } else if (interactionsByLead && typeof interactionsByLead === 'object' && !Array.isArray(interactionsByLead)) {
    for (const [leadId, arr] of Object.entries(interactionsByLead)) {
      byLead.set(leadId, Array.isArray(arr) ? arr : []);
    }
  }

  return leads.map(lead => {
    const interactions = byLead.get(lead.id) || [];
    const { mlScore, contributions } = scoreLead(lead, interactions, weights);
    return {
      leadId: lead.id,
      engagementScore: lead.engagementScore ?? lead.vibeScore ?? 50,
      mlScore,
      featureContributions: contributions
    };
  });
}

/**
 * Feature importance = absolute weight (for linear model).
 */
export function getFeatureImportance(weights) {
  const w = weights || getDefaultWeights();
  const keys = ['stage_prospect', 'stage_qualified', 'stage_opportunity', 'stage_customer', 'recency', 'count', 'sentiment', 'intent'];
  const importance = {};
  for (const k of keys) {
    importance[k] = Math.abs(w[k] ?? 0);
  }
  return importance;
}
