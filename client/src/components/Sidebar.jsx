import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, Plus } from './Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { playlists, createPlaylist, notify } = useLibrary();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const p = await createPlaylist(name);
      setName('');
      setAdding(false);
      navigate(`/playlist/${p._id}`);
    } catch (err) {
      notify(err.message);
    }
  };

  return (
    <nav className="sidebar" aria-label="Main">
      <Link to="/" className="brand">Sargam</Link>
      <div className="nav-links">
        <NavLink to="/" end><Home /> Home</NavLink>
        <NavLink to="/search"><Search /> Search</NavLink>
        <NavLink to="/liked"><Heart /> Liked songs</NavLink>
      </div>

      <div className="playlists">
        <div className="playlists-head">
          <span>Your playlists</span>
          {user && (
            <button className="icon-btn" aria-label="New playlist" onClick={() => setAdding(!adding)}>
              <Plus />
            </button>
          )}
        </div>
        {adding && (
          <form onSubmit={submit} className="inline-form">
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Playlist name" aria-label="Playlist name" />
            <button className="text-btn" type="submit">Create</button>
          </form>
        )}
        {!user && <p className="side-note">Log in to build playlists.</p>}
        {user && playlists.length === 0 && !adding && <p className="side-note">No playlists yet. Tap + to make one.</p>}
        {playlists.map((p) => (
          <NavLink key={p._id} to={`/playlist/${p._id}`} className="pl-link">
            <span>{p.name}</span>
            <small>{p.count}</small>
          </NavLink>
        ))}
      </div>

      <div className="account">
        {user ? (
          <>
            <span className="who">{user.name}</span>
            <button className="text-btn" onClick={logout}>Log out</button>
          </>
        ) : (
          <Link className="btn" to="/login">Log in</Link>
        )}
      </div>
    </nav>
  );
}
