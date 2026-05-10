const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();
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

// ── Helper: build style-specific AI prompt ─────────────────────────────────
const STYLE_RULES = {
  cheapest: {
    label: 'Budget Backpacker',
    rules: [
      'Minimize costs at every step. Choose hostels, dorms, or guesthouses under ₹1500/night.',
      'Stick to street food, dhabas, and local eateries. No fine dining.',
      'Prefer free or very low-cost activities (temples, beaches, markets, trekking).',
      'Use shared/public transport (buses, trains, shared autos). No private cabs.',
      'The goal is to see as much as possible while spending the least.',
    ]
  },
  explorer: {
    label: 'Explorer',
    rules: [
      'Focus on unique, off-the-beaten-path experiences over tourist traps.',
      'Mix mid-range accommodation (₹2000–₹4000/night) with occasional homestays for authenticity.',
      'Recommend local hole-in-the-wall restaurants and cultural food experiences.',
      'Include adventure activities, nature hikes, and cultural immersion.',
      'Prefer scenic local transport where possible, occasional comfort cabs.',
    ]
  },
  balanced: {
    label: 'Balanced',
    rules: [
      'Balance comfort and value. Choose mid-range hotels (₹3000–₹6000/night).',
      'Mix local restaurants with a couple of good multi-cuisine options.',
      'Combine iconic landmarks with a few hidden gems.',
      'Use a mix of transport: local where fun, cab where convenient.',
      'The traveller should feel comfortable without overspending.',
    ]
  },
  premium: {
    label: 'Premium',
    rules: [
      'Choose 4-star hotels or boutique heritage properties (₹6000–₹12000/night).',
      'Include fine-dining restaurants and curated food experiences every day.',
      'Book guided tours for major attractions for a richer experience.',
      'Use private cabs for inter-city travel. Comfortable and hassle-free.',
      'The traveller wants to enjoy every moment without any compromise.',
    ]
  },
  luxury: {
    label: 'Luxury',
    rules: [
      'Only 5-star hotels, luxury resorts, or iconic heritage palaces.',
      'Michelin-level or award-winning restaurant recommendations every day.',
      'Private guided experiences, exclusive access, and curated VIP tours.',
      'All transport via private luxury vehicles or chartered options.',
      'Budget should be deployed fully for maximum opulence. No expense spared.',
    ]
  }
};

const buildPrompt = ({ days, title, vibe, totalBudget, planningStyle = 'balanced', isDifferent = false }) => {
  const style = STYLE_RULES[planningStyle] || STYLE_RULES.balanced;
  return `You are an expert travel planner. Plan a${isDifferent ? ' COMPLETELY DIFFERENT' : ''} ${days}-day travel itinerary for a trip titled "${title}" with a "${vibe}" travel vibe.
Total Budget: ${totalBudget} INR.
Planning Style: ${style.label}.

RULES FOR THIS PLANNING STYLE:
${style.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

ADDITIONAL RULES:
- Estimated costs must be realistic INR prices.
- Distribute the budget sensibly across all stops.
- Each activity should feel like a genuine highlight, not a filler.
- Include a helpful "notes" field per activity with tips, best time, and why it's worth it.

Return ONLY valid JSON objects separated by newlines (JSONL format). NO markdown, NO explanation, NO extra text. Do NOT wrap in a JSON array.
Each line must be exactly ONE valid JSON object representing ONE SINGLE DAY of the trip. So if it's a 3-day trip, there should be 3 lines.
Format for each line:
{"dayNumber": number, "cityName": "string", "country": "string", "activities": [{"time": "string (e.g. 09:00 AM)", "name": "string", "category": "food | sightseeing | adventure | transport | stay | culture | nightlife", "estimatedCost": number, "durationInMinutes": number, "notes": "string"}]}
`;
};

// ── Model runner helper ──────────────────────────────────────────────────────
const MODEL_NAMES = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-pro"];

const runAI = async (prompt) => {
  for (const modelName of MODEL_NAMES) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      console.log(`Success with model: ${modelName}`);
      return text;
    } catch (err) {
      console.warn(`Model ${modelName} failed: ${err.message}`);
    }
  }
  throw new Error('All AI models failed. Check your API key.');
};

const runAIStream = async (prompt, onLine) => {
  for (const modelName of MODEL_NAMES) {
    try {
      console.log(`Trying model stream: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContentStream(prompt);

      let buffer = '';
      for await (const chunk of result.stream) {
        buffer += chunk.text();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last partial line
        for (const line of lines) {
          if (line.trim()) onLine(line.trim());
        }
      }
      if (buffer.trim()) onLine(buffer.trim());
      console.log(`Stream success with model: ${modelName}`);
      return;
    } catch (err) {
      console.warn(`Model ${modelName} stream failed: ${err.message}`);
    }
  }
  throw new Error('All AI models failed during streaming.');
};

const parseItinerary = (text) => {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  const itinerary = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  if (!Array.isArray(itinerary)) throw new Error('AI did not return a valid itinerary array.');
  return itinerary;
};

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Appends original extension
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

// Create trip skeleton (AI generation will happen on the client side via stream)
router.post('/', authenticate, upload.single('coverImage'), async (req, res) => {
  const { title, description, startDate, endDate, totalBudget, vibe, planningStyle = 'balanced' } = req.body;

  let coverImageUrl = null;
  if (req.file) {
    coverImageUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.coverImage) {
    // Fallback if they pass a URL string instead of a file
    coverImageUrl = req.body.coverImage;
  }

  try {
    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        coverImage: coverImageUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalBudget: parseFloat(totalBudget),
        vibe,
        planningStyle,
        userId: req.userId,
      },
      include: { stops: { include: { activities: true } } }
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error("Trip Creation Error:", error);
    res.status(500).json({ message: 'Failed to create trip skeleton', error: error.message });
  }
});

// Search Cities dynamically using Gemini
router.get('/search-cities', authenticate, async (req, res) => {
  const { q } = req.query;
  const prompt = `
    You are a travel database API. 
    ${q ? `The user is searching for destinations matching or related to: "${q}".` : `Provide a curated list of 12 highly popular, diverse travel destinations globally.`}
    Return a valid JSON array of objects representing cities. Limit to 8 results if searching, 12 if no query.
    Each object MUST have these exact keys:
    - "name": City name
    - "country": Country name
    - "region": One of ["Asia", "Europe", "Americas", "Middle East", "Africa", "Oceania"]
    - "cost": "$", "$$", "$$$", or "$$$$"
    - "vibe": A short 2-3 word description of the vibe (e.g. "Culture & Food", "Tropical")
    - "pop": A number between 60 and 100 representing popularity.
    - "imageKeyword": A highly descriptive string to generate an image (e.g. "tokyo skyline at night", "colosseum rome sunset").
    
    Output STRICTLY raw JSON array without any markdown formatting, backticks, or extra text.
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cities = JSON.parse(text);
    res.json(cities);
  } catch (error) {
    console.error("City Search Error:", error);
    res.status(500).json({ error: 'Failed to search cities' });
  }
});

// Search Activities dynamically using Gemini
router.get('/search-activities', authenticate, async (req, res) => {
  const { cityName, q } = req.query;

  if (!cityName) return res.status(400).json({ error: "City name is required" });

  const prompt = `
    You are a local travel guide expert for ${cityName}. 
    ${q ? `The user is searching for things to do matching: "${q}".` : `Provide a curated list of 10 diverse, highly-rated activities, tours, or experiences in ${cityName}.`}
    Return a valid JSON array of objects representing activities. Limit to 8 results if searching, 10 if no query.
    Each object MUST have these exact keys:
    - "name": Name of the activity or place
    - "category": One of ["Sightseeing", "Food", "Adventure", "Nightlife", "Relaxation", "Culture"]
    - "estimatedCost": Estimated cost in INR (number only, e.g., 1500)
    - "duration": Estimated duration in minutes (number only, e.g., 120)
    - "notes": A captivating 1-2 sentence description of what the experience is like.
    - "imageKeyword": A highly descriptive string to generate an image (e.g., "eiffel tower paris sunset", "sushi tasting tokyo").
    
    Output STRICTLY raw JSON array without any markdown formatting, backticks, or extra text.
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const activities = JSON.parse(text);
    res.json(activities);
  } catch (error) {
    console.error("Activity Search Error:", error);
    res.status(500).json({ error: 'Failed to search activities' });
  }
});

// --- PUBLIC TRIPS ROUTES ---

// Get all public trips (for community explore page)
router.get('/public/all', async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: {
        stops: true,
        user: { select: { name: true, avatar: true } }
      }
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public trips' });
  }
});

// Get single public trip by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { publicSlug: req.params.slug },
      include: {
        user: { select: { name: true, avatar: true } },
        stops: {
          orderBy: { order: 'asc' },
          include: { activities: { orderBy: { order: 'asc' } } }
        },
        checklist: true
      }
    });
    if (!trip || !trip.isPublic) return res.status(404).json({ message: 'Trip not found or not public' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public trip' });
  }
});

// Publish / Unpublish trip
router.patch('/:id/publish', authenticate, async (req, res) => {
  try {
    const { isPublic } = req.body;
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip || trip.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    
    let slug = trip.publicSlug;
    if (isPublic && !slug) {
      slug = trip.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 6);
    }
    
    const updated = await prisma.trip.update({
      where: { id: req.params.id },
      data: { isPublic, publicSlug: slug }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update publish status' });
  }
});

// Copy public trip to user's dashboard
router.post('/public/:slug/copy', authenticate, async (req, res) => {
  try {
    const sourceTrip = await prisma.trip.findUnique({
      where: { publicSlug: req.params.slug },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          include: { activities: { orderBy: { order: 'asc' } } }
        },
        checklist: true
      }
    });
    if (!sourceTrip || !sourceTrip.isPublic) return res.status(404).json({ error: 'Trip not found' });
    
    const newTrip = await prisma.trip.create({
      data: {
        title: `${sourceTrip.title} (Copy)`,
        description: sourceTrip.description,
        coverImage: sourceTrip.coverImage,
        startDate: sourceTrip.startDate,
        endDate: sourceTrip.endDate,
        totalBudget: sourceTrip.totalBudget,
        vibe: sourceTrip.vibe,
        planningStyle: sourceTrip.planningStyle,
        userId: req.userId,
        isPublic: false
      }
    });

    for (const stop of sourceTrip.stops) {
      const newStop = await prisma.tripStop.create({
        data: {
          tripId: newTrip.id,
          cityName: stop.cityName,
          country: stop.country,
          dayNumber: stop.dayNumber,
          coverImage: stop.coverImage,
          startDate: stop.startDate,
          endDate: stop.endDate,
          order: stop.order
        }
      });

      if (stop.activities && stop.activities.length > 0) {
        for (const act of stop.activities) {
          await prisma.activity.create({
            data: {
              tripStopId: newStop.id,
              name: act.name,
              time: act.time,
              category: act.category,
              estimatedCost: act.estimatedCost,
              duration: act.duration,
              image: act.image,
              notes: act.notes,
              order: act.order
            }
          });
        }
      }
    }

    if (sourceTrip.checklist && sourceTrip.checklist.length > 0) {
      for (const item of sourceTrip.checklist) {
        await prisma.packItem.create({
          data: {
            tripId: newTrip.id,
            name: item.name,
            category: item.category,
            isPacked: false
          }
        });
      }
    }

    res.status(201).json({ success: true, newTripId: newTrip.id });
  } catch (error) {
    console.error("Copy Error:", error);
    res.status(500).json({ error: 'Failed to copy trip' });
  }
});

// Get single trip with all details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          include: {
            activities: { orderBy: { order: 'asc' } }
          }
        },
        checklist: true
      }
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trip details' });
  }
});

// Get all trips for user
router.get('/', authenticate, async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { stops: true }
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trips' });
  }
});

// Re-Plan Stream: Delete existing stops, generate with AI, and stream results
router.patch('/:id/replan', authenticate, async (req, res) => {
  const { id } = req.params;
  const { planningStyle } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      res.write(`data: ${JSON.stringify({ error: 'Trip not found' })}\n\n`);
      return res.end();
    }
    if (trip.userId !== req.userId) {
      res.write(`data: ${JSON.stringify({ error: 'Forbidden' })}\n\n`);
      return res.end();
    }

    // Add +1 so the end date is inclusive in the trip duration
    const days = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1 || 1;
    const chosenStyle = planningStyle || trip.planningStyle || 'balanced';

    // Delete existing stops
    const existingStops = await prisma.tripStop.findMany({ where: { tripId: id }, select: { id: true } });
    const stopIds = existingStops.map(s => s.id);
    if (stopIds.length > 0) {
      await prisma.activity.deleteMany({ where: { tripStopId: { in: stopIds } } });
    }
    await prisma.tripStop.deleteMany({ where: { tripId: id } });

    res.write(`data: ${JSON.stringify({ status: 'cleared' })}\n\n`);

    const prompt = buildPrompt({ days, title: trip.title, vibe: trip.vibe, totalBudget: trip.totalBudget, planningStyle: chosenStyle, isDifferent: true });

    const aiItinerary = [];

    await runAIStream(prompt, (line) => {
      let clean = line.replace(/```json/g, '').replace(/```jsonl/g, '').replace(/```/g, '').trim();
      if (clean.endsWith(',')) clean = clean.slice(0, -1);
      if (clean.startsWith('[')) clean = clean.slice(1);
      if (clean.endsWith(']')) clean = clean.slice(0, -1);

      try {
        const stop = JSON.parse(clean);
        if (stop.cityName) {
          aiItinerary.push(stop);
          // Stream this stop to the client!
          res.write(`data: ${JSON.stringify({ stop })}\n\n`);
        }
      } catch (e) {
        // Ignore partial/invalid lines
      }
    });

    // Save final generated stops to DB
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        planningStyle: chosenStyle,
        stops: {
          create: aiItinerary.map((stop, index) => {
            const dayNum = stop.dayNumber || index + 1;
            const stopDate = new Date(trip.startDate);
            stopDate.setDate(stopDate.getDate() + (dayNum - 1));
            
            return {
              dayNumber: dayNum,
              cityName: stop.cityName,
              country: stop.country,
              startDate: stopDate,
              endDate: stopDate, // Defaulting to same day for single-day stops
              order: index,
              activities: {
                create: (stop.activities || []).map((act, actIndex) => ({
                  name: act.name,
                  time: act.time || "Flexible",
                  category: act.category,
                  estimatedCost: parseFloat(act.estimatedCost) || 0,
                  duration: parseInt(act.durationInMinutes) || 60,
                  notes: act.notes,
                  order: actIndex
                }))
              }
            };
          })
        }
      },
      include: { stops: { include: { activities: true } } }
    });

    res.write(`data: ${JSON.stringify({ status: 'done', trip: updatedTrip })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Re-Plan Stream Error:", error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to re-plan trip', details: error.message })}\n\n`);
    res.end();
  }
});

// Manual Route: Add a stop
router.post('/:id/stops', authenticate, async (req, res) => {
  const { id } = req.params;
  const { dayNumber, cityName, country, startDate, endDate } = req.body;
  try {
    const trip = await prisma.trip.findUnique({ where: { id }, include: { stops: true } });
    if (!trip || trip.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    const stop = await prisma.tripStop.create({
      data: {
        tripId: id,
        dayNumber: parseInt(dayNumber) || (trip.stops.length + 1),
        cityName,
        country: country || '',
        startDate: startDate ? new Date(startDate) : trip.startDate,
        endDate: endDate ? new Date(endDate) : trip.endDate,
        order: trip.stops.length,
      },
      include: { activities: true }
    });
    res.status(201).json(stop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add stop' });
  }
});

// Manual Route: Add an activity
router.post('/:id/stops/:stopId/activities', authenticate, async (req, res) => {
  const { id, stopId } = req.params;
  const { name, category, time, duration, estimatedCost, notes } = req.body;
  try {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    const stop = await prisma.tripStop.findUnique({ where: { id: stopId }, include: { activities: true } });
    if (!stop) return res.status(404).json({ error: 'Stop not found' });

    // Auto-format time (e.g. "8" -> "8:00 AM", "14" -> "2:00 PM")
    let formattedTime = time || '';
    const trimmed = formattedTime.trim();
    if (/^\d{1,2}$/.test(trimmed)) {
      let hr = parseInt(trimmed);
      let suffix = 'AM';
      if (hr >= 12) { suffix = 'PM'; if (hr > 12) hr -= 12; }
      if (hr === 0) hr = 12;
      formattedTime = `${hr}:00 ${suffix}`;
    } else if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      let [h, m] = trimmed.split(':');
      let hr = parseInt(h);
      let suffix = 'AM';
      if (hr >= 12) { suffix = 'PM'; if (hr > 12) hr -= 12; }
      if (hr === 0) hr = 12;
      formattedTime = `${hr}:${m} ${suffix}`;
    }

    const activity = await prisma.activity.create({
      data: {
        tripStopId: stopId,
        name,
        category: category || 'general',
        time: formattedTime,
        duration: parseInt(duration) || 60,
        estimatedCost: parseFloat(estimatedCost) || 0,
        notes: notes || '',
        order: stop.activities.length,
      }
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

// Manual Route: Delete an activity
router.delete('/:id/stops/:stopId/activities/:activityId', authenticate, async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip || trip.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.activity.delete({ where: { id: req.params.activityId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// Manual Route: Delete a single stop
router.delete('/:id/stops/:stopId', authenticate, async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip || trip.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.activity.deleteMany({ where: { tripStopId: req.params.stopId } });
    await prisma.tripStop.delete({ where: { id: req.params.stopId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete stop' });
  }
});

// Manual Route: Clear all stops (Reset Trip)
router.delete('/:id/stops', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    const existingStops = await prisma.tripStop.findMany({ where: { tripId: id }, select: { id: true } });
    const stopIds = existingStops.map(s => s.id);
    if (stopIds.length > 0) {
      await prisma.activity.deleteMany({ where: { tripStopId: { in: stopIds } } });
    }
    await prisma.tripStop.deleteMany({ where: { tripId: id } });

    res.json({ message: 'Trip reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset trip' });
  }
});

// Manual Route: Reorder stops
router.patch('/:id/stops/reorder', authenticate, async (req, res) => {
  const { id } = req.params;
  const { stopId, direction } = req.body; // direction: 'up' or 'down'

  try {
    const trip = await prisma.trip.findUnique({ where: { id }, include: { stops: { orderBy: { order: 'asc' } } } });
    if (!trip || trip.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    let stops = [...trip.stops];
    const currentIndex = stops.findIndex(s => s.id === stopId);
    if (currentIndex === -1) return res.status(404).json({ error: 'Stop not found' });

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= stops.length) return res.status(400).json({ error: 'Cannot move further' });

    // Swap the elements in the array
    const temp = stops[currentIndex];
    stops[currentIndex] = stops[targetIndex];
    stops[targetIndex] = temp;

    // Recalculate dates and day numbers chronologically
    let currentDate = new Date(trip.startDate);
    let currentDayNumber = 1;

    const updates = stops.map((stop, index) => {
      // Calculate original duration (e.g. 0 for 1 day, 1 for 2 days)
      const durationDays = Math.round((new Date(stop.endDate) - new Date(stop.startDate)) / (1000 * 60 * 60 * 24));

      const newStartDate = new Date(currentDate);
      const newEndDate = new Date(currentDate);
      newEndDate.setDate(newEndDate.getDate() + durationDays);

      const newDayNumber = currentDayNumber;

      // Increment trackers for the next stop
      currentDate = new Date(newEndDate);
      currentDate.setDate(currentDate.getDate() + 1);
      currentDayNumber += durationDays + 1;

      return prisma.tripStop.update({
        where: { id: stop.id },
        data: {
          order: index,
          dayNumber: newDayNumber,
          startDate: newStartDate,
          endDate: newEndDate
        }
      });
    });

    await prisma.$transaction(updates);

    res.json({ message: 'Reordered and dates cascaded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder' });
  }
});

// Delete Trip
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    // Delete cascading stops and activities
    const existingStops = await prisma.tripStop.findMany({ where: { tripId: id }, select: { id: true } });
    const stopIds = existingStops.map(s => s.id);
    if (stopIds.length > 0) {
      await prisma.activity.deleteMany({ where: { tripStopId: { in: stopIds } } });
    }
    await prisma.tripStop.deleteMany({ where: { tripId: id } });
    await prisma.trip.delete({ where: { id } });

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

module.exports = router;

