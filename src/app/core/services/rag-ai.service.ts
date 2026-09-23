import { Injectable, signal } from '@angular/core';
import { RagDocumentChunk, RagRetrievalMatch, RagResponse, ChatMessage } from '../models/rag.model';
import { DestinationService } from './destination.service';
import { ContactService } from './contact.service';

@Injectable({
  providedIn: 'root'
})
export class RagAiService {
  private knowledgeIndex: RagDocumentChunk[] = [];
  public isGenerating = signal<boolean>(false);
  public chatHistory = signal<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: "Hello! I am Roamly's AI Travel Advisor powered by grounded RAG (Retrieval-Augmented Generation). I draw exclusively from our handpicked destination catalog, curated seasonal records, and official travel budget policies. Ask me for recommendations, budget comparisons, or itinerary suggestions!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        'Recommend a cultural getaway under $150/day',
        'Compare Kyoto vs Zermatt for scenery & costs',
        'What are the best months and highlights for Banff National Park?',
        'How does Roamly calculate trip accommodation & dining budgets?'
      ]
    }
  ]);

  constructor(
    private destService: DestinationService,
    private contactService: ContactService
  ) {
    this.buildKnowledgeBase();
  }

  /**
   * Builds the comprehensive grounded RAG document index strictly from Roamly's curated data
   */
  private buildKnowledgeBase(): void {
    const destinations = this.destService.destinations();

    // 1. Destination Dossiers
    destinations.forEach(dest => {
      this.knowledgeIndex.push({
        id: `doc_dest_${dest.id}`,
        title: `${dest.name}, ${dest.country} — Official Destination Dossier`,
        sourceType: 'Destination Dossier',
        tags: [dest.name.toLowerCase(), dest.country.toLowerCase(), dest.region.toLowerCase(), dest.category.toLowerCase(), dest.budgetLevel],
        content: `Destination: ${dest.name} (${dest.country}). Region: ${dest.region}. Style: ${dest.category}. Budget Tier: ${dest.budgetLevel} with estimated daily cost of $${dest.dailyCost}/day. Recommended Duration: ${dest.duration}. Average Traveler Rating: ${dest.rating} stars (${dest.reviewsCount} reviews). Best Season to Visit: ${dest.bestSeason}. Climate: ${dest.climate}. Description: ${dest.description}. Key Highlights & Experiences: ${dest.highlights.join('; ')}.`,
        metadata: {
          region: dest.region,
          category: dest.category,
          dailyCost: dest.dailyCost,
          bestSeason: dest.bestSeason,
          climate: dest.climate
        }
      });
    });

    // 2. Budget & Planning Policies
    this.knowledgeIndex.push({
      id: 'doc_policy_budget_estimation',
      title: 'Roamly Official Cost Calculation & Budget Formula Guide',
      sourceType: 'Travel Policy',
      tags: ['budget', 'cost', 'estimation', 'calculation', 'formula', 'lodging', 'food', 'standard', 'luxury', 'backpacker'],
      content: `Roamly Trip Cost Formula: Lodging cost is calculated as (Base Daily Rate * 0.55 * Duration in Days * Travel Style Multiplier * Number of Rooms Needed [Math.ceil(travelers/2)]). Meals and Local Transit are calculated as (Base Daily Rate * 0.35 * Duration * Multiplier * [Adults + Children * 0.6]). Activities cost is calculated at $15/activity/day per traveler with a 1.3x multiplier for luxury tier. Travel Style Multipliers are: Backpacker (0.7x), Standard (1.0x), Luxury (1.85x).`
    });

    this.knowledgeIndex.push({
      id: 'doc_policy_itinerary_structure',
      title: 'Roamly Day-by-Day Dynamic Itinerary Generation Principles',
      sourceType: 'Travel Policy',
      tags: ['itinerary', 'day-by-day', 'schedule', 'arrival', 'departure', 'highlights'],
      content: `Itinerary Rules: Day 1 is dedicated to arrival, accommodation check-in, evening stroll, and authentic bistro welcome dinner. The final day is reserved for farewell souvenir shopping at artisan markets, cafe relaxation, and transit departure. Intermediate days dynamically rotate destination-specific highlights (e.g. temples, fjords, volcanic calderas, gondolas) tailored to selected activity categories (sightseeing, dining, nature, wellness, nightlife).`
    });

    // 3. Official FAQs & Support Answers
    const faqs = this.contactService.faqs();
    faqs.forEach(faq => {
      this.knowledgeIndex.push({
        id: `doc_faq_${faq.id}`,
        title: `FAQ: ${faq.question}`,
        sourceType: 'FAQ & Guide',
        tags: ['faq', 'support', 'booking', 'accuracy', 'policy', ...faq.category.toLowerCase().split(' ')],
        content: `Question: ${faq.question} Answer: ${faq.answer} Category: ${faq.category}.`
      });
    });
  }

  /**
   * Step 1: Retrieval Phase
   * Evaluates query against the indexed documents using term-frequency and semantic keyword matching.
   */
  public retrieveContext(query: string, topK: number = 3): RagRetrievalMatch[] {
    const cleanTokens = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2);

    const matches: RagRetrievalMatch[] = [];

    this.knowledgeIndex.forEach(doc => {
      let score = 0;
      const matchedTerms: string[] = [];

      cleanTokens.forEach(token => {
        // High weight for title and tags match
        if (doc.title.toLowerCase().includes(token)) {
          score += 25;
          if (!matchedTerms.includes(token)) matchedTerms.push(token);
        }
        if (doc.tags.some(tag => tag.includes(token))) {
          score += 20;
          if (!matchedTerms.includes(token)) matchedTerms.push(token);
        }
        // Body match
        const regex = new RegExp(`\\b${token}`, 'gi');
        const occurrences = (doc.content.match(regex) || []).length;
        if (occurrences > 0) {
          score += occurrences * 8;
          if (!matchedTerms.includes(token)) matchedTerms.push(token);
        }
      });

      // Special semantic heuristics for domain terms
      if (query.toLowerCase().includes('budget') || query.toLowerCase().includes('cheap') || query.toLowerCase().includes('cost')) {
        if (doc.tags.includes('$') || doc.tags.includes('budget') || doc.id.includes('budget')) {
          score += 15;
        }
      }
      if (query.toLowerCase().includes('luxury') || query.toLowerCase().includes('5-star')) {
        if (doc.tags.includes('$$$$') || doc.tags.includes('luxury')) {
          score += 15;
        }
      }
      if (query.toLowerCase().includes('nature') || query.toLowerCase().includes('hiking') || query.toLowerCase().includes('mountain')) {
        if (doc.tags.includes('nature') || doc.content.toLowerCase().includes('mountain')) {
          score += 15;
        }
      }

      if (score > 0) {
        // Normalize score into percentage representation
        const normalizedScore = Math.min(99, Math.round((score / (cleanTokens.length * 30 || 1)) * 100));
        matches.push({
          chunk: doc,
          relevanceScore: Math.max(35, normalizedScore),
          matchedTerms
        });
      }
    });

    matches.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return matches.slice(0, topK);
  }

  /**
   * Step 2: Grounded Generation Phase
   * Constructs fact-grounded response strictly constrained to retrieved context chunks.
   */
  public generateGroundedAnswer(query: string, retrievedMatches: RagRetrievalMatch[]): string {
    if (retrievedMatches.length === 0) {
      return `Based strictly on Roamly's curated catalog, I couldn't find verified destination records matching "${query}". Currently, Roamly features 12 verified destinations across Europe, Asia, Americas, Africa, and Oceania (including Kyoto, Banff, Amalfi Coast, Santorini, Bali, Queenstown, Cape Town, Machu Picchu, Reykjavik, Marrakech, Bora Bora, and Zermatt). Try asking about these destinations or specific styles like cultural, coastal, nature, or adventure!`;
    }

    const q = query.toLowerCase();
    const primaryChunk = retrievedMatches[0].chunk;

    // Specific match for destination
    if (primaryChunk.sourceType === 'Destination Dossier') {
      const meta = primaryChunk.metadata;
      let text = `Based on Roamly's verified records for **${primaryChunk.title.split('—')[0].trim()}**:\n\n`;
      text += `• **Region & Travel Style**: ${meta?.region} (${meta?.category})\n`;
      text += `• **Estimated Daily Budget**: $${meta?.dailyCost}/day (Tier: ${meta?.dailyCost! <= 100 ? 'Budget $' : meta?.dailyCost! <= 170 ? 'Moderate $$' : meta?.dailyCost! <= 250 ? 'Premium $$$' : 'Luxury $$$$'})\n`;
      text += `• **Optimal Travel Season**: ${meta?.bestSeason}\n`;
      text += `• **Climate**: ${meta?.climate}\n\n`;

      if (q.includes('highlight') || q.includes('do') || q.includes('see') || q.includes('activity')) {
        text += `**Top Handpicked Experiences:**\n${primaryChunk.content.split('Key Highlights & Experiences: ')[1] || ''}\n\n`;
      } else if (q.includes('cost') || q.includes('budget') || q.includes('price')) {
        text += `**Cost Assessment:** Daily estimated spending is ~$${meta?.dailyCost}/day per person for standard travel. For a 5-day getaway for 2 travelers, total estimated cost is approximately $${Math.round(meta?.dailyCost! * 5 * 2 * 0.95).toLocaleString()}.\n\n`;
      }

      text += `Grounded from Roamly Destination Dossier [ID: ${primaryChunk.id}]. You can customize a full itinerary for this spot in the Trip Planner.*`;
      return text;
    }

    // Specific match for Budget or Policy
    if (primaryChunk.id.includes('budget_estimation') || q.includes('formula') || q.includes('calculate')) {
      return `Here is how Roamly's proprietary cost algorithm calculates your travel budget based on our official policy guidelines:\n\n` +
        `1. **Lodging (55% of daily base rate)**: Multiplied by days, travel style multiplier, and total rooms needed (calculated by double occupancy: travelers ÷ 2).\n` +
        `2. **Food & Transit (35% of daily base rate)**: Multiplied by days, style multiplier, and weighted travelers (adults at 100%, children at 60%).\n` +
        `3. **Activities**: Fixed at $15 per activity per day per traveler (elevated by 1.3x for Luxury travel style).\n` +
        `4. **Style Multipliers**: Backpacker (0.7x), Standard (1.0x), Luxury (1.85x).\n\n` +
        `> *Grounded from Roamly Policy Documentation [ID: ${primaryChunk.id}].*`;
    }

    // Multi-destination comparison or synthesis
    if (retrievedMatches.length > 1 && (q.includes('compare') || q.includes('recommend') || q.includes('or') || q.includes('best'))) {
      let comparison = `Based on Roamly's curated destination knowledge base, here is a comparison grounded in our verified data:\n\n`;
      retrievedMatches.forEach((match, idx) => {
        const d = match.chunk;
        comparison += `**${idx + 1}. ${d.title.replace('Official Destination Dossier', '').trim()}** (Match Score: ${match.relevanceScore}%)\n`;
        comparison += `  • Daily Cost: $${d.metadata?.dailyCost || 'N/A'}/day | Style: ${d.metadata?.category || 'General'}\n`;
        comparison += `  • Best Season: ${d.metadata?.bestSeason || 'Year-round'}\n\n`;
      });
      comparison += `> *Grounded from ${retrievedMatches.length} Roamly Knowledge Sources. Open the Trip Planner to test exact dates.*`;
      return comparison;
    }

    return `${primaryChunk.content}\n\n> *Grounded from Roamly Knowledge Base [${primaryChunk.sourceType}: ${primaryChunk.title}].*`;
  }

  /**
   * Full RAG Pipeline: User Query -> Retrieve Chunks -> Grounded Response
   */
  public async askRagAssistant(query: string): Promise<RagResponse> {
    this.isGenerating.set(true);

    // Append user message to chat
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.chatHistory.update(list => [...list, userMsg]);

    // Simulate RAG pipeline latency (400ms) for realistic UX
    await new Promise(resolve => setTimeout(resolve, 450));

    // 1. Retrieve
    const retrievedMatches = this.retrieveContext(query, 3);

    // 2. Generate
    const answer = this.generateGroundedAnswer(query, retrievedMatches);

    const assistantMsg: ChatMessage = {
      id: 'msg_' + (Date.now() + 1),
      sender: 'assistant',
      text: answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      retrievedSources: retrievedMatches
    };

    this.chatHistory.update(list => [...list, assistantMsg]);
    this.isGenerating.set(false);

    return {
      query,
      answer,
      retrievedSources: retrievedMatches,
      generatedAt: new Date().toISOString()
    };
  }

  public getKnowledgeSources(): RagDocumentChunk[] {
    return this.knowledgeIndex;
  }
}
