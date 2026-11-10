import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Song from './models/Song.js';
import User from './models/User.js';
import Playlist from './models/Playlist.js';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Placeholder catalogue: swap titles, artists and audioUrl for your own tracks any time.
// Audio: SoundHelix demo tracks (free to use). features = [energy, valence, danceability, acousticness, tempo]
const audio = (n) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;
const rows = [
  ['Monsoon Static', 'Neon Kaveri', 'Rain Index', 'Electronic', 285, [0.72, 0.45, 0.68, 0.10, 0.62]],
  ['Silk Board at 2AM', 'Late Metro', 'Rain Index', 'Lo-fi', 250, [0.30, 0.38, 0.55, 0.35, 0.40]],
  ['Nandi Hills Sunrise', 'Aarav & The Fog', 'First Light', 'Ambient', 40, [0.22, 0.72, 0.25, 0.80, 0.25]],
  ['Filter Coffee Fuel', 'The Dosa Collective', 'Morning Rush', 'Pop', 20, [0.78, 0.90, 0.82, 0.15, 0.70]],
  ['Cubbon Park Loop', 'Mira Sen', 'Green Hours', 'Jazz', 160, [0.40, 0.68, 0.50, 0.70, 0.45]],
  ['Overclocked', 'Kernel Panic', 'Segfault', 'Electronic', 330, [0.95, 0.40, 0.75, 0.04, 0.90]],
  ['Whitefield Traffic', 'Late Metro', 'Rain Index', 'Rock', 5, [0.85, 0.30, 0.55, 0.08, 0.78]],
  ['Lalbagh Glasshouse', 'Mira Sen', 'Green Hours', 'Ambient', 130, [0.18, 0.60, 0.20, 0.88, 0.20]],
  ['Indiranagar Nights', 'Neon Kaveri', 'Rain Index', 'Pop', 210, [0.74, 0.78, 0.86, 0.12, 0.66]],
  ['Last Bus Home', 'Aarav & The Fog', 'First Light', 'Lo-fi', 270, [0.28, 0.25, 0.42, 0.55, 0.35]],
  ['Gradient Descent', 'Kernel Panic', 'Segfault', 'Electronic', 310, [0.82, 0.55, 0.72, 0.06, 0.82]],
  ['Chai Break', 'The Dosa Collective', 'Morning Rush', 'Jazz', 180, [0.45, 0.82, 0.60, 0.65, 0.50]],
  ['Vinyl Static', 'Mira Sen', 'Green Hours', 'Lo-fi', 340, [0.25, 0.50, 0.45, 0.60, 0.30]],
  ['Stadium Lights', 'Kernel Panic', 'Segfault', 'Rock', 15, [0.92, 0.70, 0.62, 0.05, 0.85]],
  ['Slow Boat to Ulsoor', 'Aarav & The Fog', 'First Light', 'Ambient', 60, [0.15, 0.42, 0.18, 0.85, 0.15]],
  ['Sunday Sambar', 'The Dosa Collective', 'Morning Rush', 'Pop', 100, [0.62, 0.88, 0.74, 0.30, 0.58]],
];

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([Song.deleteMany({}), Playlist.deleteMany({}), User.deleteOne({ email: 'demo@sargam.dev' })]);

const songs = await Song.insertMany(
  rows.map(([title, artist, album, genre, hue, f], i) => ({
    title, artist, album, genre, hue,
    audioUrl: audio(i + 1),
    plays: Math.floor(Math.random() * 500),
    features: { energy: f[0], valence: f[1], danceability: f[2], acousticness: f[3], tempo: f[4] },
  }))
);

const demo = await User.create({
  name: 'Demo Listener',
  email: 'demo@sargam.dev',
  passwordHash: await bcrypt.hash('demo1234', 10),
  likedSongs: [songs[0]._id, songs[8]._id, songs[10]._id],
});
await Playlist.create({ name: 'Late night coding', owner: demo._id, songs: [songs[1], songs[9], songs[12], songs[2]].map((s) => s._id) });

console.log(`Seeded ${songs.length} songs. Demo login: demo@sargam.dev / demo1234`);
await mongoose.disconnect();
