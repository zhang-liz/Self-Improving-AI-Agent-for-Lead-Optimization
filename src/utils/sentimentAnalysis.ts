// Simplified sentiment analysis engine
// In production, this would connect to OpenAI, Google Cloud Natural Language, or custom ML model

const POSITIVE_KEYWORDS = [
  'excellent', 'great', 'awesome', 'fantastic', 'love', 'amazing', 'perfect',
  'wonderful', 'outstanding', 'impressed', 'excited', 'interested', 'yes',
  'definitely', 'absolutely', 'looking forward', 'thank you', 'appreciate'
];

const NEGATIVE_KEYWORDS = [
  'terrible', 'awful', 'hate', 'horrible', 'disappointed', 'frustrated',
  'angry', 'upset', 'no', 'never', 'not interested', 'waste of time',
  'expensive', 'overpriced', 'complicated', 'difficult', 'problem', 'issue'
];

const NEUTRAL_KEYWORDS = [
  'okay', 'fine', 'maybe', 'perhaps', 'consider', 'think about',
  'let me check', 'not sure', 'unclear', 'question', 'information'
];

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
  keywords: string[];
}

export function analyzeSentiment(text: string): SentimentResult {
  const words = text.toLowerCase().split(/\s+/);
  
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;
  const foundKeywords: string[] = [];

  // Count sentiment keywords
  words.forEach(word => {
    if (POSITIVE_KEYWORDS.some(keyword => word.includes(keyword))) {
      positiveCount++;
      foundKeywords.push(word);
    } else if (NEGATIVE_KEYWORDS.some(keyword => word.includes(keyword))) {
      negativeCount++;
      foundKeywords.push(word);
    } else if (NEUTRAL_KEYWORDS.some(keyword => word.includes(keyword))) {
      neutralCount++;
      foundKeywords.push(word);
    }
  });

  // Calculate sentiment score
  const totalSentimentWords = positiveCount + negativeCount + neutralCount;
  let score = 0;
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  let confidence = 0;

  if (totalSentimentWords > 0) {
    score = (positiveCount - negativeCount) / totalSentimentWords;
    confidence = Math.min(totalSentimentWords / words.length * 4, 1);
    
    if (score > 0.1) sentiment = 'positive';
    else if (score < -0.1) sentiment = 'negative';
    else sentiment = 'neutral';
  } else {
    // Fallback to simple heuristics
    if (text.includes('!') && !text.includes('?')) {
      score = 0.3;
      sentiment = 'positive';
      confidence = 0.3;
    } else if (text.includes('?') && text.length < 50) {
      score = 0.1;
      sentiment = 'neutral';
      confidence = 0.4;
    }
  }

  return {
    sentiment,
    score,
    confidence,
    keywords: foundKeywords
  };
}

export function calculateEngagementScore(interactions: Array<{ content: string; timestamp: Date; type: string }>): number {
  if (interactions.length === 0) return 50;

  let totalScore = 0;
  let weightedSum = 0;

  interactions.forEach((interaction, index) => {
    const sentiment = analyzeSentiment(interaction.content);
    const recencyWeight = Math.exp(-(interactions.length - index - 1) * 0.1); // More recent = higher weight
    const typeWeight = interaction.type === 'email' ? 1.2 : interaction.type === 'chat' ? 1.0 : 0.8;
    
    const normalizedScore = (sentiment.score + 1) * 50; // Convert -1,1 to 0,100
    const weight = recencyWeight * typeWeight * sentiment.confidence;
    
    totalScore += normalizedScore * weight;
    weightedSum += weight;
  });

  const averageScore = weightedSum > 0 ? totalScore / weightedSum : 50;
  
  // Add engagement bonus based on interaction frequency
  const engagementBonus = Math.min(interactions.length * 2, 20);
  
  return Math.max(0, Math.min(100, averageScore + engagementBonus));
}

export function getScoreTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
  const difference = current - previous;
  if (Math.abs(difference) < 3) return 'stable';
  return difference > 0 ? 'up' : 'down';
}