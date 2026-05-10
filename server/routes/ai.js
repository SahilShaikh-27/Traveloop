const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.post('/generate-itinerary', authenticate, async (req, res) => {
  const { title, vibe, totalBudget, days } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });

    const prompt = `
      Create a detailed ${days}-day travel itinerary for a trip titled "${title}".
      The vibe of the trip is "${vibe}" and the total budget is ${totalBudget} INR.
      
      Return the response as a JSON array of objects, where each object represents a "stop" (city).
      Each stop should have:
      - cityName (String)
      - country (String)
      - activities (Array of objects with: name, category (food, sightseeing, transport, stay, adventure), estimatedCost, durationInMinutes, notes)
      
      Keep it realistic and within budget. Only return the JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from markdown if Gemini wraps it
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const itinerary = JSON.parse(jsonMatch ? jsonMatch[0] : text);

    res.json(itinerary);
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ message: 'AI failed to generate itinerary', error: error.message });
  }
});

module.exports = router;
