import { useState } from 'react';
import { Link } from 'react-router-dom';
import Cover from './Cover.jsx';
import { Heart, Plus } from './Icons.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function SongList({ songs, onRemove }) {
  const { play, current, playing } = usePlayer();
  const { likedIds, toggleLike, playlists, addToPlaylist, notify } = useLibrary();
  const { user } = useAuth();
  const [menuFor, setMenuFor] = useState(null);

  const guard = (fn) => async (...args) => {
    try {
      await fn(...args);
    } catch (e) {
      notify(e.message);
    }
  };

  if (!songs.length) return <p className="empty">Nothing here yet.</p>;

  return (
    <ul className="songs">
      {songs.map((song) => {
        const active = current?._id === song._id;
        return (
          <li key={song._id} className={`song ${active ? 'active' : ''}`} onClick={() => play(song, songs)}>
            <Cover song={song} />
            <div className="song-text">
              <span className="song-title">{song.title}</span>
              <span className="song-artist">
                {song.artist}
                {active && playing ? ' • Playing' : ''}
              </span>
            </div>
            <span className="song-album">{song.album}</span>
            {song.match != null && <span className="match" title="How close this song's audio features are">{song.match}% match</span>}
            <div className="song-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className={`icon-btn ${likedIds.has(song._id) ? 'liked' : ''}`}
                aria-label={likedIds.has(song._id) ? `Unlike ${song.title}` : `Like ${song.title}`}
                onClick={guard(() => toggleLike(song))}
              >
                <Heart filled={likedIds.has(song._id)} />
              </button>
              <div className="menu-wrap">
                <button
                  className="icon-btn"
                  aria-label={`Add ${song.title} to a playlist`}
                  onClick={() => (user ? setMenuFor(menuFor === song._id ? null : song._id) : notify('Log in to use playlists.'))}
                >
                  <Plus />
                </button>
                {menuFor === song._id && (
                  <div className="menu" role="menu">
                    {playlists.length === 0 && <span className="menu-empty">Create a playlist in the sidebar first.</span>}
                    {playlists.map((p) => (
                      <button
                        key={p._id}
                        role="menuitem"
                        onClick={guard(async () => {
                          await addToPlaylist(p, song);
                          setMenuFor(null);
                        })}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {onRemove && (
                <button className="text-btn" onClick={() => onRemove(song)}>
                  Remove
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export const LoginPrompt = ({ what }) => (
  <p className="empty">
    <Link to="/login">Log in</Link> to see {what}.
  </p>
);
