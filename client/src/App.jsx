import React, { useEffect, useMemo, useState } from 'react';
import { getTracks } from './api';
import Player from './Player';
import './index.css';

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState(0);

  useEffect(() => { getTracks().then(setTracks); }, []);

  const list = useMemo(() =>
    tracks.filter(t => (t.title + ' ' + t.artist + ' ' + (t.album || ''))
      .toLowerCase().includes(query.toLowerCase())), [tracks, query]);

  return (
    <div className="wrap">
      <div className="header">
        <div className="badge">MUSIC</div>
        <div className="title">My Library</div>
      </div>

      <input
        className="search"
        placeholder="Search title / artist / album"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <ul className="list">
        {list.map((t) => (
          <li key={t.id}
              className="item"
              onClick={() => setCurrent(tracks.findIndex(x => x.id === t.id))}>
            <div>
              <div className="item-title">{t.title}</div>
              <div className="item-sub">{t.artist}{t.album ? ' • ' + t.album : ''}</div>
            </div>
            <div className="item-time">{t.duration ? fmt(t.duration) : ''}</div>
          </li>
        ))}
      </ul>

      {tracks.length > 0 && (
        <Player
          key={tracks[current]?.id}
          tracks={tracks}
          index={current}
          onPrev={() => setCurrent(p => (p - 1 + tracks.length) % tracks.length)}
          onNext={() => setCurrent(p => (p + 1) % tracks.length)}
        />
      )}
    </div>
  );
}

function fmt(s) {
  const m = Math.floor(s / 60); const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}
