import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Song from '../models/Song.js';
import { auth, asyncHandler, httpError } from '../middleware/auth.js';
import { forUser } from '../utils/recommend.js';

const router = Router();
router.use(auth);

router.get('/liked', asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).populate({ path: 'likedSongs', options: { lean: true } });
  res.json({ items: user?.likedSongs ?? [] });
}));

router.put('/liked/:songId', asyncHandler(async (req, res) => {
  const { songId } = req.params;
  if (!mongoose.isValidObjectId(songId) || !(await Song.exists({ _id: songId }))) throw httpError(404, 'Song not found.');
  const user = await User.findById(req.userId);
  const liked = !user.likedSongs.some((id) => String(id) === songId);
  await User.updateOne({ _id: req.userId }, liked ? { $addToSet: { likedSongs: songId } } : { $pull: { likedSongs: songId } });
  res.json({ liked });
}));

router.get('/recent', asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).populate({ path: 'recentlyPlayed.song', options: { lean: true } });
  const items = (user?.recentlyPlayed ?? []).map((r) => r.song).filter(Boolean).reverse();
  res.json({ items });
}));

// Recommendations from the average "taste vector" of liked + recently played songs.
router.get('/for-you', asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId)
    .populate({ path: 'likedSongs', options: { lean: true } })
    .populate({ path: 'recentlyPlayed.song', options: { lean: true } });
  const history = [...(user?.likedSongs ?? []), ...(user?.recentlyPlayed ?? []).map((r) => r.song).filter(Boolean)];
  const unique = [...new Map(history.map((s) => [String(s._id), s])).values()];
  const all = await Song.find().lean();
  res.json({ items: forUser(unique, all, 10) });
}));

export default router;
