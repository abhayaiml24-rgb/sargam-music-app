import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    recentlyPlayed: [
      {
        song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
