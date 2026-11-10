import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { usePlayer } from '../context/PlayerContext.jsx';
import SongList from './SongList.jsx';

const clamp = (n) => Math.min(1, Math.max(0, n));

// x axis = valence (sad -> happy), y axis = energy (calm -> intense)
function moodName({ x, y }) {
  if (Math.abs(x - 0.5) < 0.15 && Math.abs(y - 0.5) < 0.15) return 'Balanced';
  if (y >= 0.5) return x >= 0.5 ? 'Euphoric' : 'Intense';
  return x >= 0.5 ? 'Easygoing' : 'Somber';
}

export default function MoodPad() {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState('');
  const pad = useRef(null);
  const dragging = useRef(false);
  const { play } = usePlayer();

  const move = (e) => {
    const r = pad.current.getBoundingClientRect();
    setPos({ x: clamp((e.clientX - r.left) / r.width), y: clamp(1 - (e.clientY - r.top) / r.height) });
  };

  const onKey = (e) => {
    const step = 0.05;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (!d) return;
    e.preventDefault();
    setPos((p) => ({ x: clamp(p.x + d[0]), y: clamp(p.y + d[1]) }));
  };

  useEffect(() => {
    const t = setTimeout(() => {
      api.get(`/songs/mood?energy=${pos.y.toFixed(2)}&valence=${pos.x.toFixed(2)}`)
        .then((d) => {
          setSongs(d.items);
          setError('');
        })
        .catch((e) => setError(e.message));
    }, 150);
    return () => clearTimeout(t);
  }, [pos]);

  return (
    <section className="mood">
      <div
        ref={pad}
        className="pad"
        tabIndex={0}
        role="application"
        aria-label="Mood pad. Use arrow keys to move between calm and intense, and somber and happy."
        onKeyDown={onKey}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e);
        }}
        onPointerMove={(e) => dragging.current && move(e)}
        onPointerUp={() => (dragging.current = false)}
      >
        <span className="corner tl">Intense</span>
        <span className="corner tr">Euphoric</span>
        <span className="corner bl">Somber</span>
        <span className="corner br">Easygoing</span>
        <span className="dot" style={{ left: `${pos.x * 100}%`, top: `${(1 - pos.y) * 100}%` }} />
      </div>

      <div className="mood-results">
        <h2 className="mood-name">{moodName(pos)}</h2>
        <p className="mood-hint">Drag the dot to match your mood. Songs are ranked by how close their energy and positivity are to it.</p>
        {error ? <p className="empty">{error}</p> : <SongList songs={songs.slice(0, 5)} />}
        <button className="btn" onClick={() => songs.length && play(songs[0], songs)} disabled={!songs.length}>
          Play this mood
        </button>
      </div>
    </section>
  );
}
