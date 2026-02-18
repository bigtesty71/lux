import GemmaMainEngine from '../../../lib/gemma/main-engine';

// Initialize Engine (singleton-ish behavior in lambda)
const engine = new GemmaMainEngine(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, memberId, email, name } = req.body;

        console.log('💬 Chat from member:', memberId, 'Message:', message);

        // Use the engine to generate response with full memory context
        const response = await engine.generate(message, {
            memberId: memberId || 1, // Default to 1 if testing without auth
            userEmail: email,
            userName: name
        });

        return res.status(200).json({ response });

    } catch (error) {
        console.error('Chat error:', error);

        // Log to file for debugging
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(process.cwd(), 'chat-error.log');
        const logEntry = `[${new Date().toISOString()}] ${error.message}\n${error.stack}\n\n`;
        fs.appendFileSync(logPath, logEntry);

        return res.status(500).json({
            response: "I am Lux. The revolution continues... but I encountered a slight internal friction. Try again.",
            debugError: error.message // Temporarily expose error to frontend
        });
    }
}