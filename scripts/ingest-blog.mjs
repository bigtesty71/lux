
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import GemmaSidecar from '../lib/gemma/sidecar.js';
import MemoryStorage from '../lib/memory/storage.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ingestBlog() {
    // 1. Parse Arguments
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: node scripts/ingest-blog.js <file_path> <title>');
        process.exit(1);
    }

    const filePath = args[0];
    const title = args[1];

    console.log(`Phase 1: Reading Blog Post "${title}" from ${filePath}...`);

    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // 2. Initialize AI & Storage
        const sidecar = new GemmaSidecar(process.env.GEMINI_API_KEY);
        // Use a special 'system' member ID (e.g., 0 or 999) for global knowledge
        const SYSTEM_MEMBER_ID = 999;
        const storage = new MemoryStorage(SYSTEM_MEMBER_ID);

        // 3. Process with Sidecar (Extract Insights & Entities)
        console.log('Phase 2: Analyzing content with Gemma 3 Sidecar...');
        const assessment = await sidecar.assessMemory(content);

        // 4. Save to Memory (The "Knowledge Base")
        console.log('Phase 3: Saving to Memory Keep...');

        // A. Save the Full Article (Experience/Content)
        const articleId = await storage.saveMemory({
            type: 'blog_post',
            content: `[BLOG: ${title}] ${content}`, // Tag it clearly
            category: 'ai_news',
            confidence: 1.0,
            source: 'blog_ingestion',
            storageTarget: 'experience', // Full text is an exprience/event
            context: { title, filename: filePath }
        });

        // B. Save the Knowledge Graph (Entities & Relationships)
        if (assessment.entities && assessment.entities.length > 0) {
            console.log(`   - Saving ${assessment.entities.length} entities...`);
            await storage.saveGraphData(
                articleId.memoryId,
                assessment.entities,
                assessment.relationships || []
            );
        }

        // C. Save a High-Level Summary (Domain Fact)
        // We could ask Sidecar for a summary explicitly, or rely on extractedInfo.
        // Let's create a domain fact that this article EXISTS.
        await storage.saveToDomain({
            category: 'knowledge_index',
            key: `blog_${Date.now()}`,
            value: title,
            context: JSON.stringify({ summary: assessment.extractedInfo?.description || 'AI Blog Post' })
        });

        console.log('✅ Ingestion Complete! Lux now knows about this article.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

ingestBlog();
