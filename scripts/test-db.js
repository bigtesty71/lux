import { testConnection } from '../lib/db/connection.js';

async function test() {
    const connected = await testConnection();
    console.log('Database connection test:', connected ? 'SUCCESS ✅' : 'FAILED ❌');
}

test();