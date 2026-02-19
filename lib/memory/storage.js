import { query } from '../db/connection.js';

class MemoryStorage {
  constructor(memberId) {
    this.memberId = memberId;
  }

  /**
   * Save a memory explicitly (triggered by user or AI)
   * This acts as a router, but explicit methods are preferred for clarity.
   */
  async saveMemory(memoryData) {
    const {
      type = 'fact',
      content,
      key,
      value,
      category = 'general',
      confidence = 1.0,
      context = {},
      source = 'explicit',
      storageTarget: explicitTarget
    } = memoryData;

    const storageTarget = explicitTarget || this.determineStorageTarget(type, category);

    if (storageTarget === 'experience') {
      return this.saveExperienceMemory(memoryData);
    } else {
      return this.saveDomainMemory(memoryData);
    }
  }

  /**
   * Save to Experience Memory (Her "Life" - interactions, feelings, events)
   */
  async saveExperienceMemory(memoryData) {
    const {
      type = 'insight',
      content,
      key,
      value,
      category = 'experience',
      confidence = 1.0,
      context = {},
      source = 'experience_flow'
    } = memoryData;

    try {
      const result = await this.saveToExperience({
        type,
        content: content || (key ? `${key}: ${value}` : value),
        confidence,
        context: JSON.stringify({ ...context, source }),
        category
      });

      console.log(`[Life Sync] Member ${this.memberId}: ${type} archived in Experience.`);

      return {
        success: true,
        memoryId: result,
        storageTarget: 'experience',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in Experience Sync:', error);
      throw error;
    }
  }

  /**
   * Save to Domain Memory (Her "Job" - knowledge, facts, authorities)
   */
  async saveDomainMemory(memoryData) {
    const {
      category = 'knowledge',
      key,
      value,
      context = {},
      source = 'domain_authority'
    } = memoryData;

    try {
      const result = await this.saveToDomain({
        category,
        key,
        value,
        context: JSON.stringify({ ...context, source })
      });

      console.log(`[Job Sync] Member ${this.memberId}: ${category} stored in Domain Authority.`);

      return {
        success: true,
        memoryId: result,
        storageTarget: 'domain',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in Domain Sync:', error);
      throw error;
    }
  }

  /**
   * Save to experience memory (unstructured, synthesized)
   */
  async saveToExperience({ type, content, confidence, context, category }) {
    const sql = `
      INSERT INTO \`experience_memory\` 
        (\`member_id\`, \`memory_type\`, \`content\`, \`confidence\`, \`context\`, \`category\`, \`created_at\`, \`last_recalled\`)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    console.log(`[Database] Routing to table: experience_memory`);

    const result = await query(sql, [
      this.memberId,
      type,
      content,
      confidence,
      context,
      category
    ]);

    return result.insertId;
  }

  /**
   * Save to domain memory (structured, permanent)
   */
  async saveToDomain({ category, key, value, context }) {
    const sql = `
      INSERT INTO \`domain_memory\` 
        (\`member_id\`, \`category\`, \`key_field\`, \`value\`, \`structured_data\`, \`updated_at\`)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        \`id\` = LAST_INSERT_ID(\`id\`),
        \`value\` = VALUES(\`value\`),
        \`structured_data\` = VALUES(\`structured_data\`),
        \`updated_at\` = NOW()
    `;

    console.log(`[Database] Routing to table: domain_memory | Key: ${key}`);

    const result = await query(sql, [
      this.memberId,
      category,
      key,
      value,
      context
    ]);

    return result.insertId;
  }

  /**
   * Save multiple memories at once (batch operation)
   */
  async saveMemoriesBatch(memories) {
    const results = [];

    for (const memory of memories) {
      try {
        const result = await this.saveMemory(memory);
        results.push(result);
      } catch (error) {
        console.error('Error in batch memory save:', error);
        // Continue with other memories
      }
    }

    return {
      success: true,
      saved: results.length,
      memories: results
    };
  }

  /**
   * Determine where to store based on memory type
   */
  determineStorageTarget(type, category) {
    // Domain memory is for permanent, structured data
    const domainTypes = ['profile', 'preference', 'fact'];
    const domainCategories = ['user', 'settings', 'preferences', 'profile'];

    if (domainTypes.includes(type) || domainCategories.includes(category)) {
      return 'domain';
    }
    return 'experience';
  }

  /**
   * Update existing memory
   */
  async updateMemory(memoryId, updates, storageTarget = 'experience') {
    const table = storageTarget === 'domain' ? 'domain_memory' : 'experience_memory';

    const setClauses = [];
    const values = [];

    if (updates.content !== undefined) {
      setClauses.push('content = ?');
      values.push(updates.content);
    }
    if (updates.confidence !== undefined) {
      setClauses.push('confidence = ?');
      values.push(updates.confidence);
    }
    if (updates.context !== undefined) {
      setClauses.push('context = ?');
      values.push(JSON.stringify(updates.context));
    }
    if (updates.key_field !== undefined && storageTarget === 'domain') {
      setClauses.push('key_field = ?');
      values.push(updates.key_field);
    }
    if (updates.value !== undefined && storageTarget === 'domain') {
      setClauses.push('value = ?');
      values.push(updates.value);
    }

    setClauses.push('last_recalled = NOW()');

    const sql = `UPDATE ${table} SET ${setClauses.join(', ')} WHERE id = ? AND member_id = ?`;
    values.push(memoryId, this.memberId);

    await query(sql, values);

    return { success: true, updated: memoryId };
  }

  /**
   * Delete/forget memory
   */
  async deleteMemory(memoryId, storageTarget = 'experience') {
    const table = storageTarget === 'domain' ? 'domain_memory' : 'experience_memory';

    const sql = `DELETE FROM ${table} WHERE id = ? AND member_id = ?`;
    await query(sql, [memoryId, this.memberId]);

    return { success: true, deleted: memoryId };
  }

  /**
   * Tag or categorize memory
   */
  async tagMemory(memoryId, tags, storageTarget = 'experience') {
    const table = storageTarget === 'domain' ? 'domain_memory' : 'experience_memory';

    // Get current context
    const getSql = `SELECT context FROM ${table} WHERE id = ? AND member_id = ?`;
    const results = await query(getSql, [memoryId, this.memberId]);

    if (results.length === 0) {
      throw new Error('Memory not found');
    }

    let context = results[0].context ? JSON.parse(results[0].context) : {};
    context.tags = [...(context.tags || []), ...tags];
    context.tags = [...new Set(context.tags)]; // Remove duplicates

    const updateSql = `UPDATE ${table} SET context = ? WHERE id = ? AND member_id = ?`;
    await query(updateSql, [JSON.stringify(context), memoryId, this.memberId]);

    return { success: true, tags: context.tags };
  }

  /**
   * Graphic RAG: Save entities and relationships connected to a memory
   */
  async saveGraphData(triggerMemoryId, entities = [], relationships = [], triggerSourceType = 'experience') {
    const entityMap = new Map(); // Name -> ID

    // Helper to get/create entity node
    const getEntityId = async (name, type) => {
      if (entityMap.has(name)) return entityMap.get(name);

      let domainMemoryId = await this.saveToDomain({
        category: 'entity',
        key: name,
        value: type,
        context: JSON.stringify({ isNode: true })
      });

      // Handle ON DUPLICATE returning 0
      if (!domainMemoryId) {
        const rows = await query(
          'SELECT id FROM domain_memory WHERE member_id = ? AND category = ? AND key_field = ?',
          [this.memberId, 'entity', name]
        );
        if (rows.length > 0) domainMemoryId = rows[0].id;
      }

      if (domainMemoryId) entityMap.set(name, domainMemoryId);
      return domainMemoryId;
    };

    try {
      // 1. Process Entities -> Nodes (Ensure they exist)
      for (const entity of entities) {
        if (entity && entity.name) {
          await getEntityId(entity.name, entity.type || 'Concept');
        }
      }

      // 2. Link Trigger Memory to Entities (Mentions)
      for (const entity of entities) {
        if (!entity || !entity.name) continue;
        const entityId = entityMap.get(entity.name);
        if (entityId) {
          await query(`
            INSERT INTO memory_relationships (source_id, source_type, target_id, target_type, relationship_type)
            VALUES (?, ?, ?, 'domain', 'MENTIONS')
            `, [triggerMemoryId, triggerSourceType, entityId]);
        }
      }

      // 3. Process Explicit Relationships (Entity -> Entity)
      for (const rel of relationships) {
        if (!rel.source || !rel.target) continue;
        const sourceId = await getEntityId(rel.source, 'Unknown');
        const targetId = await getEntityId(rel.target, 'Unknown');

        if (sourceId && targetId) {
          await query(`
            INSERT INTO memory_relationships (source_id, source_type, target_id, target_type, relationship_type)
            VALUES (?, 'domain', ?, 'domain', ?)
            `, [sourceId, targetId, (rel.relation || 'RELATED').toUpperCase()]);
        }
      }

      console.log(`[Graph] Processed ${entities.length} entities and ${relationships.length} relationships.`);

    } catch (error) {
      console.error('Error saving graph data:', error);
    }
  }

  /**
   * Retrieve a specific domain memory by key (e.g., for finding a blog post)
   */
  async getDomainMemoryByKey(category, key) {
    try {
      const rows = await query(
        'SELECT * FROM domain_memory WHERE member_id = ? AND category = ? AND key_field = ? LIMIT 1',
        [this.memberId, category, key]
      );
      return rows.length > 0 ? rows[0] : null;

    } catch (error) {
      console.error('Error in getDomainMemoryByKey:', error);
      return null;
    }
  }
}

export default MemoryStorage;