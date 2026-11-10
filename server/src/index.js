import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import songRoutes from './routes/songs.js';
import meRoutes from './routes/me.js';
import playlistRoutes from './routes/playlists.js';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

for (const key of ['MONGO_URI', 'JWT_SECRET']) {
  if (!process.env[key]) {
    console.error(`Missing ${key}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/me', meRoutes);
app.use('/api/playlists', playlistRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong on our side.' });
});

const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`)))
  .catch((e) => {
    console.error('MongoDB connection failed:', e.message);
    process.exit(1);
  });
