
import { query } from './lib/db/connection.js';

async function diagnose() {
    try {
        console.log('--- DATABASE SCHEMA SUMMARY ---');
        const tables = await query('SHOW TABLES');

        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            if (tableName.includes('_memory')) {
                const count = await query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
                console.log(`Table: ${tableName} | Count: ${count[0].count}`);
                const schema = await query(`DESCRIBE \`${tableName}\``);
                console.log(`Schema for ${tableName}:`);
                schema.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
            }
        }
    } catch (err) {
        console.error('Diagnostic failed:', err);
    } finally {
        process.exit();
    }
}

diagnose();
