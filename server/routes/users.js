const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/avatars';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `avatar-${req.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

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

// GET current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        savedDestinations: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Don't send password hash
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// UPDATE profile (name, email, language)
router.patch('/profile', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, language } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (language) updateData.language = language;
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData
    });
    
    const { passwordHash, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// DELETE account
router.delete('/profile', authenticate, async (req, res) => {
  try {
    // Delete all user related data first or rely on cascade if set up
    // In our schema, we should handle cascading deletes manually for safety if not set in DB
    
    // Delete activities and stops for all trips
    const trips = await prisma.trip.findMany({ where: { userId: req.userId }, select: { id: true } });
    for (const trip of trips) {
      const stops = await prisma.tripStop.findMany({ where: { tripId: trip.id }, select: { id: true } });
      const stopIds = stops.map(s => s.id);
      if (stopIds.length > 0) {
        await prisma.activity.deleteMany({ where: { tripStopId: { in: stopIds } } });
      }
      await prisma.tripStop.deleteMany({ where: { tripId: trip.id } });
      await prisma.packItem.deleteMany({ where: { tripId: trip.id } });
    }
    
    await prisma.trip.deleteMany({ where: { userId: req.userId } });
    await prisma.savedDestination.deleteMany({ where: { userId: req.userId } });
    await prisma.note.deleteMany({ where: { userId: req.userId } });
    
    await prisma.user.delete({ where: { id: req.userId } });
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

// --- SAVED DESTINATIONS ---

// Add saved destination
router.post('/saved', authenticate, async (req, res) => {
  try {
    const { name, country, image, notes, sourceSlug } = req.body;
    const saved = await prisma.savedDestination.create({
      data: {
        userId: req.userId,
        name,
        country,
        image,
        notes,
        sourceSlug
      }
    });
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error saving destination' });
  }
});

// Remove saved destination
router.delete('/saved/:id', authenticate, async (req, res) => {
  try {
    const saved = await prisma.savedDestination.findUnique({ where: { id: req.params.id } });
    if (!saved || saved.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    
    await prisma.savedDestination.delete({ where: { id: req.params.id } });
    res.json({ message: 'Destination removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing destination' });
  }
});

module.exports = router;
