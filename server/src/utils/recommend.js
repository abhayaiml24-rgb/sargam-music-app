/**
 * Content-based recommendations.
 * Every song is a point in a 5-D feature space (energy, valence, danceability,
 * acousticness, tempo). Closer points sound more alike. Similarity is
 * 1 - (euclidean distance / max possible distance), shown to users as "match %".
 */
const KEYS = ['energy', 'valence', 'danceability', 'acousticness', 'tempo'];
const MAX_DIST = Math.sqrt(KEYS.length);

export const vectorOf = (song) => KEYS.map((k) => song.features[k]);

const distance = (a, b) => Math.sqrt(a.reduce((sum, x, i) => sum + (x - b[i]) ** 2, 0));
const toMatch = (dist, max) => Math.max(0, Math.round((1 - dist / max) * 100));

export function similarTo(target, songs, k = 8) {
  const t = vectorOf(target);
  return songs
    .filter((s) => String(s._id) !== String(target._id))
    .map((s) => ({ ...s, match: toMatch(distance(t, vectorOf(s)), MAX_DIST) }))
    .sort((a, b) => b.match - a.match)
    .slice(0, k);
}

// Mood pad: only energy (y) and valence (x) matter, so distance is 2-D.
export function byMood(songs, energy, valence, k = 8) {
  const max = Math.SQRT2;
  return songs
    .map((s) => ({
      ...s,
      match: toMatch(distance([energy, valence], [s.features.energy, s.features.valence]), max),
    }))
    .sort((a, b) => b.match - a.match)
    .slice(0, k);
}

// Taste profile = average of the vectors of songs the user liked / played.
export function forUser(historySongs, allSongs, k = 10) {
  if (!historySongs.length) return [];
  const taste = new Array(KEYS.length).fill(0);
  historySongs.forEach((s) => vectorOf(s).forEach((x, i) => (taste[i] += x / historySongs.length)));
  const seen = new Set(historySongs.map((s) => String(s._id)));
  return allSongs
    .filter((s) => !seen.has(String(s._id)))
    .map((s) => ({ ...s, match: toMatch(distance(taste, vectorOf(s)), MAX_DIST) }))
    .sort((a, b) => b.match - a.match)
    .slice(0, k);
}
