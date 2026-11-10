import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import MoodPad from '../components/MoodPad.jsx';
import SongList from '../components/SongList.jsx';

function Section({ title, note, songs }) {
  if (!songs.length) return null;
  return (
    <section className="block">
      <h2>{title}</h2>
      {note && <p className="note">{note}</p>}
      <SongList songs={songs} />
    </section>
  );
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function Home() {
  const { user } = useAuth();
  const { current } = usePlayer();
  const [trending, setTrending] = useState([]);
  const [all, setAll] = useState([]);
  const [forYou, setForYou] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/songs/trending'), api.get('/songs?limit=50')])
      .then(([t, a]) => {
        setTrending(t.items);
        setAll(a.items);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!user) return setForYou([]);
    api.get('/me/for-you').then((d) => setForYou(d.items)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!current) return setSimilar([]);
    api.get(`/songs/${current._id}/similar`).then((d) => setSimilar(d.items)).catch(() => {});
  }, [current?._id]);

  return (
    <>
      <header className="hero">
        <p className="greet">{user ? `${greeting()}, ${user.name.split(' ')[0]}` : greeting()}</p>
        <h1>What does today sound like?</h1>
      </header>

      <MoodPad />

      {error && <p className="empty">{error} Is the API running?</p>}
      {current && <Section title={`More like ${current.title}`} note="Songs with the closest audio features to what's playing." songs={similar.slice(0, 5)} />}
      {user && <Section title="Made for you" note="Based on the average sound of your liked and recent songs." songs={forYou.slice(0, 5)} />}
      <Section title="Trending" songs={trending.slice(0, 5)} />
      <Section title="All songs" songs={all} />
    </>
  );
}
