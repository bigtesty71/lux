
const https = require('https');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
// Using v1beta as some models are only there
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Checking models with key: ${apiKey ? 'PRESENT' : 'MISSING'}`);

https.get(url, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (data.models) {
                console.log("--- AVAILABLE MODELS ---");
                const fs = require('fs');
                const modelNames = data.models
                    .filter(m => m.name.toLowerCase().includes('gemma'))
                    .map(m => m.name)
                    .join('\n');

                fs.writeFileSync('available_models.txt', modelNames);
                console.log("Wrote models to available_models.txt");
                console.log("------------------------");
            } else {
                console.log("Error or no models:", data);
            }
        } catch (e) {
            console.error("Parse error:", e);
            console.log("Raw body:", body);
        }
    });
}).on('error', e => console.error(e));
