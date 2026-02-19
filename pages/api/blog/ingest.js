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

        console.log('📰 Ingesting blog post into Lux authority memory via saveDomainMemory:', title);

        // Save as an Authority Record in Domain Memory (Permanent Knowledge)
        const storageResult = await storage.saveDomainMemory({
            category: 'blog_authority',
            key: slug || title.toLowerCase().replace(/ /g, '-'),
            value: plainText, // Store the WHOLE article in Domain Memory
            context: {
                title,
                category,
                summary,
                publishDate: publishDate || new Date().toISOString(),
                ingest_type: 'zenith_automatic'
            },
            source: 'blog_ingest'
        });

        res.setHeader('X-Lux-Ingest-Version', '3.1');

        return res.status(200).json({
            success: true,
            message: `Blog post '${title}' ingested successfully. Lux has archived the record in Domain Memory.`,
            storageTarget: 'domain',
            id: storageResult.memoryId
        });

    } catch (error) {
        console.error('Ingestion error:', error);
        return res.status(500).json({
            error: 'Inertia detected in ingestion cycle.',
            details: error.message,
            version: '3.1'
        });
    }
}
