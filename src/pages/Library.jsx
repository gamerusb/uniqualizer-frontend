// ─────────────────────────────────────────────────────────────────────────────
// LIBRARY — библиотека сгенерированных креативов
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Card, BanScoreBadge, Badge, Spinner } from '../components/ui.jsx';
import { getCreatives, getOffers, BACKEND_BASE_URL } from '../api.js';

export default function Library() {
  const [creatives, setCreatives] = useState([]);
  const [offers, setOffers] = useState([]);
  const [filterOffer, setFilterOffer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCreatives(), getOffers()])
      .then(([c, o]) => { setCreatives(c); setOffers(o); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterOffer ? creatives.filter(c => c.offerId === filterOffer) : creatives;

  const platformIcon = { tiktok: '🎵', reels: '📸', shorts: '▶️', facebook: '📘' };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>📁 Библиотека креативов</div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{creatives.length} файлов</div>
        </div>
        <select
          style={{ background: '#0a0a18', border: '1px solid #2a2a4a', color: '#888', padding: '7px 12px', borderRadius: 8, fontSize: 12, outline: 'none' }}
          value={filterOffer}
          onChange={e => setFilterOffer(e.target.value)}
        >
          <option value="">Все офферы</option>
          {offers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
          <div style={{ color: '#555', fontSize: 14 }}>
            {creatives.length === 0
              ? 'Пока нет ни одного креатива. Создай первый!'
              : 'Нет креативов по выбранному фильтру.'}
          </div>
        </Card>
      ) : (
        filtered.map(c => (
          <Card key={c.id} style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 10,
                background: 'linear-gradient(135deg, #1a1a2e, #0d0d1a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, border: '1px solid #2a2a4a', flexShrink: 0,
              }}>
                {platformIcon[c.platform] || '🎬'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#e0e0ff', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {offers.find(o => o.id === c.offerId)?.name || 'Без оффера'} · Вариация #{c.variation}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Badge color="#a855f7">{c.platform}</Badge>
                  <Badge color="#3b82f6">{c.subtitleStyle}</Badge>
                  {c.banScore && <BanScoreBadge score={c.banScore} />}
                  <span style={{ color: '#333', fontSize: 10, fontFamily: 'monospace' }}>
                    {new Date(c.createdAt).toLocaleDateString('ru')}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button style={{
                  padding: '7px 12px', background: '#1a1a2e', border: '1px solid #2a2a4a',
                  borderRadius: 8, color: '#666', fontSize: 11, cursor: 'pointer',
                }}>♻️ Перегенерировать</button>
                <a
                  href={c.downloadUrl ? `${BACKEND_BASE_URL || ''}${c.downloadUrl}` : '#'}
                  style={{
                    padding: '7px 14px',
                    background: 'linear-gradient(90deg, #00f5d4, #0ea5e9)',
                    borderRadius: 8, color: '#000', fontWeight: 700, fontSize: 12, textDecoration: 'none',
                  }}
                >⬇</a>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
