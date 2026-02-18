import MemoryStorage from '../../lib/memory/storage';

export default async function handler(req, res) {
    const slug = 'beyond-the-screen';

    try {
        const storage = new MemoryStorage(999);
        const memory = await storage.getDomainMemoryByKey('blog_post', slug);

        if (!memory) {
            return res.status(404).json({ error: 'Not found', slug });
        }

        // Show what we got back (without the full content)
        return res.status(200).json({
            found: true,
            id: memory.id,
            key_field: memory.key_field,
            category: memory.category,
            value: memory.value,
            hasStructuredData: !!memory.structured_data,
            hasContext: !!memory.context,
            updatedAtType: typeof memory.updated_at,
            updatedAtValue: String(memory.updated_at),
            structuredDataPreview: memory.structured_data
                ? memory.structured_data.substring(0, 200)
                : null,
            contextPreview: memory.context
                ? memory.context.substring(0, 200)
                : null,
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
            stack: error.stack?.split('\n').slice(0, 5)
        });
    }
}
