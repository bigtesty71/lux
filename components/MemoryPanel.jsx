import { query } from '../db/connection';

class MemoryStorage {
  constructor(memberId) {
    this.memberId = memberId;
  }

  /**
   * Save a memory explicitly (triggered by user or AI)
   */
  async saveMemory(memoryData) {
    const {
      type = 'fact', // fact, preference, pattern, event, insight
      content,
      key,
      value,
      category = 'general',
      confidence = 1.0,
      context = {},
      source = 'explicit' // explicit, implicit, sifter
    } = memoryData;

    // Determine storage target based on type
    const storageTarget = this.determineStorageTarget(type, category);

    try {
      let result;
      
      if (storageTarget === 'experience') {
        result = await this.saveToExperience({
          type,
          content: content || `${key}: ${value}`,
          confidence,
          context: JSON.stringify({ ...context, source }),
          category
        });
      } else {
        result = await this.saveToDomain({
          category,
          key,
          value,
          context: JSON.stringify({ ...context, source })
        });
      }

      // Log memory save event
      console.log(`[Memory Saved] Member ${this.memberId}: ${type} - ${content || key}`);

      return {
        success: true,
        memoryId: result,
        storageTarget,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error saving memory:', error);
      throw error;
    }
  }

  /**
   * Save to experience memory (unstructured, synthesized)
   */
  async saveToExperience({ type, content, confidence, context, category }) {
    const sql = `
      INSERT INTO experience_memory 
        (member_id, memory_type, content, confidence, context, category, created_at, last_recalled)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

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
      INSERT INTO domain_memory 
        (member_id, category, key_field, value, structured_data, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        value = VALUES(value),
        structured_data = VALUES(structured_data),
        updated_at = NOW()
    `;

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
}

export default MemoryStorage;