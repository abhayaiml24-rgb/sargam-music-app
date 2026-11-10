import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../api.js';

const PlayerContext = createContext(null);
export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children }) {
  const audio = useRef(null);
  if (!audio.current) audio.current = new Audio();

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // off | all | one
  const [error, setError] = useState('');

  const current = queue[index] ?? null;
  const latest = useRef({});
  latest.current = { queue, index, shuffle, repeat };

  const go = useCallback((i) => setIndex(i), []);

  const next = useCallback(() => {
    const { queue, index, shuffle, repeat } = latest.current;
    if (!queue.length) return;
    if (shuffle && queue.length > 1) {
      let r;
      do r = Math.floor(Math.random() * queue.length);
      while (r === index);
      return go(r);
    }
    if (index + 1 < queue.length) return go(index + 1);
    if (repeat === 'all') return go(0);
    audio.current.pause();
  }, [go]);

  const prev = useCallback(() => {
    if (audio.current.currentTime > 3) {
      audio.current.currentTime = 0;
      return;
    }
    const { queue, index } = latest.current;
    if (index > 0) go(index - 1);
    else if (queue.length) go(0);
  }, [go]);

  const toggle = useCallback(() => {
    const a = audio.current;
    if (!a.src) return;
    a.paused ? a.play().catch(() => {}) : a.pause();
  }, []);

  // Play `song` inside the list it was clicked from, so next/prev follow that list.
  const play = useCallback((song, list = [song]) => {
    const { queue, index } = latest.current;
    if (queue[index]?._id === song._id) return toggle();
    setQueue(list);
    setIndex(Math.max(0, list.findIndex((s) => s._id === song._id)));
  }, [toggle]);

  const seek = (t) => {
    audio.current.currentTime = t;
    setTime(t);
  };

  // Wire up the <audio> element (listeners are removed on cleanup so React StrictMode can't double-fire "ended").
  useEffect(() => {
    const a = audio.current;
    const handlers = {
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      timeupdate: () => setTime(a.currentTime),
      loadedmetadata: () => setDuration(a.duration || 0),
      error: () => setError('This track could not be loaded.'),
      ended: () => {
        if (latest.current.repeat === 'one') {
          a.currentTime = 0;
          a.play();
        } else next();
      },
    };
    Object.entries(handlers).forEach(([e, fn]) => a.addEventListener(e, fn));
    return () => Object.entries(handlers).forEach(([e, fn]) => a.removeEventListener(e, fn));
  }, [next]);

  useEffect(() => {
    audio.current.volume = volume;
  }, [volume]);

  // Load and play whenever the current song changes.
  useEffect(() => {
    if (!current) return;
    const a = audio.current;
    setError('');
    setTime(0);
    a.src = current.audioUrl;
    a.play().catch(() => {});
    api.post(`/songs/${current._id}/play`).catch(() => {});

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: current.title, artist: current.artist, album: current.album });
      navigator.mediaSession.setActionHandler('play', toggle);
      navigator.mediaSession.setActionHandler('pause', toggle);
      navigator.mediaSession.setActionHandler('nexttrack', next);
      navigator.mediaSession.setActionHandler('previoustrack', prev);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?._id]);

  // Keyboard: Space = play/pause, Shift+Right/Left = next/previous.
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      } else if (e.shiftKey && e.code === 'ArrowRight') next();
      else if (e.shiftKey && e.code === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, next, prev]);

  const cycleRepeat = () => setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));

  return (
    <PlayerContext.Provider
      value={{ current, playing, time, duration, volume, shuffle, repeat, error, play, toggle, next, prev, seek, setVolume, setShuffle, cycleRepeat }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
