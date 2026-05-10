const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const models = await genAI.listModels();
    console.log("AVAILABLE MODELS:");
    console.log(JSON.stringify(models, null, 2));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
