import Cover from './Cover.jsx';
import { Play, Pause, Next, Prev, Shuffle, Repeat, Volume, Heart } from './Icons.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';

const fmt = (s) => {
  if (!Number.isFinite(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

export default function Player() {
  const p = usePlayer();
  const { likedIds, toggleLike, notify } = useLibrary();
  const { current } = p;

  return (
    <footer className="player" aria-label="Music player">
      <div className="now">
        {current ? (
          <>
            <Cover song={current} size={52} />
            <div className="song-text">
              <span className="song-title">{current.title}</span>
              <span className="song-artist">{p.error || current.artist}</span>
            </div>
            <button
              className={`icon-btn ${likedIds.has(current._id) ? 'liked' : ''}`}
              aria-label="Like current song"
              onClick={() => toggleLike(current).catch((e) => notify(e.message))}
            >
              <Heart filled={likedIds.has(current._id)} />
            </button>
          </>
        ) : (
          <span className="song-artist">Pick a song to start listening</span>
        )}
      </div>

      <div className="transport">
        <div className="buttons">
          <button className={`icon-btn ${p.shuffle ? 'on' : ''}`} aria-label="Shuffle" aria-pressed={p.shuffle} onClick={() => p.setShuffle(!p.shuffle)}>
            <Shuffle />
          </button>
          <button className="icon-btn" aria-label="Previous" onClick={p.prev}><Prev /></button>
          <button className="play-btn" aria-label={p.playing ? 'Pause' : 'Play'} onClick={p.toggle} disabled={!current}>
            {p.playing ? <Pause /> : <Play />}
          </button>
          <button className="icon-btn" aria-label="Next" onClick={p.next}><Next /></button>
          <button className={`icon-btn ${p.repeat !== 'off' ? 'on' : ''}`} aria-label={`Repeat ${p.repeat}`} onClick={p.cycleRepeat}>
            <Repeat one={p.repeat === 'one'} />
          </button>
        </div>
        <div className="seek">
          <span>{fmt(p.time)}</span>
          <input type="range" min="0" max={p.duration || 0} step="1" value={Math.min(p.time, p.duration || 0)} onChange={(e) => p.seek(+e.target.value)} aria-label="Seek" disabled={!current} />
          <span>{fmt(p.duration)}</span>
        </div>
      </div>

      <div className="volume">
        <Volume />
        <input type="range" min="0" max="1" step="0.01" value={p.volume} onChange={(e) => p.setVolume(+e.target.value)} aria-label="Volume" />
      </div>
    </footer>
  );
}
