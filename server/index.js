const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Traveloop API is running' });
});

// Route Registration
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notes', require('./routes/notes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, prisma, genAI };
// touch
