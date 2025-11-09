import React, { useEffect, useMemo, useRef, useState } from 'react';
import { streamUrl } from './api';

export default function Player({ tracks, index, onPrev, onNext }) {
  if (!tracks || tracks.length === 0) return null;

  const t = tracks[index];
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(() => Number(localStorage.getItem('vol') || '0.8'));
  const [fav, setFav] = useState(() => new Set(JSON.parse(localStorage.getItem('fav') || '[]')));
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const src = useMemo(() => streamUrl(t.id), [t.id]);

  useEffect(() => { const a = audioRef.current; if (a) a.volume = vol; }, [vol]);
  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    playing ? a.play() : a.pause();
  }, [playing, src]);

  function toggleFav() {
    const next = new Set(fav);
    next.has(t.id) ? next.delete(t.id) : next.add(t.id);
    setFav(next);
    localStorage.setItem('fav', JSON.stringify([...next]));
  }
  function seek(e) { const a = audioRef.current; const v = Number(e.target.value); a.currentTime = v; setTime(v); }
  function onEnded() {
    if (repeat) { const a = audioRef.current; a.currentTime = 0; a.play(); return; }
    if (shuffle) { const r = Math.floor(Math.random() * tracks.length); window.dispatchEvent(new CustomEvent('setIndex', { detail: r })); }
    else onNext();
  }

  useEffect(() => {
    function handler(e) { if (typeof e.detail === 'number') { /* hook */ } }
    window.addEventListener('setIndex', handler);
    return () => window.removeEventListener('setIndex', handler);
  }, []);

  return (
    <div className="player">
      <div className="row">
        <button className="btn" onClick={onPrev}>⏮️</button>
        <button className="btn btn-primary" onClick={() => setPlaying(p => !p)} style={{fontSize:18}}>
          {playing ? '⏸️' : '▶️'}
        </button>
        <button className="btn" onClick={onNext}>⏭️</button>

        <div className="titlebox">
          <div className="t1">{t.title}</div>
          <div className="t2">{t.artist}{t.album ? ' • ' + t.album : ''}</div>
        </div>

        <button className="btn" onClick={toggleFav} title="favorite">{fav.has(t.id) ? '💚' : '🤍'}</button>
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={e => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={e => setDur(e.currentTarget.duration || 0)}
        onEnded={onEnded}
        preload="metadata"
      />

      <div className="row">
        <span className="time">{fmt(time)}</span>
        <input className="range" type="range" min={0} max={dur || 0} step={1} value={time} onChange={seek} />
        <span className="time">{fmt(dur)}</span>
      </div>

      <div className="controls">
        <label style={{display:'flex',gap:8,alignItems:'center'}}>
          🔊
          <input className="range" type="range" min={0} max={1} step={0.01} value={vol}
            onChange={e => { const v = Number(e.target.value); setVol(v); localStorage.setItem('vol', String(v)); }} />
        </label>
        <button className="btn" onClick={() => setShuffle(s => !s)} title="shuffle">{shuffle ? '🔀 on' : '🔀 off'}</button>
        <button className="btn" onClick={() => setRepeat(r => !r)} title="repeat">{repeat ? '🔁 on' : '🔁 off'}</button>
        <a className="btn" href={src} download>⬇️ Download</a>
      </div>
    </div>
  );
}

function fmt(s) {
  s = Math.floor(s || 0); const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}
