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

    // Store instances for members (Simple in-memory cache for demo/local)
    this.streams = new Map();
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

          // 1.1 Generate Strategic Search Terms (Biblical Alignment)
          const core = getCoreMemory();
          const directives = getDirectives();
          const searchTerms = await this.sidecar.generateSearchTerms(message, core, directives);

          // 1.2 Get relevant memories using high-tier search terms
          relevantMemories = await memoryRetrieval.retrieveRelevant(searchTerms);

          // Get or create stream manager for this member
          if (!this.streams.has(memberId)) {
            const StreamManager = (await import('../memory/stream.js')).default;
            this.streams.set(memberId, new StreamManager(memberId));
          }
          this.streamManager = this.streams.get(memberId);
        }
      } catch (err) {
        console.error('Memory retrieval failed:', err);
        // Continue without memory context
      }

      // 2. Construct the prompt with identity and context (The Bible)
      const coreIdentity = getCoreMemory();
      const directives = getDirectives();

      // Check for Memory Keep (Context Capping) - following the Blueprint policy
      if (this.streamManager && await this.streamManager.shouldConsolidate()) {
        console.log('🔄 Triggering Memory Keep (Context Cap reached)');
        // Sifting/summarization logic would go here
        // For now, we ensure the stream remains small
      }

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

      // Append current message to stream
      if (this.streamManager) {
        this.streamManager.append(message, 'user');
      }

      const streamContext = this.streamManager
        ? `\nCONVERSATION HISTORY (The Stream):\n${this.streamManager.getSnapshot().messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}\n`
        : '';

      const fullPrompt = `
${coreIdentity}
${directives}

${identityContext}

${memoryContext}

${streamContext}

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

      // Append assistant response to stream
      if (this.streamManager) {
        this.streamManager.append(responseText, 'assistant');
      }

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
      // Fetch the "Bible" (Core Identity and Directives)
      const coreIdentity = getCoreMemory();
      const directives = getDirectives();

      // 1. Assess if user message contains facts/preferences - now with biblical alignment
      const assessment = await this.sidecar.assessMemory(userMessage, coreIdentity, directives);

      if (assessment.shouldRemember) {
        const memoryPayload = {
          type: assessment.memoryType || (assessment.storageTarget === 'domain' ? 'fact' : 'insight'),
          content: assessment.extractedInfo?.description || userMessage,
          key: assessment.extractedInfo?.key,
          value: assessment.extractedInfo?.value || userMessage,
          category: assessment.storageTarget === 'domain' ? 'user_fact' : 'chat_insight',
          confidence: assessment.confidence,
          source: 'implicit_chat',
          storageTarget: assessment.storageTarget, // Explicit link
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