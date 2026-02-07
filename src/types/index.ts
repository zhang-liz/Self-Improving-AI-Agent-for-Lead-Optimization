export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  engagementScore: number;
  previousScore?: number;
  trend: 'up' | 'down' | 'stable';
  lastInteraction: Date;
  totalInteractions: number;
  stage: 'prospect' | 'qualified' | 'opportunity' | 'customer';
  source: string;
  avatar?: string;
  hubspotId?: string;
}

export interface Interaction {
  id: string;
  leadId: string;
  type: 'email' | 'chat' | 'support_ticket' | 'call';
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  timestamp: Date;
  source: string;
  metadata?: {
    subject?: string;
    duration?: number;
    channel?: string;
  };
}

export interface LeadScore {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  breakdown: {
    positivity: number;
    engagement: number;
    responsiveness: number;
    interest: number;
  };
}

export interface ScoreHistory {
  date: Date;
  score: number;
  interactions: number;
  majorEvents?: string[];
}

export interface TeamMetrics {
  totalLeads: number;
  averageEngagementScore: number;
  highQualityLeads: number;
  scoreImprovement: number;
  interactionsToday: number;
  conversionRate: number;
}

export interface FilterOptions {
  search: string;
  scoreRange: [number, number];
  stages: string[];
  sources: string[];
  dateRange: [Date, Date] | null;
  trend: string[];
}

export interface RecommendationSuggestion {
  leadId: string;
  action: string;
  reason: string;
}

export interface Recommendations {
  prioritizedLeadIds: string[];
  suggestions: RecommendationSuggestion[];
  summary?: string;
}