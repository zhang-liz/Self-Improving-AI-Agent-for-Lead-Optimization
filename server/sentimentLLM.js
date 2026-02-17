/**
 * LLM-based sentiment analysis with aspect-based sentiment (ABSA).
 * Uses OpenAI for nuanced product, price, urgency, and general sentiment.
 * Falls back to keyword sentiment if API key is missing.
 */

import OpenAI from 'openai';

const ASPECTS = ['product', 'price', 'urgency', 'general'];

const SYSTEM_PROMPT = `You analyze B2B sales/customer interaction text for sentiment. Return a JSON object with:
- sentiment: "positive" | "neutral" | "negative" (overall)
- score: number from -1 to 1 (negative to positive)
- confidence: number from 0 to 1
- aspects: object with keys "product", "price", "urgency", "general" - each has { sentiment, score } where score is -1 to 1

Be concise. Focus on buyer intent and engagement signals.`;

export async function analyzeSentimentLLM(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY required for LLM sentiment');
  }

  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_SENTIMENT_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Analyze sentiment for this B2B interaction:\n\n"${text.slice(0, 2000)}"` }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error('No LLM response');

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Invalid JSON from LLM');
  }

  const sentiment = ['positive', 'neutral', 'negative'].includes(parsed.sentiment)
    ? parsed.sentiment
    : 'neutral';
  const score = typeof parsed.score === 'number' ? Math.max(-1, Math.min(1, parsed.score)) : 0;
  const confidence = typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.8;

  const aspects = {};
  for (const key of ASPECTS) {
    const a = parsed.aspects?.[key];
    aspects[key] = {
      sentiment: ['positive', 'neutral', 'negative'].includes(a?.sentiment) ? a.sentiment : 'neutral',
      score: typeof a?.score === 'number' ? Math.max(-1, Math.min(1, a.score)) : 0
    };
  }

  return {
    sentiment,
    score,
    confidence,
    keywords: [], // LLM doesn't return keywords; keep for API compatibility
    aspects
  };
}
