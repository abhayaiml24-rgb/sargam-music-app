import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth, asyncHandler, httpError } from '../middleware/auth.js';

const router = Router();
const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name?.trim()) throw httpError(400, 'Enter your name.');
    if (!EMAIL.test(email || '')) throw httpError(400, 'Enter a valid email address.');
    if (!password || password.length < 8) throw httpError(400, 'Password must be at least 8 characters.');
    if (await User.exists({ email: email.toLowerCase() })) throw httpError(409, 'That email is already registered.');

    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
      throw httpError(401, 'Email or password is incorrect.');
    }
    res.json({ token: sign(user), user: publicUser(user) });
  })
);

router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) throw httpError(401, 'Account not found.');
    res.json({ user: publicUser(user) });
  })
);

export default router;
