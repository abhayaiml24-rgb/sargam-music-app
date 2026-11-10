import { Router } from 'express';
import mongoose from 'mongoose';
import Playlist from '../models/Playlist.js';
import Song from '../models/Song.js';
import { auth, asyncHandler, httpError } from '../middleware/auth.js';

const router = Router();
router.use(auth);

const mine = async (req) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Playlist not found.');
  const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.userId });
  if (!playlist) throw httpError(404, 'Playlist not found.');
  return playlist;
};

router.get('/', asyncHandler(async (req, res) => {
  const items = await Playlist.find({ owner: req.userId }).sort({ updatedAt: -1 }).lean();
  res.json({ items: items.map((p) => ({ ...p, count: p.songs.length })) });
}));

router.post('/', asyncHandler(async (req, res) => {
  const name = (req.body?.name || '').trim();
  if (!name) throw httpError(400, 'Give your playlist a name.');
  const playlist = await Playlist.create({ name, owner: req.userId });
  res.status(201).json({ ...playlist.toObject(), count: 0 });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  await mine(req);
  const playlist = await Playlist.findById(req.params.id).populate({ path: 'songs', options: { lean: true } }).lean();
  res.json(playlist);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const playlist = await mine(req);
  const name = (req.body?.name || '').trim();
  if (!name) throw httpError(400, 'Give your playlist a name.');
  playlist.name = name;
  await playlist.save();
  res.json({ _id: playlist._id, name: playlist.name });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const playlist = await mine(req);
  await playlist.deleteOne();
  res.status(204).end();
}));

router.post('/:id/songs', asyncHandler(async (req, res) => {
  const playlist = await mine(req);
  const { songId } = req.body || {};
  if (!mongoose.isValidObjectId(songId) || !(await Song.exists({ _id: songId }))) throw httpError(404, 'Song not found.');
  await Playlist.updateOne({ _id: playlist._id }, { $addToSet: { songs: songId } });
  res.status(201).json({ ok: true });
}));

router.delete('/:id/songs/:songId', asyncHandler(async (req, res) => {
  const playlist = await mine(req);
  await Playlist.updateOne({ _id: playlist._id }, { $pull: { songs: req.params.songId } });
  res.status(204).end();
}));

export default router;
