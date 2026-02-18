import React, { useState, useEffect } from 'react';

const MemoryVisualizer = ({ memberId }) => {
  const [memories, setMemories] = useState({ experience: [], domain: [], combined: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    experience: 0,
    domain: 0,
    topCategories: []
  });

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async (query = '') => {
    setLoading(true);
    try {
      const url = query 
        ? `/api/memory/manage?q=${encodeURIComponent(query)}`
        : '/api/memory/manage?limit=50';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (query) {
        setMemories(data);
        calculateStats(data.combined);
      } else {
        setMemories({ combined: data.memories });
        calculateStats(data.memories);
      }
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (mems) => {
    const exp = mems.filter(m => m.memory_type === 'experience').length;
    const dom = mems.filter(m => m.memory_type === 'domain').length;
    
    // Get top categories
    const categories = {};
    mems.forEach(m => {
      const cat = m.category || 'uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    const topCats = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    setStats({
      total: mems.length,
      experience: exp,
      domain: dom,
      topCategories: topCats
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadMemories(searchQuery);
    }
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    if (type === 'all') {
      loadMemories(searchQuery);
    } else {
      const filtered = memories.combined.filter(m => m.memory_type === type);
      setMemories({ ...memories, combined: filtered });
    }
  };

  return (
    <div className="memory-visualizer">
      <div className="memory-header">
        <h2>Lux's Memory Visualization</h2>
        <div className="memory-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Memories</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.experience}</span>
            <span className="stat-label">Experience</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.domain}</span>
            <span className="stat-label">Domain</span>
          </div>
        </div>
      </div>

      <div className="memory-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all memories..."
            className="search-input"
          />
          <button type="submit" className="search-button">🔍 Search</button>
        </form>

        <div className="filter-buttons">
          <button 
            className={selectedType === 'all' ? 'active' : ''}
            onClick={() => handleTypeFilter('all')}
          >
            All
          </button>
          <button 
            className={selectedType === 'experience' ? 'active' : ''}
            onClick={() => handleTypeFilter('experience')}
          >
            Experience
          </button>
          <button 
            className={selectedType === 'domain' ? 'active' : ''}
            onClick={() => handleTypeFilter('domain')}
          >
            Domain
          </button>
        </div>
      </div>

      <div className="category-cloud">
        {stats.topCategories.map(cat => (
          <span 
            key={cat.name}
            className="category-tag"
            onClick={() => setSearchQuery(cat.name)}
            style={{ fontSize: `${12 + cat.count * 2}px` }}
          >
            {cat.name} ({cat.count})
          </span>
        ))}
      </div>

      <div className="memories-grid">
        {loading ? (
          <div className="loading">🧠 Accessing memory banks...</div>
        ) : (
          memories.combined.map(memory => (
            <div key={`${memory.memory_type}-${memory.id}`} className={`memory-card ${memory.memory_type}`}>
              <div className="memory-icon">
                {memory.memory_type === 'experience' ? '🧠' : '📁'}
              </div>
              <div className="memory-details">
                <div className="memory-type-badge">
                  {memory.memory_type === 'experience' ? memory.type : memory.category}
                </div>
                <div className="memory-content">
                  {memory.content || `${memory.key}: ${memory.value}`}
                </div>
                {memory.confidence && (
                  <div className="memory-confidence">
                    Confidence: {Math.round(memory.confidence * 100)}%
                  </div>
                )}
                <div className="memory-meta">
                  <span>Created: {new Date(memory.created).toLocaleDateString()}</span>
                  {memory.recall_count > 0 && (
                    <span>Recalled: {memory.recall_count} times</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .memory-visualizer {
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .dark .memory-visualizer {
          background: #1a1a1a;
          color: white;
        }

        .memory-header {
          margin-bottom: 20px;
        }

        .memory-header h2 {
          margin: 0 0 16px;
          font-size: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .memory-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .stat-card {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
        }

        .dark .stat-card {
          background: #2d2d2d;
        }

        .stat-value {
          display: block;
          font-size: 28px;
          font-weight: bold;
          color: #667eea;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
        }

        .memory-controls {
          margin: 20px 0;
        }

        .search-form {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .search-input {
          flex: 1;
          padding: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
        }

        .dark .search-input {
          background: #333;
          border-color: #444;
          color: white;
        }

        .search-button {
          padding: 10px 16px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .filter-buttons button {
          flex: 1;
          padding: 8px;
          background: #f0f0f0;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .filter-buttons button.active {
          background: #667eea;
          color: white;
        }

        .category-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
          margin: 20px 0;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          align-items: center;
          justify-content: center;
        }

        .dark .category-cloud {
          background: #2d2d2d;
        }

        .category-tag {
          cursor: pointer;
          color: #667eea;
          transition: all 0.2s;
        }

        .category-tag:hover {
          transform: scale(1.1);
          color: #764ba2;
        }

        .memories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          max-height: 500px;
          overflow-y: auto;
          padding: 4px;
        }

        .memory-card {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid;
          transition: transform 0.2s;
        }

        .memory-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .dark .memory-card {
          background: #2d2d2d;
        }

        .memory-card.experience {
          border-left-color: #667eea;
        }

        .memory-card.domain {
          border-left-color: #764ba2;
        }

        .memory-icon {
          font-size: 24px;
        }

        .memory-details {
          flex: 1;
        }

        .memory-type-badge {
          display: inline-block;
          padding: 2px 8px;
          background: #e0e0e0;
          border-radius: 12px;
          font-size: 11px;
          margin-bottom: 6px;
          text-transform: capitalize;
        }

        .dark .memory-type-badge {
          background: #444;
        }

        .memory-content {
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 8px;
          word-break: break-word;
        }

        .memory-confidence {
          font-size: 11px;
          color: #4caf50;
          margin-bottom: 4px;
        }

        .memory-meta {
          display: flex;
          gap: 12px;
          font-size: 10px;
          color: #999;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default MemoryVisualizer;