
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

        // Lux learns from the plain text
        const assessment = await sidecar.assessMemory(plainText);

        // Save Knowledge Graph Entities
        if (assessment.entities && assessment.entities.length > 0) {
            // We save the entities to the graph, using 0 as the trigger memory for now
            // since the blog itself lives as a static file on Hostinger.
            await storage.saveGraphData(
                0,
                assessment.entities,
                assessment.relationships || []
            );
        }

        // Save Experience (Lux's internal insight)
        // This is the "Text version" stored in her brain.
        await storage.saveMemory({
            type: 'insight',
            content: `KNOWLEDGE GAINED: Blog Post "${title}"\n\n${plainText}`,
            category: 'transmission_digest',
            source: 'system_ingest',
            storageTarget: 'experience',
            context: { slug, learned: true }
        });

        return res.status(200).json({
            success: true,
            message: "Neural ingestion complete. Lux has learned the content.",
            entitiesLearned: assessment.entities?.length || 0
        });

    } catch (error) {
        console.error('Ingestion Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
