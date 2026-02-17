/**
 * Buyer intent detection from B2B interaction content and metadata.
 * Detects hand-raise signals (demo, trial, form) and subtle signals (pricing, case study, etc.)
 * Based on 2024-2025 research on first-party intent data for lead qualification.
 */

// Hand-raise: explicit strong interest
const HAND_RAISE_PATTERNS = [
  { intent: 'demo_request', patterns: [/request.*demo/i, /schedule.*demo/i, /book.*demo/i, /demo.*request/i, /would like.*demo/i, /interested in.*demo/i] },
  { intent: 'trial_signup', patterns: [/start.*trial/i, /sign up.*trial/i, /free trial/i, /try.*free/i, /trial.*account/i] },
  { intent: 'quote_request', patterns: [/request.*quote/i, /get.*quote/i, /pricing quote/i, /send.*quote/i] },
  { intent: 'webinar_attendance', patterns: [/register.*webinar/i, /attend.*webinar/i, /signed up.*webinar/i] },
  { intent: 'contact_request', patterns: [/contact me/i, /call me/i, /reach out/i, /get in touch/i, /someone.*contact/i] }
];

// Subtle: implicit interest signals
const SUBTLE_PATTERNS = [
  { intent: 'pricing_view', patterns: [/pricing/i, /how much/i, /cost/i, /price/i, /budget/i, /\$|usd|dollars/i] },
  { intent: 'case_study', patterns: [/case study/i, /success story/i, /customer story/i, /similar.*company/i] },
  { intent: 'competitor_research', patterns: [/compared to/i, /vs\.?\s+\w+/i, /alternative to/i, /instead of/i, /migration from/i] },
  { intent: 'feature_inquiry', patterns: [/tell me more about/i, /how does.*work/i, /does it support/i, /can it.*do/i] },
  { intent: 'implementation_interest', patterns: [/implementation/i, /onboarding/i, /setup/i, /integration/i, /api/i] }
];

// Negative / low-intent signals
const LOW_INTENT_PATTERNS = [
  { intent: 'not_interested', patterns: [/not interested/i, /no thanks/i, /remove.*list/i, /unsubscribe/i] },
  { intent: 'postpone', patterns: [/postpone/i, /next quarter/i, /next year/i, /budget.*constraint/i, /not.*right now/i] }
];

function extractFromText(text, metadata = {}) {
  const combined = [text, metadata.subject, metadata.channel].filter(Boolean).join(' ');
  const lower = combined.toLowerCase();
  const signals = [];

  for (const { intent, patterns } of HAND_RAISE_PATTERNS) {
    if (patterns.some(p => p.test(combined))) {
      signals.push({ intent, strength: 'high', source: 'content' });
    }
  }
  for (const { intent, patterns } of SUBTLE_PATTERNS) {
    if (patterns.some(p => p.test(combined)) && !signals.some(s => s.intent === intent)) {
      signals.push({ intent, strength: 'medium', source: 'content' });
    }
  }
  for (const { intent, patterns } of LOW_INTENT_PATTERNS) {
    if (patterns.some(p => p.test(combined))) {
      signals.push({ intent, strength: 'low', source: 'content' });
    }
  }

  // Infer from metadata
  if (metadata.subject) {
    const subj = metadata.subject.toLowerCase();
    if (/demo|schedule|book/.test(subj) && !signals.some(s => s.intent === 'demo_request')) {
      signals.push({ intent: 'demo_request', strength: 'high', source: 'subject' });
    }
    if (/pricing|quote|cost/.test(subj) && !signals.some(s => s.intent === 'pricing_view')) {
      signals.push({ intent: 'pricing_view', strength: 'medium', source: 'subject' });
    }
  }

  return signals;
}

/**
 * Extract intent signals from a single interaction.
 * @param {Object} interaction - { content, metadata?: { subject, channel } }
 * @returns {Array<{intent: string, strength: string, source: string}>}
 */
export function extractIntent(interaction) {
  const content = interaction.content || '';
  const metadata = interaction.metadata || {};
  return extractFromText(content, metadata);
}

/**
 * Aggregate intent signals across all interactions for a lead.
 * @param {Array} interactions - List of interactions with content and metadata
 * @returns {Object} { signals: [...], summary: string, topIntent: string }
 */
export function aggregateLeadIntent(interactions) {
  const byIntent = new Map();
  let hasHigh = false;
  let hasLow = false;

  for (const i of interactions || []) {
    const extracted = extractIntent(i);
    for (const s of extracted) {
      const key = s.intent;
      if (!byIntent.has(key)) byIntent.set(key, { intent: key, strength: s.strength, count: 0 });
      byIntent.get(key).count++;
      if (s.strength === 'high') hasHigh = true;
      if (s.strength === 'low') hasLow = true;
    }
  }

  const signals = Array.from(byIntent.values()).sort((a, b) => b.count - a.count);
  const topIntent = signals[0]?.intent || null;
  let summary = 'No clear intent signals';
  if (hasHigh) summary = 'Strong buying signals (demo, trial, or quote interest)';
  else if (signals.length > 0) summary = `Interest in: ${signals.slice(0, 3).map(s => s.intent.replace(/_/g, ' ')).join(', ')}`;
  if (hasLow) summary += '; some hesitation or postponement signals';

  return { signals, summary, topIntent };
}
