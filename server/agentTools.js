/**
 * Agent with tool use: get_lead_details(leadId), get_recent_interactions(leadId, limit), get_intent_signals(leadId).
 * Recommendations are grounded in real lead and interaction data, including buyer intent.
 */

import OpenAI from 'openai';
import { getConfig } from './agentConfig.js';
import { aggregateLeadIntent, extractIntent } from './intentDetection.js';

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_lead_details',
      description: 'Get full details for a single lead by ID. Use this to inspect score, stage, company, and contact info before recommending an action.',
      parameters: {
        type: 'object',
        properties: {
          leadId: { type: 'string', description: 'The lead ID (e.g. lead1, lead2)' }
        },
        required: ['leadId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_recent_interactions',
      description: 'Get recent interactions for a lead (emails, chats, support tickets). Use this to tailor the recommendation based on what was said and sentiment.',
      parameters: {
        type: 'object',
        properties: {
          leadId: { type: 'string', description: 'The lead ID' },
          limit: { type: 'number', description: 'Max number of interactions to return (default 10)', default: 10 }
        },
        required: ['leadId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_intent_signals',
      description: 'Get buyer intent signals for a lead (demo request, pricing interest, trial signup, etc.). High-strength signals indicate strong buying interest.',
      parameters: {
        type: 'object',
        properties: {
          leadId: { type: 'string', description: 'The lead ID' }
        },
        required: ['leadId']
      }
    }
  }
];

function buildToolImplementations(leads, interactions) {
  const leadById = new Map(leads.map(l => [l.id, l]));
  const interactionsByLead = new Map();
  for (const i of interactions || []) {
    if (!interactionsByLead.has(i.leadId)) interactionsByLead.set(i.leadId, []);
    interactionsByLead.get(i.leadId).push(i);
  }
  for (const arr of interactionsByLead.values()) {
    arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  return {
    get_lead_details(leadId) {
      const lead = leadById.get(leadId);
      if (!lead) return { error: 'Lead not found', leadId };
      const interactions = interactionsByLead.get(leadId) || [];
      const intent = aggregateLeadIntent(interactions);
      return {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        position: lead.position,
        engagementScore: lead.engagementScore ?? lead.vibeScore,
        previousScore: lead.previousScore,
        trend: lead.trend,
        stage: lead.stage,
        source: lead.source,
        lastInteraction: lead.lastInteraction,
        totalInteractions: lead.totalInteractions,
        intentSignals: intent.signals,
        intentSummary: intent.summary,
        topIntent: intent.topIntent
      };
    },
    get_recent_interactions(leadId, limit = 10) {
      const list = interactionsByLead.get(leadId) || [];
      const recent = list.slice(0, limit).map(i => {
        const intentSignals = extractIntent(i);
        return {
          type: i.type,
          content: i.content?.slice(0, 500),
          sentiment: i.sentiment,
          sentimentScore: i.sentimentScore,
          timestamp: i.timestamp,
          source: i.source,
          subject: i.metadata?.subject,
          intentSignals
        };
      });
      return { leadId, count: recent.length, interactions: recent };
    },
    get_intent_signals(leadId) {
      const list = interactionsByLead.get(leadId) || [];
      const intent = aggregateLeadIntent(list);
      return { leadId, ...intent };
    }
  };
}

function parseRecommendationResponse(content) {
  if (!content || typeof content !== 'string') return null;
  const trimmed = content.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    const prioritizedLeadIds = Array.isArray(parsed.prioritizedLeadIds)
      ? parsed.prioritizedLeadIds
      : suggestions.map(s => s.leadId);
    return {
      prioritizedLeadIds,
      suggestions: suggestions.map(s => ({
        leadId: s.leadId || s.lead_id,
        action: s.action || 'Follow up',
        reason: s.reason || ''
      })),
      summary: typeof parsed.summary === 'string' ? parsed.summary : undefined
    };
  } catch {
    return null;
  }
}

export async function runRecommendWithTools(leads, interactions, teamMetrics) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const config = getConfig();
  const toolsImpl = buildToolImplementations(leads, interactions);

  const leadSummary = leads.map(l => ({
    id: l.id,
    name: l.name,
    company: l.company,
    engagementScore: l.engagementScore ?? l.vibeScore,
    stage: l.stage,
    trend: l.trend
  }));

  const userMessage = {
    role: 'user',
    content: `You are given a list of ${leads.length} leads. Use the tools get_lead_details(leadId), get_recent_interactions(leadId), and get_intent_signals(leadId) to inspect the leads. Consider buyer intent signals (demo request, pricing interest, trial signup = high intent; pricing_view, case_study = medium intent) when prioritizing. Base recommendations on scores, stage, interaction content, sentiment, and intent. Team context: ${JSON.stringify(teamMetrics || {})}. Lead summary: ${JSON.stringify(leadSummary)}. Respond with a single JSON object: { "prioritizedLeadIds": ["id1", "id2", ...], "suggestions": [ { "leadId": "id1", "action": "...", "reason": "..." }, ... ], "summary": "Brief sentence." }`
  };

  const messages = [
    { role: 'system', content: config.systemPrompt + ' You have access to get_lead_details(leadId), get_recent_interactions(leadId), and get_intent_signals(leadId). Use intent signals to prioritize leads with strong buying interest. End by returning the JSON object only.' },
    userMessage
  ];

  const maxRounds = 10;
  for (let round = 0; round < maxRounds; round++) {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_RECOMMEND_MODEL || 'gpt-4o-mini',
      messages,
      tools: TOOLS,
      tool_choice: 'auto'
    });

    const choice = response.choices?.[0];
    if (!choice) {
      throw new Error('No completion choice');
    }

    const msg = choice.message;
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      messages.push(msg);
      for (const tc of msg.tool_calls) {
        const name = tc.function?.name;
        let args = {};
        try {
          args = JSON.parse(tc.function?.arguments || '{}');
        } catch {}
        let result;
        if (name === 'get_lead_details') {
          result = toolsImpl.get_lead_details(args.leadId);
        } else if (name === 'get_recent_interactions') {
          result = toolsImpl.get_recent_interactions(args.leadId, args.limit);
        } else if (name === 'get_intent_signals') {
          result = toolsImpl.get_intent_signals(args.leadId);
        } else {
          result = { error: 'Unknown tool', name };
        }
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(result)
        });
      }
      continue;
    }

    const content = msg.content;
    if (content) {
      const parsed = parseRecommendationResponse(content);
          if (parsed) return parsed;
    }
    break;
  }

  throw new Error('Agent did not return valid recommendations JSON');
}
