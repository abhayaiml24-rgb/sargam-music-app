import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import { useAuth } from './AuthContext.jsx';

const LibraryContext = createContext(null);
export const useLibrary = () => useContext(LibraryContext);

// Holds the signed-in user's liked song ids and playlists so every page stays in sync.
export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const [likedIds, setLikedIds] = useState(new Set());
  const [playlists, setPlaylists] = useState([]);
  const [toast, setToast] = useState('');

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  }, []);

  const refresh = useCallback(async () => {
    if (!user) {
      setLikedIds(new Set());
      setPlaylists([]);
      return;
    }
    const [liked, pls] = await Promise.all([api.get('/me/liked'), api.get('/playlists')]);
    setLikedIds(new Set(liked.items.map((s) => s._id)));
    setPlaylists(pls.items);
  }, [user]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const toggleLike = async (song) => {
    if (!user) return notify('Log in to like songs.');
    const { liked } = await api.put(`/me/liked/${song._id}`);
    setLikedIds((prev) => {
      const next = new Set(prev);
      liked ? next.add(song._id) : next.delete(song._id);
      return next;
    });
    notify(liked ? 'Added to Liked Songs' : 'Removed from Liked Songs');
  };

  const createPlaylist = async (name) => {
    const p = await api.post('/playlists', { name });
    setPlaylists((prev) => [p, ...prev]);
    return p;
  };

  const addToPlaylist = async (playlist, song) => {
    await api.post(`/playlists/${playlist._id}/songs`, { songId: song._id });
    setPlaylists((prev) => prev.map((p) => (p._id === playlist._id ? { ...p, count: p.count + 1 } : p)));
    notify(`Added to ${playlist.name}`);
  };

  return (
    <LibraryContext.Provider value={{ likedIds, playlists, toggleLike, createPlaylist, addToPlaylist, refresh, toast, notify }}>
      {children}
    </LibraryContext.Provider>
  );
}
