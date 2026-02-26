import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const HAMSTER_MOODS = [
  { emoji: '🐹', name: 'Pensive Gerald', color: '#f59e42' },
  { emoji: '😤', name: 'Furious Gerald', color: '#ef4444' },
  { emoji: '🥱', name: 'Sleepy Gerald', color: '#8b5cf6' },
  { emoji: '🤔', name: 'Philosophical Gerald', color: '#3b82f6' },
  { emoji: '😤', name: 'Sweating Gerald', color: '#10b981' },
  { emoji: '👑', name: 'Royal Gerald', color: '#f59e0b' },
];

function WheelSpinner({ spinning }) {
  return (
    <div className={`wheel-container ${spinning ? 'spinning' : ''}`}>
      <div className="wheel">
        <div className="wheel-inner">
          {spinning ? '🌀' : '🐹'}
        </div>
      </div>
    </div>
  );
}

function WisdomCard({ wisdom, mood }) {
  return (
    <div className="wisdom-card" style={{ '--accent': mood.color }}>
      <div className="wisdom-emoji">{mood.emoji}</div>
      <blockquote className="wisdom-text">"{wisdom.wisdom}"</blockquote>
      <div className="wisdom-author">— {wisdom.author || 'Gerald'}</div>
    </div>
  );
}

function SubmitForm({ onSubmit, submitting }) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const ok = await onSubmit(text, author || 'Anonymous Hamster');
    if (ok) {
      setSubmitted(true);
      setText('');
      setAuthor('');
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <form className="submit-form" onSubmit={handle}>
      <h3>📝 Share Your Own Wisdom</h3>
      <p className="form-subtitle">Gerald is always looking for new material. He may or may not cite you.</p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="E.g. 'Never trust a man who doesn't offer you a sunflower seed.'"
        maxLength={280}
        rows={3}
        disabled={submitting || submitted}
      />
      <div className="char-count">{text.length}/280</div>
      <input
        value={author}
        onChange={e => setAuthor(e.target.value)}
        placeholder="Your name (or hamster alias)"
        maxLength={50}
        disabled={submitting || submitted}
      />
      <button type="submit" disabled={submitting || submitted || !text.trim()}>
        {submitted ? '✅ Gerald received it!' : submitting ? '🐹 Gerald is reading...' : '📤 Submit to Gerald'}
      </button>
    </form>
  );
}

function AllWisdoms({ wisdoms }) {
  if (!wisdoms.length) return null;
  return (
    <div className="all-wisdoms">
      <h3>📜 The Full Scrolls of Gerald</h3>
      <div className="wisdom-list">
        {wisdoms.map((w, i) => (
          <div key={w.id || i} className="wisdom-list-item">
            <span className="wisdom-list-emoji">🐾</span>
            <div>
              <div className="wisdom-list-text">"{w.wisdom}"</div>
              <div className="wisdom-list-author">— {w.author}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [wisdom, setWisdom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mood, setMood] = useState(HAMSTER_MOODS[0]);
  const [count, setCount] = useState(null);
  const [allWisdoms, setAllWisdoms] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const fetchWisdom = useCallback(async () => {
    setLoading(true);
    setSpinning(true);
    setError(null);
    const newMood = HAMSTER_MOODS[Math.floor(Math.random() * HAMSTER_MOODS.length)];
    setMood(newMood);
    try {
      const resp = await fetch(`${API}/wisdom/random`);
      if (!resp.ok) throw new Error('Gerald is unavailable');
      const data = await resp.json();
      setTimeout(() => {
        setWisdom(data);
        setSpinning(false);
        setLoading(false);
      }, 800);
    } catch (e) {
      setError("Gerald's wheel has jammed. He's embarrassed.");
      setSpinning(false);
      setLoading(false);
    }
  }, []);

  const fetchCount = useCallback(async () => {
    try {
      const resp = await fetch(`${API}/wisdom/count`);
      const data = await resp.json();
      setCount(data.count);
    } catch (_) {}
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const resp = await fetch(`${API}/wisdom/all`);
      const data = await resp.json();
      setAllWisdoms(data);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchWisdom();
    fetchCount();
  }, [fetchWisdom, fetchCount]);

  const handleSubmit = async (text, author) => {
    setSubmitting(true);
    try {
      const resp = await fetch(`${API}/wisdom/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wisdom: text, author }),
      });
      if (!resp.ok) throw new Error('submission failed');
      fetchCount();
      if (showAll) fetchAll();
      setSubmitting(false);
      return true;
    } catch (_) {
      setSubmitting(false);
      return false;
    }
  };

  const handleShowAll = () => {
    if (!showAll) fetchAll();
    setShowAll(!showAll);
  };

  return (
    <div className="app" style={{ '--accent': mood.color }}>
      <header className="header">
        <div className="header-top">
          <h1 className="title">Hamster Wisdom</h1>
          <div className="subtitle">Life advice from Gerald, a hamster who has seen things</div>
        </div>
        {count && (
          <div className="stats">
            📚 {count} nuggets of wisdom in the archive
          </div>
        )}
      </header>

      <main className="main">
        <WheelSpinner spinning={spinning} />

        {error && <div className="error">{error}</div>}

        {wisdom && !loading && (
          <WisdomCard wisdom={wisdom} mood={mood} />
        )}

        <button
          className="btn-primary"
          onClick={fetchWisdom}
          disabled={loading}
        >
          {loading ? '🌀 Consulting Gerald...' : '🎲 New Wisdom'}
        </button>

        <div className="divider" />

        <SubmitForm onSubmit={handleSubmit} submitting={submitting} />

        <div className="divider" />

        <button className="btn-secondary" onClick={handleShowAll}>
          {showAll ? '🙈 Hide the Scrolls' : '📜 View All Wisdom'}
        </button>

        {showAll && <AllWisdoms wisdoms={allWisdoms} />}
      </main>

      <footer className="footer">
        <p>Gerald runs on sunflower seeds and existential dread.</p>
        <p>🐹 Hamster Wisdom — est. tonight</p>
      </footer>
    </div>
  );
}
