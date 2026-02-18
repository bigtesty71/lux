
cat > test - gemma.js << 'EOF'
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ silent: true });  // This silences the ad

const API_KEY = process.env.GEMINI_API_KEY;

async function testGemma() {
    console.log('Testing with key:', API_KEY ? '✅ Key exists' : '❌ No key');

    if (!API_KEY) {
        console.log('Please add GEMINI_API_KEY to your .env.local file');
        return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    const models = [
        '',
        'models/',
        'gemma-2-27b-it',
        'models/gemma-2-27b-it'
    ];

    for (const modelName of models) {
        try {
            console.log(`\n🤔 Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say hello in one word');
            const response = await result.response;
            console.log(`✅ SUCCESS: ${response.text()}`);
            console.log(`🎉 Use this model name: "${modelName}"`);
            return;
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
        }
    }

    console.log('\n❌ All models failed. Check your API key.');
}

testGemma();
EOF