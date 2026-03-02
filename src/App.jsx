// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Header from './components/Header.jsx';
import ClassicMode from './pages/ClassicMode.jsx';
import NewCreative from './pages/NewCreative.jsx';
import YouTubeImport from './pages/YouTubeImport.jsx';
import Library from './pages/Library.jsx';

const TABS = [
  { key: 'classic', label: '⚡ Классический', desc: 'Быстрая уникализация' },
  { key: 'new', label: '🚀 Новый Креатив', desc: 'PRO генерация' },
  { key: 'youtube', label: '▶ YouTube Импорт', desc: 'Импорт и Shorts' },
  { key: 'library', label: '📁 Библиотека', desc: 'Все крео' },
];

export default function App() {
  const [tab, setTab] = useState('new');

  return (
    <div style={{ minHeight: '100vh', background: '#050510' }}>
      <Header />

      {/* Tab Navigation */}
      <div style={{
        background: '#06060f',
        borderBottom: '1px solid #1e1e3a',
        padding: '0 20px',
        display: 'flex',
        gap: 0,
        overflowX: 'auto',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '13px 20px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.key ? '2px solid #a855f7' : '2px solid transparent',
              color: tab === t.key ? '#a855f7' : '#555',
              fontWeight: tab === t.key ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              transition: 'color 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '22px 16px 60px' }}>
        {tab === 'classic' && <ClassicMode />}
        {tab === 'new' && <NewCreative />}
        {tab === 'youtube' && <YouTubeImport />}
        {tab === 'library' && <Library />}
      </main>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '0 0 24px', fontSize: 10, color: '#222', letterSpacing: 0.5 }}>
        Uniqualizer Pro · Из одного сырого ролика — пачка боевых креативов под TikTok, Reels и Shorts
      </div>
    </div>
  );
}
