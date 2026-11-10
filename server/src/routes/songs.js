import { Router } from 'express';
import mongoose from 'mongoose';
import Song from '../models/Song.js';
import User from '../models/User.js';
import { optionalAuth, asyncHandler, httpError } from '../middleware/auth.js';
import { similarTo, byMood } from '../utils/recommend.js';

const router = Router();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const clamp01 = (n) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0.5));

// GET /api/songs?q=&genre=&page=&limit=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q = '', genre } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const filter = {};
    if (q.trim()) {
      const rx = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [{ title: rx }, { artist: rx }, { album: rx }];
    }
    if (genre) filter.genre = genre;
    const [items, total] = await Promise.all([
      Song.find(filter).sort({ plays: -1, title: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Song.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  })
);

router.get('/trending', asyncHandler(async (_req, res) => {
  res.json({ items: await Song.find().sort({ plays: -1 }).limit(10).lean() });
}));

router.get('/genres', asyncHandler(async (_req, res) => {
  res.json({ items: (await Song.distinct('genre')).sort() });
}));

// GET /api/songs/mood?energy=0.8&valence=0.3  -> songs nearest to that mood
router.get(
  '/mood',
  asyncHandler(async (req, res) => {
    const energy = clamp01(parseFloat(req.query.energy));
    const valence = clamp01(parseFloat(req.query.valence));
    const songs = await Song.find().lean();
    res.json({ items: byMood(songs, energy, valence, 8) });
  })
);

router.get(
  '/:id/similar',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Invalid song id.');
    const target = await Song.findById(req.params.id).lean();
    if (!target) throw httpError(404, 'Song not found.');
    const songs = await Song.find().lean();
    res.json({ items: similarTo(target, songs, 8) });
  })
);

// Counts a play and (if logged in) records it in listening history.
router.post(
  '/:id/play',
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Invalid song id.');
    const song = await Song.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } }, { new: true });
    if (!song) throw httpError(404, 'Song not found.');
    if (req.userId) {
      await User.updateOne({ _id: req.userId }, { $pull: { recentlyPlayed: { song: song._id } } });
      await User.updateOne(
        { _id: req.userId },
        { $push: { recentlyPlayed: { $each: [{ song: song._id }], $slice: -20 } } }
      );
    }
    res.json({ plays: song.plays });
  })
);

export default router;
