const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
let apiKey = null;

try {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    const apiKeyMatch = envConfig.match(/GEMINI_API_KEY=(.*)/);
    if (apiKeyMatch) {
        apiKey = apiKeyMatch[1].trim();
        if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
            apiKey = apiKey.slice(1, -1);
        }
    }
} catch (e) {
    console.error("Could not read .env file");
}

if (!apiKey) {
    console.error("GEMINI_API_KEY not found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testEnglishQuery() {
    const modelName = "gemini-2.5-flash"; // User's requested model
    const systemInstruction = "You are a helpful assistant for a ticket system. You MUST answer all questions in English.";

    try {
        console.log(`Testing ${modelName} with English instruction...`);
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstruction
        });

        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        console.log("Response:", response.text());
        console.log("SUCCESS");
    } catch (error) {
        console.error("FAILURE:", error.message);
        if (error.response) {
            console.error("Error details:", JSON.stringify(error.response, null, 2));
        }
    }
}

testEnglishQuery();
