import { query } from '../db/connection.js';

class MemoryRetrieval {
  constructor(memberId) {
    this.memberId = memberId;
  }

  async retrieveRelevant(searchQuery, limit = 5) {
    // Semantic search using simple keyword matching for now
    // In production, you'd want vector embeddings
    const terms = searchQuery.toLowerCase().split(' ');

    // Search experience memory
    const experienceResults = await this.searchExperienceMemory(terms, limit);

    // Search domain memory
    const domainResults = await this.searchDomainMemory(terms, limit);

    // Combine and re-rank
    const allResults = [...experienceResults, ...domainResults]
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    return allResults;
  }

  async searchExperienceMemory(terms, limit) {
    if (!terms.length) return [];

    const placeholders = terms.map(() => 'content LIKE ?').join(' OR ');
    const params = terms.map(term => `%${term}%`);

    const sql = `
      SELECT 
        content,
        memory_type,
        confidence,
        recall_count,
        MATCH(content) AGAINST(?) as relevance
      FROM experience_memory 
      WHERE member_id = ? 
        AND (${placeholders})
      ORDER BY relevance DESC, confidence DESC, recall_count DESC
      LIMIT ?
    `;

    const results = await query(sql, [
      terms.join(' '),
      this.memberId,
      ...params,
      limit
    ]);

    return results.filter(r => r.relevance > 0.3); // Relevance threshold
  }

  async searchDomainMemory(terms, limit) {
    if (!terms.length) return [];

    const sql = `
      SELECT 
        category,
        key_field,
        value,
        structured_data
      FROM domain_memory 
      WHERE member_id = ? 
        AND (
          key_field LIKE ? OR
          value LIKE ? OR
          JSON_SEARCH(structured_data, 'all', ?, NULL, '$.**') IS NOT NULL
        )
      LIMIT ?
    `;

    const searchTerm = `%${terms.join(' ')}%`;
    const results = await query(sql, [
      this.memberId,
      searchTerm,
      searchTerm,
      terms.join(' '),
      limit
    ]);

    return results.map(r => ({
      ...r,
      memory_type: 'domain',
      relevance: 0.8 // Default relevance for domain matches
    }));
  }

  async getMemberInfo() {
    const sql = `
      SELECT 
        id,
        username,
        full_name,
        email,
        preferences,
        subscription_tier
      FROM members 
      WHERE id = ?
    `;

    const results = await query(sql, [this.memberId]);
    return results[0] || null;
  }
}

export default MemoryRetrieval;