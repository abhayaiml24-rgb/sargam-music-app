import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Player from './components/Player.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Liked from './pages/Liked.jsx';
import Playlist from './pages/Playlist.jsx';
import Login from './pages/Login.jsx';
import { useLibrary } from './context/LibraryContext.jsx';

export default function App() {
  const { toast } = useLibrary();
  return (
    <div className="app">
      <Sidebar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/liked" element={<Liked />} />
          <Route path="/playlist/:id" element={<Playlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<p className="empty">That page doesn't exist.</p>} />
        </Routes>
      </main>
      <Player />
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
