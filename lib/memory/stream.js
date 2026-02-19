class StreamManager {
  constructor(memberId, appContextCap = 64000) {
    this.memberId = memberId;
    this.appContextCap = appContextCap;
    this.stream = [];
    this.tokenCount = 0;
    this.summary = null;
    this.rollingOverlap = 3; // Keep last 3 messages
  }

  append(message, role = 'user') {
    this.stream.push({
      role,
      content: message,
      timestamp: new Date().toISOString()
    });

    // Rough token estimation (4 chars ≈ 1 token)
    this.tokenCount += Math.ceil(message.length / 4);
  }

  async shouldConsolidate() {
    return this.tokenCount > (this.appContextCap * 0.85);
  }

  getSnapshot() {
    return {
      messages: [...this.stream],
      summary: this.summary,
      tokenCount: this.tokenCount
    };
  }

  consolidate(summary, patterns) {
    this.summary = summary;

    // Keep rolling overlap of most recent messages
    const overlap = this.stream.slice(-this.rollingOverlap);

    // Clear stream
    this.stream = [];
    this.tokenCount = 0;

    // Add summary as first entry
    this.append(`[Session Summary: ${summary}]`, 'system');

    // Add patterns if significant
    if (patterns && patterns.length > 0) {
      this.append(`[Patterns Detected: ${patterns.join(', ')}]`, 'system');
    }

    // Add overlapping messages
    overlap.forEach(msg => {
      this.append(msg.content, msg.role);
    });
  }

  getContextForPrompt() {
    return {
      summary: this.summary,
      recentMessages: this.stream.slice(-10) // Last 10 messages for context
    };
  }
}

export default StreamManager;