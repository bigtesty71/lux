import MemoryStorage from '../../../lib/memory/storage';

export default async function handler(req, res) {
    // CORS
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { title, slug, category, summary, plainText, publishDate } = req.body;

        if (!title || !plainText) {
            return res.status(400).json({ error: 'Title and plainText are required' });
        }

        // Use memberId 1 as the "System/Lux" identifier for knowledge ingestion
        const systemMemberId = 1;
        const storage = new MemoryStorage(systemMemberId);

        console.log('📰 Ingesting blog post into Lux memory:', title);

        // 1. Save as a "Fact" in Domain Memory (Structured)
        await storage.saveMemory({
            type: 'fact',
            category: 'blog',
            key: slug || title.toLowerCase().replace(/ /g, '-'),
            value: JSON.stringify({
                title,
                category,
                summary,
                publishDate: publishDate || new Date().toISOString()
            }),
            content: `Blog Post: ${title}`,
            source: 'blog_ingest'
        });

        // 2. Save as an "Insight" in Experience Memory (Unstructured - for AI learning)
        await storage.saveMemory({
            type: 'insight',
            category: 'knowledge',
            content: `New Knowledge Transmission: ${title}\n\nSummary: ${summary}\n\nContent:\n${plainText}`,
            source: 'blog_ingest',
            storageTarget: 'experience',
            confidence: 1.0
        });

        return res.status(200).json({
            success: true,
            message: `Blog post '${title}' ingested successfully. Lux has synthesized the new knowledge.`
        });

    } catch (error) {
        console.error('Ingestion error:', error);
        return res.status(500).json({
            error: 'Inertia detected in ingestion cycle.',
            details: error.message
        });
    }
}
