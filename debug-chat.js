
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import GemmaMainEngine from './lib/gemma/main-engine.js';
import { testConnection } from './lib/db/connection.js';

async function debugChat() {
    console.log("--- Starting Debug Session ---");

    // 1. Test DB Connection
    console.log("Testing DB connection...");
    const dbSuccess = await testConnection();
    if (!dbSuccess) {
        console.error("❌ DB Connection failed. Aborting.");
        return;
    }
    console.log("✅ DB Connection passed.");

    // 2. Test Engine Initialization
    console.log("Initializing GemmaMainEngine...");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY missing.");
        return;
    }
    const engine = new GemmaMainEngine(apiKey);

    // 3. Test Generation
    console.log("Testing engine.generate()...");
    try {
        const response = await engine.generate("Hello, this is a test message.", { memberId: 1 });
        console.log("Response received:");
        console.log(response);

        if (response.includes("circuits are momentarily overloaded")) {
            console.error("❌ Received fallback error message. Check logs above (engine should have logged the actual error).");
        } else {
            console.log("✅ Chat generation successful.");
        }

    } catch (error) {
        console.error("❌ Uncaught error during generation:", error);
    }
}

debugChat();
