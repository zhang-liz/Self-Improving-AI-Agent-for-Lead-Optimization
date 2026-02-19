/**
 * Preference learning from thumbs up/down feedback.
 * Bandit-style weight update: positive feedback boosts features, negative reduces them.
 * Derives stageWeights and sourceWeights from (leadId, outcomeType, metadata) pairs.
 */

const LEARNING_RATE = 0.15;
const SMOOTHING = 2;
const MIN_WEIGHT = 0.5;
const MAX_WEIGHT = 1.5;

/**
 * Compute learned weights for stage and source from feedback.
 * @param {Array} feedback - [{ leadId, outcomeType, metadata: { stage?, source? } }]
 * @returns {{ stageWeights: Object, sourceWeights: Object } | null}
 */
export function computeLearnedWeights(feedback) {
  const helpful = feedback.filter(f => f.outcomeType === 'helpful');
  const notHelpful = feedback.filter(f => f.outcomeType === 'not_helpful');

  if (helpful.length === 0 && notHelpful.length === 0) return null;

  const stageCounts = {};
  const sourceCounts = {};

  function ensureKey(counts, key) {
    if (!counts[key]) counts[key] = { pos: 0, neg: 0 };
  }

  for (const f of helpful) {
    const m = f.metadata || {};
    if (m.stage) {
      ensureKey(stageCounts, m.stage);
      stageCounts[m.stage].pos++;
    }
    if (m.source) {
      ensureKey(sourceCounts, m.source);
      sourceCounts[m.source].pos++;
    }
  }

  for (const f of notHelpful) {
    const m = f.metadata || {};
    if (m.stage) {
      ensureKey(stageCounts, m.stage);
      stageCounts[m.stage].neg++;
    }
    if (m.source) {
      ensureKey(sourceCounts, m.source);
      sourceCounts[m.source].neg++;
    }
  }

  const stageWeights = {};
  const sourceWeights = {};

  for (const [stage, { pos, neg }] of Object.entries(stageCounts)) {
    const total = pos + neg + SMOOTHING;
    const delta = (pos - neg) / total;
    const adj = LEARNING_RATE * delta;
    stageWeights[stage] = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, 1 + adj));
  }

  for (const [source, { pos, neg }] of Object.entries(sourceCounts)) {
    const total = pos + neg + SMOOTHING;
    const delta = (pos - neg) / total;
    const adj = LEARNING_RATE * delta;
    sourceWeights[source] = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, 1 + adj));
  }

  return {
    stageWeights: Object.keys(stageWeights).length > 0 ? stageWeights : null,
    sourceWeights: Object.keys(sourceWeights).length > 0 ? sourceWeights : null
  };
}

/**
 * Merge learned weights with existing config weights.
 * New learned values override; we keep existing for keys not in feedback.
 */
export function mergeWeights(existingStage, existingSource, learned) {
  const stageWeights = { ...(existingStage || {}) };
  const sourceWeights = { ...(existingSource || {}) };

  if (learned?.stageWeights) {
    for (const [k, v] of Object.entries(learned.stageWeights)) {
      stageWeights[k] = v;
    }
  }
  if (learned?.sourceWeights) {
    for (const [k, v] of Object.entries(learned.sourceWeights)) {
      sourceWeights[k] = v;
    }
  }

  return { stageWeights, sourceWeights };
}
