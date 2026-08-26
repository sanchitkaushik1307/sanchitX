import OpenAI from "openai";
import "dotenv/config";

const getGroqResponse = async (message, requestedModel) => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === "your_groq_api_key_here") {
        return "⚠️ GROQ_API_KEY is not configured. Please set your `GROQ_API_KEY` in the `Backend/.env` file to receive live AI responses.";
    }

    const preferredModel = requestedModel || process.env.GROQ_MODEL || "openai/gpt-oss-120b";
    const fallbackModels = ["openai/gpt-oss-120b", "llama-3.3-70b-versatile", "groq/compound", "qwen/qwen3.8-27b"];
    const modelsToTry = [preferredModel, ...fallbackModels.filter(m => m !== preferredModel)];

    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.groq.com/openai/v1"
    });

    let lastError = null;

    for (const model of modelsToTry) {
        try {
            const completion = await openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ]
            });

            if (completion.choices && completion.choices.length > 0 && completion.choices[0].message) {
                return completion.choices[0].message.content;
            }
        } catch (err) {
            console.error(`Groq Model '${model}' notice: ${err.message || err}`);
            lastError = err;

            if (err.status === 401 || (err.message && err.message.includes("API key"))) {
                return "⚠️ Invalid GROQ_API_KEY. Please verify your API key at https://console.groq.com/keys";
            }
            if (err.status === 429 || (err.message && err.message.includes("rate limit"))) {
                return "⚠️ Groq API Rate Limit reached. Please wait a few seconds and try again.";
            }

            // If 404 (model not found), loop continues to try next fallback model
        }
    }

    return `⚠️ Groq API Error: ${lastError?.message || "Failed to generate AI response."}`;
};

export default getGroqResponse;
