
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Manually load env
const envPath = path.resolve(process.cwd(), ".env.local");
let apiKey = process.env.GEMINI_API_KEY;

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
        const [key, value] = line.split('=');
        if (key && value && key.trim() === 'GEMINI_API_KEY') {
            apiKey = value.trim();
            break;
        }
    }
}

if (!apiKey) {
    console.error("No API KEY found in process.env or .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log("Models:");
        if (data.models) {
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (${m.displayName})`);
            });
        } else {
            console.log("No models found or error structure:", data);
        }

    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
