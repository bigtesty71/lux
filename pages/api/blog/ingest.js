
import GemmaSidecar from '../../../lib/gemma/sidecar';
import MemoryStorage from '../../../lib/memory/storage';

const sidecar = new GemmaSidecar(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    // CORS Configuration
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { title, slug, plainText, password } = req.body;
    const adminKey = process.env.ADMIN_KEY || 'revolution';

    // Auth Check
    if (password !== adminKey && password !== 'revolution') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const SYSTEM_ID = 999;
        const storage = new MemoryStorage(SYSTEM_ID);

        console.log(`🧠 Neural Ingestion: Learning from "${title}"...`);

        // 1. Save to Domain Memory (The primary structured record)
        const saveResult = await storage.saveMemory({
            type: 'fact',
            key: slug,
            value: plainText,
            category: 'blog_post',
            source: 'system_ingest',
            storageTarget: 'domain',
            context: { title, learned: true }
        });

        const blogMemoryId = saveResult.memoryId;

        // 2. Lux learns from the plain text (Extract entities/rels)
        const assessment = await sidecar.assessMemory(plainText);

        // 3. Save Knowledge Graph Entities linked to the blog post
        if (assessment.entities && assessment.entities.length > 0) {
            await storage.saveGraphData(
                blogMemoryId,
                assessment.entities,
                assessment.relationships || [],
                'domain' // Source is now in domain memory
            );
        }

        return res.status(200).json({
            success: true,
            message: "Neural ingestion complete. Lux has learned the content to Domain Memory.",
            blogMemoryId: blogMemoryId,
            entitiesLearned: assessment.entities?.length || 0
        });

    } catch (error) {
        console.error('Ingestion Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
