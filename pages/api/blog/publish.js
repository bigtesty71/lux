
import GemmaSidecar from '../../../lib/gemma/sidecar';
import MemoryStorage from '../../../lib/memory/storage';

const sidecar = new GemmaSidecar(process.env.GEMINI_API_KEY);

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    // CORS Configuration
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle Preflight Request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }


    const { title, slug, content, plainText, password, heroImage, category } = req.body;
    const adminKey = process.env.ADMIN_KEY || 'lux-admin'; // Default fallback

    // 1. Auth Check
    if (password !== adminKey) {
        // Allow a simple hardcoded check for now if env not set
        if (password !== 'revolution') {
            return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
        }
    }

    try {
        // 2. Initialize Storage (System Level)
        const SYSTEM_ID = 999;
        const storage = new MemoryStorage(SYSTEM_ID);

        console.log(`📝 Publishing Blog: "${title}" (${slug})...`);

        // 3. Save Logic (Dual Path)

        // PATH A: The Public Content (What the site displays)
        // We save this as a special Domain Memory: 'blog_post'
        const blogId = await storage.saveToDomain({
            category: 'blog_post',
            key: slug,
            value: title,
            context: JSON.stringify({
                content: content,
                heroImage: heroImage,
                category: category,
                publishedAt: new Date().toISOString(),
                author: 'CompanionAI'
            })
        });

        // PATH B: The Neural Ingestion (What Lux learns)
        // We use the plainText version for her brain if available, otherwise fallback to stripping tags
        const learningContent = plainText || content.replace(/<[^>]*>?/gm, '');
        const assessment = await sidecar.assessMemory(learningContent);

        // Save Knowledge Graph Entities
        if (assessment.entities && assessment.entities.length > 0) {
            await storage.saveGraphData(
                blogId,
                assessment.entities,
                assessment.relationships || []
            );
        }

        // Save Experience (Lux remembers "We published this" and the CLEAN text)
        await storage.saveMemory({
            type: 'insight',
            content: `KNOWLEDGE GAINED: "${title}"\n\n${learningContent.substring(0, 2000)}`,
            category: 'transmission_digest',
            source: 'system_publisher',
            storageTarget: 'experience',
            context: { slug, entityCount: assessment.entities?.length || 0 }
        });

        return res.status(200).json({
            success: true,
            slug,
            entitiesLearned: assessment.entities?.length || 0
        });

    } catch (error) {
        console.error('Publishing Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
