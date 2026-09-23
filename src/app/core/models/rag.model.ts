export interface RagDocumentChunk {
  id: string;
  title: string;
  sourceType: 'Destination Dossier' | 'Travel Policy' | 'FAQ & Guide';
  content: string;
  tags: string[];
  metadata?: {
    region?: string;
    category?: string;
    dailyCost?: number;
    bestSeason?: string;
    climate?: string;
  };
}

export interface RagRetrievalMatch {
  chunk: RagDocumentChunk;
  relevanceScore: number; 
  matchedTerms: string[];
}

export interface RagResponse {
  query: string;
  answer: string;
  retrievedSources: RagRetrievalMatch[];
  generatedAt: string;
  recommendedDestinations?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  retrievedSources?: RagRetrievalMatch[];
  suggestedPrompts?: string[];
}
