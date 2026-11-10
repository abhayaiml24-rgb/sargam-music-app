import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import SongList, { LoginPrompt } from '../components/SongList.jsx';

export default function Playlist() {
  const { id } = useParams();
  const { user } = useAuth();
  const { refresh, notify } = useLibrary();
  const { play } = usePlayer();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!user) return;
    setPlaylist(null);
    api.get(`/playlists/${id}`)
      .then((p) => {
        setPlaylist(p);
        setName(p.name);
        setError('');
      })
      .catch((e) => setError(e.message));
  }, [id, user]);

  if (!user) return <LoginPrompt what="your playlists" />;
  if (error) return <p className="empty">{error}</p>;
  if (!playlist) return <p className="empty">Loading…</p>;

  const rename = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/playlists/${id}`, { name });
      setPlaylist({ ...playlist, name });
      setRenaming(false);
      refresh();
    } catch (err) {
      notify(err.message);
    }
  };

  const remove = async (song) => {
    await api.del(`/playlists/${id}/songs/${song._id}`);
    setPlaylist({ ...playlist, songs: playlist.songs.filter((s) => s._id !== song._id) });
    refresh();
  };

  const destroy = async () => {
    if (!window.confirm(`Delete "${playlist.name}"? This can't be undone.`)) return;
    await api.del(`/playlists/${id}`);
    await refresh();
    navigate('/');
  };

  return (
    <>
      {renaming ? (
        <form onSubmit={rename} className="inline-form big">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} aria-label="Playlist name" />
          <button className="btn" type="submit">Save name</button>
        </form>
      ) : (
        <h1 className="page-title">{playlist.name}</h1>
      )}
      <div className="row-actions">
        <button className="btn" disabled={!playlist.songs.length} onClick={() => play(playlist.songs[0], playlist.songs)}>Play all</button>
        <button className="text-btn" onClick={() => setRenaming(!renaming)}>Rename</button>
        <button className="text-btn danger" onClick={destroy}>Delete playlist</button>
      </div>
      {playlist.songs.length ? (
        <SongList songs={playlist.songs} onRemove={remove} />
      ) : (
        <p className="empty">This playlist is empty. Use the + button on any song to add it here.</p>
      )}
    </>
  );
}
