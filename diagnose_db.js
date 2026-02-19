
import { query } from './lib/db/connection.js';

async function diagnose() {
    try {
        console.log('--- DATABASE DIAGNOSTIC ---');
        const tables = await query('SHOW TABLES');
        console.log('Tables:', JSON.stringify(tables, null, 2));

        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            console.log(`\nSchema for ${tableName}:`);
            const schema = await query(`DESCRIBE \`${tableName}\``);
            console.log(JSON.stringify(schema, null, 2));

            const count = await query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
            console.log(`Row count: ${count[0].count}`);
        }

        console.log('\n--- SAMPLE DATA FROM DOMAIN_MEMORY (experience category) ---');
        const samples = await query('SELECT * FROM domain_memory WHERE category = "experience" LIMIT 5');
        console.log(JSON.stringify(samples, null, 2));

    } catch (err) {
        console.error('Diagnostic failed:', err);
    } finally {
        process.exit();
    }
}

diagnose();
