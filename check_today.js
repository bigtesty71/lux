
import { query } from './lib/db/connection.js';

async function checkToday() {
    try {
        console.log('--- CHECKING TODAY (Feb 19) ---');
        const today = '2026-02-19';

        const domain = await query('SELECT id, category, key_field, value, updated_at FROM domain_memory WHERE updated_at >= ?', [today]);
        console.log(`\nDomain Memory Today (${domain.length}):`);
        console.log(JSON.stringify(domain, null, 2));

        const experience = await query('SELECT id, memory_type, content, category, created_at FROM experience_memory WHERE created_at >= ?', [today]);
        console.log(`\nExperience Memory Today (${experience.length}):`);
        console.log(JSON.stringify(experience, null, 2));

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        process.exit();
    }
}

checkToday();
