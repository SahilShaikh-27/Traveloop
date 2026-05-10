const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContentStream("Say hello in one word");
    for await (const chunk of result.stream) {
      console.log(chunk.text());
    }
  } catch (err) {
    console.error("ERROR WITH 2.5-flash:", err.message);
  }
}

test();
