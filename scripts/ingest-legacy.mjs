
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import MemoryStorage from '../lib/memory/storage.js'; // Note .js extension for ESM
import GemmaSidecar from '../lib/gemma/sidecar.js';
import { query } from '../lib/db/connection.js';

// Load environment variables for local testing
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../assets/blogs');

async function ingestLegacy() {
    console.log('🚀 Starting Legacy Blog Ingestion...');

    // 0. Ensure System Member Exists (ID 999)
    try {
        // Using correct schema: id, username, full_name, email, subscription_tier
        await query(`
      INSERT INTO members (id, username, full_name, email, subscription_tier) 
      VALUES (999, 'System', 'CompanionAI System', 'system@companai.life', 'admin')
      ON DUPLICATE KEY UPDATE full_name='CompanionAI System'
    `);
        console.log('✅ System Member (ID 999) Verified in Database.');
    } catch (err) {
        console.error('⚠️ Could not create/verify System Member (ID 999):', err.message);
        // Proceed, maybe it exists or schema differs slightly
    }

    // Initialize Systems
    const storage = new MemoryStorage(999); // System ID for this context
    const sidecar = new GemmaSidecar(process.env.GEMINI_API_KEY);

    try {
        const files = await fs.readdir(BLOG_DIR);
        const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'index.html'); // Skip index

        console.log(`Found ${htmlFiles.length} blog posts to ingest.`);

        for (const file of htmlFiles) {
            console.log(`\n📄 Processing: ${file}...`);

            const filePath = path.join(BLOG_DIR, file);
            let content = await fs.readFile(filePath, 'utf-8');

            // Fix known CSS issue: object-cover -> object-fit: cover
            content = content.replace(/object-cover/g, 'object-fit: cover;');

            // 1. Extract Title & Slug
            const title = file.replace('.html', '').replace(/-/g, ' ');
            const slug = file.replace('.html', '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

            // 2. Clean Content for Memory (Text only)
            const textContent = content.replace(/<[^>]*>?/gm, ' ') // Strip tags
                .replace(/\s+/g, ' ').trim(); // Normalize whitespace

            console.log(`   - Title: ${title}`);
            console.log(`   - Slug: ${slug}`);

            // 3. Save to Domain Memory (The "File")
            const blogId = await storage.saveToDomain({
                category: 'blog_post',
                key: slug,
                value: title,
                context: JSON.stringify({
                    content: content, // Store full HTML (with fix)
                    heroImage: '/assets/images/tree.png', // Default hero for now
                    category: 'Legacy Archive',
                    publishedAt: new Date().toISOString(),
                    author: 'CompanionAI (Legacy)'
                })
            });

            console.log(`   ✅ Saved to Domain Memory (ID: ${blogId})`);

            // 4. Neural Ingestion (The "Brain")
            console.log(`   🧠 Analyzing with Sidecar...`);
            // Limit to 5k chars to fit context window efficiently
            const assessment = await sidecar.assessMemory(textContent.substring(0, 5000));

            if (assessment.entities && assessment.entities.length > 0) {
                await storage.saveGraphData(
                    blogId,
                    assessment.entities,
                    assessment.relationships || []
                );
                console.log(`   🔗 Linked ${assessment.entities.length} entities.`);
            }
        }

        console.log('\n✅ Ingestion Complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Ingestion Failed:', error);
        process.exit(1);
    }
}

ingestLegacy();
