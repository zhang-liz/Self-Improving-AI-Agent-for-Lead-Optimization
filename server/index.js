import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeSentiment as keywordSentiment } from './sentimentKeyword.js';
import { analyzeSentimentLLM } from './sentimentLLM.js';
import { getConfig, getConfigHistory, applyPatch, rollback } from './agentConfig.js';
import { addFeedback, getRecentFeedback } from './feedbackStore.js';
import { getCached, setCached } from './recommendCache.js';
import { runRecommendWithTools } from './agentTools.js';
import { getCached as getSentimentCached, setCached as setSentimentCached } from './sentimentCache.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SENTIMENT_PROVIDER = process.env.SENTIMENT_PROVIDER || 'keyword';

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    sentimentProvider: SENTIMENT_PROVIDER
  });
});

app.get('/api/config', (_req, res) => {
  try {
    const config = getConfig();
    res.json({ scoringWeights: config.scoringWeights });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get config' });
  }
});

app.post('/api/sentiment', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid text' });
    }
    const cached = getSentimentCached(text);
    if (cached) return res.json(cached);

    const useLLM = SENTIMENT_PROVIDER === 'llm' && process.env.OPENAI_API_KEY;
    let result;
    if (useLLM) {
      try {
        result = await analyzeSentimentLLM(text);
      } catch (llmErr) {
        console.warn('LLM sentiment failed, falling back to keyword:', llmErr.message);
        result = keywordSentiment(text);
      }
    } else {
      result = keywordSentiment(text);
    }
    setSentimentCached(text, result);
    return res.json(result);
  } catch (err) {
    console.error('Sentiment error:', err);
    return res.status(500).json({ error: 'Sentiment analysis failed' });
  }
});

function buildRecommendations(leads, teamMetrics) {
  const sorted = [...leads].sort((a, b) => {
    const scoreA = a.engagementScore ?? a.vibeScore ?? 0;
    const scoreB = b.engagementScore ?? b.vibeScore ?? 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return new Date(b.lastInteraction) - new Date(a.lastInteraction);
  });
  const top = sorted.slice(0, 10);
  const prioritizedLeadIds = top.map(l => l.id);
  const suggestions = top.map(lead => {
    const score = lead.engagementScore ?? lead.vibeScore ?? 50;
    let action = 'Send follow-up email';
    let reason = `Lead score ${score}`;
    if (score >= 80) {
      action = 'Schedule call or demo';
      reason = 'High engagement – prioritize conversion';
    } else if (score < 50) {
      action = 'Nurture with content or check-in';
      reason = 'Lower engagement – re-engage';
    }
    return { leadId: lead.id, action, reason };
  });
  const summary = `Top ${prioritizedLeadIds.length} leads to contact by engagement score.`;
  return { prioritizedLeadIds, suggestions, summary };
}

app.post('/api/agent/recommend', async (req, res) => {
  try {
    const { leads = [], teamMetrics, interactions = [] } = req.body || {};
    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid leads array' });
    }
    const cached = getCached(leads, teamMetrics, interactions);
    if (cached) return res.json(cached);

    const useTools = Boolean(process.env.OPENAI_API_KEY);
    let result;
    if (useTools) {
      result = await runRecommendWithTools(leads, interactions, teamMetrics);
    } else {
      result = buildRecommendations(leads, teamMetrics);
    }
    setCached(leads, teamMetrics, result, interactions);
    res.json(result);
  } catch (err) {
    console.error('Recommend error:', err);
    res.status(500).json({ error: 'Recommendations failed' });
  }
});

app.post('/api/agent/feedback', (req, res) => {
  try {
    const { leadId, outcomeType, recommendationId, metadata } = req.body || {};
    if (!leadId) return res.status(400).json({ error: 'Missing leadId' });
    const record = addFeedback({ leadId, outcomeType, recommendationId, metadata });
    res.status(201).json(record);
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

app.post('/api/agent/improve', (req, res) => {
  try {
    const recent = getRecentFeedback(7);
    const config = getConfig();
    if (recent.length === 0) {
      return res.json({ success: true, message: 'No recent feedback to improve from' });
    }
    const patch = {
      scoringWeights: config.scoringWeights
    };
    applyPatch(patch);
    res.json({ success: true, message: 'Config updated', config: getConfig() });
  } catch (err) {
    console.error('Improve error:', err);
    res.status(500).json({ error: 'Improve failed' });
  }
});

app.get('/api/agent/config/history', (_req, res) => {
  try {
    res.json(getConfigHistory());
  } catch (err) {
    res.status(500).json({ error: 'Failed to get history' });
  }
});

app.post('/api/agent/config/rollback', (req, res) => {
  try {
    const { version } = req.body || {};
    if (version == null) return res.status(400).json({ error: 'Missing version' });
    const rolled = rollback(Number(version));
    if (!rolled) return res.status(404).json({ error: 'Version not found' });
    res.json(rolled);
  } catch (err) {
    console.error('Rollback error:', err);
    res.status(500).json({ error: 'Rollback failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
