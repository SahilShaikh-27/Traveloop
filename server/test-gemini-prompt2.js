const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const prompt = `You are an expert travel planner. Plan a 3-day travel itinerary for a trip titled "Test Trip" with a "Relaxing" travel vibe.
Total Budget: 30000 INR.
Planning Style: Balanced.

Return ONLY valid JSON objects separated by newlines (JSONL format). NO markdown, NO explanation, NO extra text. Do NOT wrap in a JSON array.
Each line must be exactly ONE valid JSON object representing ONE SINGLE DAY of the trip. So if it's a 3-day trip, there should be 3 lines.
Format for each line:
{"dayNumber": number, "cityName": "string", "country": "string", "activities": [{"time": "string (e.g. 09:00 AM)", "name": "string", "category": "food | sightseeing | adventure | transport | stay | culture | nightlife", "estimatedCost": number, "durationInMinutes": number, "notes": "string"}]}
`;

async function test() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
    });
    const result = await model.generateContentStream(prompt);
    
    let buffer = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      buffer += text;
    }
    console.log("FINAL BUFFER:\n", buffer);
    const response = await result.response;
    console.log("FINISH REASON:", response.candidates[0].finishReason);
  } catch (err) {
    console.error("ERROR WITH 2.5-flash prompt:", err);
  }
}

test();
