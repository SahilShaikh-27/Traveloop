const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

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

// GET all notes for user, grouped by trip
router.get('/', authenticate, async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.userId },
      include: {
        trip: {
          select: { 
            title: true, 
            id: true,
            stops: { select: { id: true, cityName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// CREATE a note
router.post('/', authenticate, async (req, res) => {
  try {
    const { content, tripId, stopId } = req.body;
    const note = await prisma.note.create({
      data: {
        userId: req.userId,
        tripId: tripId || null,
        tripStopId: stopId || null,
        content
      },
      include: {
        trip: {
          select: { 
            title: true, 
            id: true,
            stops: { select: { id: true, cityName: true } }
          }
        }
      }
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error creating note' });
  }
});

// UPDATE a note
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note || note.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.note.update({
      where: { id: req.params.id },
      data: { content }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating note' });
  }
});

// DELETE a note
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note || note.userId !== req.userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

module.exports = router;
