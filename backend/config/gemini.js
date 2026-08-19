const { GoogleGenAI } = require("@google/genai");

let ai = null;

const getAI = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.5-flash"];

const generateAIResponse = async (prompt) => {
  const client = getAI();

  for (const model of MODELS) {
    try {
      const response = await client.models.generateContent({
        model: model,
        contents: prompt,
      });
      return response.text;
    } catch (err) {
      if (err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED")) {
        console.log(`${model} rate limited, trying next...`);
        continue;
      }
      throw err;
    }
  }

  throw new Error("All AI models are rate limited. Please try again in a minute.");
};

module.exports = { generateAIResponse };
