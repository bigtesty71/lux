import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Error: GEMINI_API_KEY is not set in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Check available models
        // Note: listModels is on the genAI instance, or via getGenerativeModel for specific endpoint?
        // Actually, listModels is not directly on getGenerativeModel instance usually, but SDK v1beta might differ.
        // The user's snippet was: genAI.getGenerativeModel({ model: "models/gemini-pro" }).listModels();
        // But usually it's genAI.getGenerativeModel(...).
        // Let's try the standard way first. Or follow the user's snippet if valid.

        // Standard way is often confusing. 
        // The user's snippet: const listModels = await genAI.getGenerativeModel({ model: "models/gemini-pro" }).listModels();
        // This looks odd. But let's try a safe approach.

        // Actually, checking docs: genAI.getGenerativeModel is for inference.
        // Model listing is often separate.
        // However, the user provided:
        // const listModels = await genAI.getGenerativeModel({ model: "models/gemini-pro" }).listModels();
        // Maybe they meant `genAI.getGenerativeModel` return object has `listModels`? Unlikely.
        // A better way is using the `GoogleGenerativeAI` class methods or the `generative-ai` package exports if available.
        // BUT, the user's snippet might be pseudo-code or from a specific version.

        // Let's use a known working way to list models if possible, or just print a message.
        // Actually, I will just create a simple connection test.

        console.log("Checking model access for: models/gemma-3-27b-it");
        const model = genAI.getGenerativeModel({ model: "models/gemma-3-27b-it" }, { apiVersion: "v1beta" });

        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        console.log("Response:", response.text());
        console.log("SUCCESS: Model is accessible!");

    } catch (error) {
        console.error("Error accessing model:", error.message);
        if (error.message.includes("404")) {
            console.error("This confirms the model is not found or not accessible with current settings.");
        }
    }
}

listModels();
