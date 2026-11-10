import mongoose from 'mongoose';

const unit = { type: Number, min: 0, max: 1, required: true };

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    album: { type: String, default: 'Single', trim: true },
    genre: { type: String, default: 'Other', index: true },
    audioUrl: { type: String, required: true },
    hue: { type: Number, default: 300 }, // drives the generated cover art
    plays: { type: Number, default: 0, index: true },
    // Audio feature vector (all normalised to 0..1). Powers the recommender.
    features: {
      energy: unit,
      valence: unit,
      danceability: unit,
      acousticness: unit,
      tempo: unit,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Song', songSchema);
