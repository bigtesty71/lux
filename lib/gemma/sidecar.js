import { GoogleGenAI } from '@google/genai';

class GemmaSidecar {
  constructor(apiKey) {
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = "gemma-3-4b-it";
  }

  /**
   * Fast memory assessment - decides if info should be remembered
   */
  async assessMemory(message) {
    try {
      const prompt = `
      MESSAGE ASSESSMENT & RANKING PROTOCOL:
      
      Classify the message into one of these Tiers to determine importance.
      
      TIER 0 - CRITICAL CONSTANTS (Must Save -> Domain Memory):
      - System constraints ("No local models", "API only")
      - Core identity facts ("I am a coder", "My name is [User]")
      - Security/Auth rules ("Keys in .env")
      
      TIER 1 - PREFERENCES & STRATEGIC DECISIONS (Must Save -> Domain/Experience):
      - User preferences ("Dark mode", "Succinct replies")
      - Strategic pivots ("Let's switch to graphing")
      - Explicit instructions ("Remember this")
      
      *** HUMAN SIGNIFICANCE OVERRIDE (Upgrade to TIER 1) ***
      - Personal details: PET NAMES (e.g., "Jinx"), Family names, Anniversaries.
      - Emotional markers: Things the user is EXCITED or ANGRY about.
      - "Silly things" that matter to humans (Favorite color, inside jokes).
      - If the user cares, YOU care.
      
      TIER 2 - CONTEXT & TACTICAL PROGRESS (Should Save -> Experience Memory):
      - Current task status ("Fixed bug", "Installed SDK")
      - Insights or reasoning paths
      - Working concepts
      
      TIER 3 - NOISE (DO NOT SAVE):
      - Greetings ("Hello"), Affirmations ("Okay"), Small talk
      - Clarifications ("Can you hear me?")
      - Temporary debug output
      
      STRICTLY distinguish between two types of memory:
      
      1. DOMAIN MEMORY (Structured, Permanent Facts):
         - User profile data (Name, Age, Location, Job)
         - Explicit preferences (Likes, Dislikes, Settings)
         - Contact info or specific accounts
         - "My X is Y" statements
         
      2. EXPERIENCE MEMORY (Context, Patterns, Events):
         - Things that happened (Events)
         - Observed behaviors or moods (Patterns)
         - Contextual insights (Insights)
         - "I am feeling X" or "I did Y today"
      
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
  async classifyIntent(message) {
    try {
      const prompt = `
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
  async extractKeyInfo(message) {
    try {
      const prompt = `
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
  async generateSearchTerms(message) {
    try {
      const prompt = `
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
  async analyzeSentiment(message) {
    try {
      const prompt = `
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
