// Generated cover art: no image files needed, and it works for any song you add later.
export default function Cover({ song, size = 44 }) {
  const h = song?.hue ?? 300;
  return (
    <div
      className="cover"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${h} 72% 58%), hsl(${(h + 55) % 360} 62% 28%))`,
      }}
      aria-hidden="true"
    >
      {(song?.title || '?').slice(0, 1)}
    </div>
  );
}
