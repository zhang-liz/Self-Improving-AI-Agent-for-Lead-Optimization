import type { Lead, Interaction, ScoreHistory, TeamMetrics } from '../types';
import { calculateEngagementScore, getScoreTrend } from '../utils/sentimentAnalysis';
import { extractIntent } from '../utils/intentDetection';

function enrichWithIntent(i: Omit<Interaction, 'intentSignals'>): Interaction {
  const intentSignals = extractIntent(i.content, i.metadata?.subject);
  return { ...i, intentSignals };
}

// Mock interaction data (enriched with intent signals)
const sampleInteractions: Interaction[] = [
  enrichWithIntent({
    id: '1',
    leadId: 'lead1',
    type: 'email',
    content: 'Thank you for the demo! I was really impressed with the features. Our team is excited to move forward.',
    sentiment: 'positive',
    sentimentScore: 0.8,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    source: 'email',
    metadata: { subject: 'Re: Product Demo Follow-up' }
  }),
  enrichWithIntent({
    id: '2',
    leadId: 'lead1',
    type: 'chat',
    content: 'Hi! Can you tell me more about pricing options?',
    sentiment: 'neutral',
    sentimentScore: 0.2,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    source: 'website_chat'
  }),
  enrichWithIntent({
    id: '3',
    leadId: 'lead2',
    type: 'email',
    content: 'I\'m not sure this is the right fit for us. The pricing seems too high for our budget.',
    sentiment: 'negative',
    sentimentScore: -0.6,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    source: 'email',
    metadata: { subject: 'Re: Pricing Inquiry' }
  }),
  enrichWithIntent({
    id: '4',
    leadId: 'lead3',
    type: 'support_ticket',
    content: 'The trial is working great so far. Love the user interface and the reporting features!',
    sentiment: 'positive',
    sentimentScore: 0.7,
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    source: 'support_portal'
  }),
  enrichWithIntent({
    id: '5',
    leadId: 'lead4',
    type: 'email',
    content: 'We need to postpone our decision for another quarter. Budget constraints.',
    sentiment: 'neutral',
    sentimentScore: -0.1,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    source: 'email'
  })
];

// Generate mock leads with calculated engagement scores
function generateMockLeads(): Lead[] {
  const companies = ['TechCorp', 'InnovateInc', 'DataSystems', 'CloudWorks', 'NextGen Solutions', 'Digital Dynamics', 'FutureTech', 'SmartBusiness'];
  const positions = ['CEO', 'CTO', 'VP Sales', 'Marketing Director', 'Product Manager', 'Operations Manager'];
  const sources = ['Website', 'LinkedIn', 'Trade Show', 'Referral', 'Cold Outreach', 'Content Marketing'];
  const stages = ['prospect', 'qualified', 'opportunity', 'customer'] as const;
  const names = [
    'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Thompson', 'Jessica Williams',
    'Robert Kim', 'Amanda Davis', 'Christopher Lee', 'Nicole Brown', 'James Wilson',
    'Maria Garcia', 'Kevin Anderson', 'Lisa Martinez', 'Daniel Taylor', 'Rachel Green',
    'Matthew Jones', 'Ashley Miller', 'Brandon White', 'Stephanie Clark', 'Justin Lewis',
    'Melissa Walker', 'Ryan Hall', 'Jennifer Young', 'Andrew King', 'Laura Wright',
    'Tyler Scott', 'Samantha Adams', 'Jonathan Baker', 'Kimberly Turner', 'Nicholas Phillips',
    'Heather Campbell', 'Alexander Parker', 'Megan Evans', 'Joshua Edwards', 'Brittany Collins',
    'Nathan Stewart', 'Danielle Morris', 'Jacob Rogers', 'Kayla Reed', 'Zachary Cook',
    'Vanessa Bailey', 'Ethan Cooper', 'Tiffany Richardson', 'Lucas Cox', 'Jasmine Ward',
    'Mason Torres', 'Alexis Peterson', 'Caleb Gray', 'Sierra Ramirez', 'Owen James'
  ];

  return Array.from({ length: 50 }, (_, i) => {
    const leadInteractions = sampleInteractions.filter(int => int.leadId === `lead${i + 1}`);
    const currentScore = calculateEngagementScore(leadInteractions.map(int => ({
      content: int.content,
      timestamp: int.timestamp,
      type: int.type
    })));
    const previousScore = currentScore + (Math.random() - 0.5) * 20;

    // Aggregate intent signals from interactions
    const byIntent = new Map<string, { intent: string; strength: 'high' | 'medium' | 'low'; count: number }>();
    for (const int of leadInteractions) {
      for (const s of int.intentSignals ?? []) {
        const key = s.intent;
        if (!byIntent.has(key)) byIntent.set(key, { ...s, count: 0 });
        byIntent.get(key)!.count++;
      }
    }
    const intentSignals = Array.from(byIntent.values()).sort((a, b) => b.count - a.count);
    const hasHigh = intentSignals.some(s => s.strength === 'high');
    const hasLow = intentSignals.some(s => s.strength === 'low');
    let intentSummary = 'No clear intent signals';
    if (hasHigh) intentSummary = 'Strong buying signals (demo, trial, or quote interest)';
    else if (intentSignals.length > 0) intentSummary = `Interest in: ${intentSignals.slice(0, 3).map(s => s.intent.replace(/_/g, ' ')).join(', ')}`;
    if (hasLow) intentSummary += '; some hesitation signals';

    return {
      id: `lead${i + 1}`,
      name: names[i % names.length],
      email: `contact${i + 1}@${companies[i % companies.length].toLowerCase().replace(/\s+/g, '')}.com`,
      company: companies[i % companies.length],
      position: positions[i % positions.length],
      engagementScore: Math.round(currentScore),
      previousScore: Math.round(previousScore),
      trend: getScoreTrend(currentScore, previousScore),
      lastInteraction: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      totalInteractions: Math.floor(Math.random() * 15) + 1,
      stage: stages[Math.floor(Math.random() * stages.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      hubspotId: `hs_${i + 1000}`,
      intentSignals: intentSignals.length > 0 ? intentSignals : undefined,
      intentSummary: intentSignals.length > 0 ? intentSummary : undefined
    };
  });
}

// Generate score history for trends
function generateScoreHistory(_leadId: string): ScoreHistory[] {
  const history: ScoreHistory[] = [];
  const days = 30;
  let currentScore = 50 + (Math.random() - 0.5) * 40;

  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const scoreChange = (Math.random() - 0.5) * 10;
    currentScore = Math.max(0, Math.min(100, currentScore + scoreChange));
    const interactions = Math.floor(Math.random() * 5);

    history.push({
      date,
      score: Math.round(currentScore),
      interactions,
      majorEvents: i % 7 === 0 && Math.random() > 0.7 ? ['Demo completed', 'Pricing discussion'] : undefined
    });
  }

  return history;
}

export const mockLeads = generateMockLeads();

export const mockInteractions = sampleInteractions;

export const mockTeamMetrics: TeamMetrics = {
  totalLeads: mockLeads.length,
  averageEngagementScore: Math.round(mockLeads.reduce((sum, lead) => sum + lead.engagementScore, 0) / mockLeads.length),
  highQualityLeads: mockLeads.filter(lead => lead.engagementScore > 75).length,
  scoreImprovement: 8.3,
  interactionsToday: 23,
  conversionRate: 14.2
};

export { generateScoreHistory };