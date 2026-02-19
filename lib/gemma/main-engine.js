import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import GemmaSidecar from './sidecar.js';
import MemoryRetrieval from '../memory/retrieval.js';
import MemoryStorage from '../memory/storage.js';
import { getCoreMemory, getDirectives } from './prompts.js';

class GemmaMainEngine {
  constructor(apiKey) {
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = "gemma-3-27b-it";

    // Initialize Sidecar for hidden reasoning
    this.sidecar = new GemmaSidecar(apiKey);
  }

  /**
   * Generate a response using the main engine with full memory context
   */
  async generate(message, context = {}) {
    const { memberId, userEmail, userName } = context;

    try {
      // 1. Retrieve Context
      let relevantMemories = [];
      let memoryRetrieval = null;
      let memoryStorage = null;

      try {
        if (memberId) {
          memoryRetrieval = new MemoryRetrieval(memberId);
          memoryStorage = new MemoryStorage(memberId);

          // Get relevant memories
          relevantMemories = await memoryRetrieval.retrieveRelevant(message);
        }
      } catch (err) {
        console.error('Memory retrieval failed:', err);
        // Continue without memory context
      }

      // 2. Construct the prompt with identity and context
      const coreIdentity = getCoreMemory();
      const directives = getDirectives();

      const identityContext = `
CURRENT USER IDENTITY:
- Name: ${userName || 'Unknown'}
- Email: ${userEmail || 'Unknown'}
- Member ID: ${memberId}
(Do not ask for this information again. You already have it.)
`;

      const memoryContext = relevantMemories.length > 0
        ? `\nRELEVANT MEMORIES (Use these to personalize response):\n${relevantMemories.map(m => `- ${m.content} (${m.memory_type})`).join('\n')}\n`
        : '';

      const fullPrompt = `
${coreIdentity}
${directives}

${identityContext}

${memoryContext}

USER MESSAGE: "${message}"

Respond as Lux.
`;

      // 3. Generate Response using new SDK
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: fullPrompt,
        config: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        }
      });

      const responseText = response.text;

      // 4. Background: Memory Consolidation (Fire and forget)
      if (memberId && memoryStorage) {
        this.processMemoryInBackground(message, responseText, memberId, memoryStorage);
      }

      return responseText;

    } catch (error) {
      console.error('Main engine error:', error);
      try {
        fs.appendFileSync('engine-error.log', `[${new Date().toISOString()}] ${error.message}\n${error.stack}\n\n`);
      } catch (e) {
        console.error('Failed to log error to file:', e);
      }
      return "I usually have a witty retort, but my circuits are momentarily overloaded. Ask me again in a moment.";
    }
  }

  /**
   * Background process to analyze and save memories
   */
  async processMemoryInBackground(userMessage, aiResponse, memberId, storage) {
    try {
      // 1. Assess if user message contains facts/preferences
      const assessment = await this.sidecar.assessMemory(userMessage);

      if (assessment.shouldRemember) {
        const memoryPayload = {
          type: assessment.memoryType || 'fact',
          content: assessment.extractedInfo?.description || userMessage,
          key: assessment.extractedInfo?.key || `chat-${Date.now()}`,
          value: assessment.extractedInfo?.value || userMessage,
          category: assessment.storageTarget === 'domain' ? 'user_fact' : 'chat_insight',
          confidence: assessment.confidence,
          source: 'implicit_chat',
          context: { originalMessage: userMessage }
        };

        let result;
        if (assessment.storageTarget === 'domain') {
          // Route to her "Job" (Permanent Knowledge)
          result = await storage.saveDomainMemory(memoryPayload);
        } else {
          // Route to her "Life" (Experience/Context)
          result = await storage.saveExperienceMemory(memoryPayload);
        }

        // Save Graph Data (Entities & Relationships)
        if (result.success && result.memoryId) {
          await storage.saveGraphData(
            result.memoryId,
            assessment.entities || [],
            assessment.relationships || []
          );
        }
      }

      // 2. Periodic consolidation could happen here specific to this conversation
      // For now, we rely on the sidecar's immediate assessment.

    } catch (error) {
      console.error('Background memory processing error:', error);
    }
  }

  /**
   * Sifter - exposed for batch jobs
   */
  async sift(streamSnapshot) {
    // ... existing sifter logic if needed, or delegated to Sidecar ...
    // Keeping minimal for now
    return {};
  }
}

export default GemmaMainEngine;