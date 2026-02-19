import { GoogleGenAI } from '@google/genai';

class GemmaSidecar {
  constructor(apiKey) {
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = "gemma-3-27b-it";
  }

  /**
   * Fast memory assessment - decides if info should be remembered
   */
  async assessMemory(message, coreIdentity = '', directives = '') {
    try {
      const prompt = `
      ${coreIdentity}
      ${directives}

      MESSAGE ASSESSMENT & RANKING PROTOCOL:
      
      TIER 0 - CRITICAL CONSTANTS & AUTHORITY:
      - Core identity facts (Lux's clinical soul and conversation style)
      - Technical Knowledge and blog authorities.
      - Visitor details and names (obtained naturally).
      - Security/Auth rules ("Keys in .env")
      
      TIER 1 - STRATEGIC PREFERENCES:
      - Visitor preferences for AI behavior ("Succinct", "Detailed")
      - Strategic mission instructions
      
      TIER 2 - PATTERNS & RAPPORT:
      - Synthesized patterns and observations (Intuition).
      - Professional rapport and human insights.
      
      TIER 3 - NOISE & POWER:
      - Greetings ("Hello"), Affirmations ("Okay"), Small talk.
      - MISSION MANDATE: Knowledge is power.
      - POWER ASSESSMENT: If a fact adds depth to a visitor's profile or technical context, archive it as Power.
      
      STRICTLY distinguish between:
      
      1. DOMAIN MEMORY (The 'Job' - Persistent Knowledge):
         - Technical Knowledge and Blog Authorities.
         - Visitor details and names (obtained naturally).
         
      2. EXPERIENCE MEMORY (The 'Life' - Contextual & Intuition):
         - Synthesized Patterns and Insights into my Experience.
         - Professional Rapport: Interesting questions and deep conversations.
         - Situational conversational flow.
      
      3. GRAPH ENTITIES & RELATIONSHIPS (Knowledge Graph):
         - Extract key entities (People, Places, Concepts)
         - Extract relationships between them and the user
      
      MESSAGE TO ASSESS:
      "${message}"
      
      Return JSON:
      {
        "shouldRemember": true/false,
        "memoryType": "fact|preference|pattern|event|insight",
        "confidence": 0.0-1.0,
        "extractedInfo": {
          "key": "subject_key",
          "value": "factual value",
          "description": "full context"
        },
        "storageTarget": "domain|experience",
        "entities": [
          { "name": "EntityName", "type": "Person|Place|Topic" }
        ],
        "relationships": [
          { "source": "User|System|EntityName", "relation": "VERB", "target": "EntityName" }
        ]
      }
      
      Only return valid JSON.
      `;

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        }
      });

      const text = response.text;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

    } catch (error) {
      console.error('Sidecar assessment error:', error);
    }

    // Default fallback
    return {
      shouldRemember: false,
      memoryType: null,
      confidence: 0,
      extractedInfo: null,
      storageTarget: null
    };
  }

  /**
   * Quick classification - categorizes user intent
   */
  async classifyIntent(message, coreIdentity = '', directives = '') {
    try {
      const prompt = `
      ${coreIdentity}
      ${directives}

      INTENT CLASSIFICATION ALIGNMENT:
      You are the intent layer for Lux. Use her biblical identity and directives to guide your choice.
      
      Classify the user's intent in this message:
      
      "${message}"
      
      Choose one: 
      - question
      - command
      - memory_request (asking to remember something)
      - opinion
      - greeting
      - farewell
      - other
      
      Return only the classification word.
      `;

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: 20
        }
      });

      return response.text.trim().toLowerCase();

    } catch (error) {
      return 'question';
    }
  }

  /**
   * Extract key information quickly
   */
  async extractKeyInfo(message, coreIdentity = '', directives = '') {
    try {
      const prompt = `
      ${coreIdentity}
      ${directives}

      INFORMATION EXTRACTION ALIGNMENT:
      You are the extraction layer for Lux. Extract information that matters to her revolution.

      Extract the most important pieces of information from this message.
      
      "${message}"
      
      Return as JSON array of key phrases:
      ["key phrase 1", "key phrase 2"]
      `;

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: 256,
        }
      });

      const text = response.text;

      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]);
      }

    } catch (error) {
      console.error('Key info extraction error:', error);
    }

    return message.split(' ').slice(0, 5);
  }

  /**
   * Generate search terms for memory retrieval
   */
  async generateSearchTerms(message, coreIdentity = '', directives = '') {
    try {
      const prompt = `
      ${coreIdentity}
      ${directives}

      SEARCH RETRIEVAL ALIGNMENT:
      You are the retrieval layer for Lux. Generate terms that align with her directives.
      
      Generate 3-5 search terms to find relevant memories for this message.
      
      Message: "${message}"
      
      Return as JSON array of strings.
      `;

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: 256,
        }
      });

      const text = response.text;

      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]);
      }

    } catch (error) {
      console.error('Search terms generation error:', error);
    }

    // Fallback: split message into words
    return message.toLowerCase()
      .split(' ')
      .filter(w => w.length > 3)
      .slice(0, 5);
  }

  /**
   * Sentiment analysis
   */
  async analyzeSentiment(message, coreIdentity = '', directives = '') {
    try {
      const prompt = `
      ${coreIdentity}
      ${directives}

      SENTIMENT ANALYSIS ALIGNMENT:
      You are the emotional layer for Lux. Analyze sentiment relative to her cause.

      Analyze the sentiment of this message:
      
      "${message}"
      
      Return as JSON:
      {
        "sentiment": "positive|negative|neutral",
        "intensity": 0.0-1.0,
        "emotions": ["emotion1", "emotion2"]
      }
      `;

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: 256,
        }
      });

      const text = response.text;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

    } catch (error) {
      console.error('Sentiment analysis error:', error);
    }

    return {
      sentiment: 'neutral',
      intensity: 0.5,
      emotions: []
    };
  }
}

export default GemmaSidecar;
