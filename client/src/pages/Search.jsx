import { useEffect, useState } from 'react';
import { api } from '../api.js';
import SongList from '../components/SongList.jsx';

export default function Search() {
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/songs/genres').then((d) => setGenres(d.items)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams({ q, limit: '50' });
      if (genre) params.set('genre', genre);
      api.get(`/songs?${params}`)
        .then((d) => {
          setSongs(d.items);
          setError('');
        })
        .catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [q, genre]);

  return (
    <>
      <h1 className="page-title">Search</h1>
      <input className="search-box" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Songs, artists or albums" aria-label="Search" autoFocus />
      <div className="chips" role="group" aria-label="Filter by genre">
        <button className={`chip ${genre === '' ? 'on' : ''}`} onClick={() => setGenre('')}>All</button>
        {genres.map((g) => (
          <button key={g} className={`chip ${genre === g ? 'on' : ''}`} onClick={() => setGenre(g)}>{g}</button>
        ))}
      </div>
      {error ? <p className="empty">{error}</p> : songs.length ? <SongList songs={songs} /> : <p className="empty">No songs match "{q}". Try a different spelling or genre.</p>}
    </>
  );
}
