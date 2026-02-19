
import MemoryStorage from '../lib/memory/storage.js';
import { query } from '../lib/db/connection.js';

async function verifyRouting() {
    const memberId = 2; // Test member
    const storage = new MemoryStorage(memberId);

    console.log('🧪 Starting Memory Routing Verification...');

    // Test 1: Explicit Experience Routing
    console.log('\n--- Test 1: Explicit Experience Routing ---');
    const expResult = await storage.saveExperienceMemory({
        type: 'insight',
        content: 'Verification test: This should go to experience_memory.',
        category: 'test_experience'
    });
    console.log('Result:', expResult);

    const expCheck = await query('SELECT * FROM experience_memory WHERE id = ?', [expResult.memoryId]);
    if (expCheck.length > 0) {
        console.log('✅ PASS: Memory found in experience_memory table.');
    } else {
        console.log('❌ FAIL: Memory NOT found in experience_memory table.');
    }

    // Test 2: Explicit Domain Routing
    console.log('\n--- Test 2: Explicit Domain Routing ---');
    const domResult = await storage.saveDomainMemory({
        category: 'user_profile',
        key: 'test_key_' + Date.now(),
        value: 'Verification value',
        source: 'test_suite'
    });
    console.log('Result:', domResult);

    const domCheck = await query('SELECT * FROM domain_memory WHERE id = ?', [domResult.memoryId]);
    if (domCheck.length > 0 && domCheck[0].category === 'user_profile') {
        console.log('✅ PASS: Memory found in domain_memory table with correct category.');
    } else {
        console.log('❌ FAIL: Memory routing or category mismatch in domain_memory.');
    }

    // Test 3: Fallback Routing (Missing Key)
    console.log('\n--- Test 3: Fallback Routing (Missing Key for Domain) ---');
    // Attempting to save a "fact" without a key - should fallback to experience
    const fallbackResult = await storage.saveMemory({
        type: 'fact',
        content: 'Fact without a key - should fallback to experience.',
        category: 'user'
    });
    console.log('Target:', fallbackResult.storageTarget);

    if (fallbackResult.storageTarget === 'experience') {
        console.log('✅ PASS: Correctly fell back to Experience due to missing key.');
    } else {
        console.log('❌ FAIL: Did not fallback to Experience.');
    }

    console.log('\n🧪 Verification Complete.');
    process.exit();
}

verifyRouting();
