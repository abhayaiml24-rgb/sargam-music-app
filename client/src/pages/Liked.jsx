import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import SongList, { LoginPrompt } from '../components/SongList.jsx';

export default function Liked() {
  const { user } = useAuth();
  const { likedIds } = useLibrary();
  const { play } = usePlayer();
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    if (user) api.get('/me/liked').then((d) => setSongs(d.items)).catch(() => {});
  }, [user]);

  // Keep the list in step when a song is unliked from this page.
  const visible = songs.filter((s) => likedIds.has(s._id));

  return (
    <>
      <h1 className="page-title">Liked songs</h1>
      {!user ? (
        <LoginPrompt what="your liked songs" />
      ) : (
        <>
          <button className="btn" disabled={!visible.length} onClick={() => play(visible[0], visible)}>Play all</button>
          {visible.length ? <SongList songs={visible} /> : <p className="empty">Tap the heart on any song and it will show up here.</p>}
        </>
      )}
    </>
  );
}
