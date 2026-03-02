// ─────────────────────────────────────────────────────────────────────────────
// NEW CREATIVE — главный PRO-экран
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
  Card, SectionTitle, Toggle, Select, Input, DropZone,
  ProgressBar, ChipGroup, Slider, Modal, BanScoreBadge, Badge, Spinner,
} from '../components/ui.jsx';
import { generateCreatives, getOffers, createOffer, BACKEND_BASE_URL } from '../api.js';

const PLATFORMS = [
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'reels', label: 'Reels', icon: '📸' },
  { value: 'shorts', label: 'Shorts', icon: '▶️' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
];

const SCENARIOS = [
  { value: 'ugc', label: 'UGC Отзыв', desc: '«Я попробовал и вот что вышло...»', icon: '🎙️' },
  { value: 'pain_solution', label: 'Боль → Решение', desc: 'Покажи проблему, дай ответ', icon: '💊' },
  { value: 'before_after', label: 'Before / After', desc: 'Трансформация за секунды', icon: '🔄' },
  { value: 'storytelling', label: 'Storytelling', desc: 'Захватывающая история с крючком', icon: '📖' },
];

const LANGUAGES = ['auto', 'ru', 'en', 'es', 'fr', 'de', 'pt', 'it', 'zh', 'ar', 'tr', 'uk'];

const SUBTITLE_STYLES = [
  { value: 'tiktok', label: 'TikTok Bold', badge: '🔥 ТикТок' },
  { value: 'youtube', label: 'YouTube Clean', badge: '▶ YouTube' },
  { value: 'anime', label: 'Anime Impact', badge: '⚡ Аниме' },
  { value: 'news', label: 'News Ticker', badge: '📺 Новости' },
  { value: 'neon', label: 'Neon Glow', badge: '✨ Неон' },
  { value: 'minimal', label: 'Minimal White', badge: '◻ Минимал' },
  { value: 'karaoke', label: 'Karaoke', badge: '🎤 Karaoke' },
  { value: 'reels', label: 'Reels Gradient', badge: '📱 Reels' },
];

const DURATIONS = [
  { value: '15', label: '15с' },
  { value: '20', label: '20с' },
  { value: '30', label: '30с' },
  { value: '45', label: '45с' },
  { value: 'custom', label: 'Custom' },
];

export default function NewCreative() {
  // Offer
  const [offers, setOffers] = useState([]);
  const [offerId, setOfferId] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [newOffer, setNewOffer] = useState({ name: '', geo: '', note: '' });
  const [offerLoading, setOfferLoading] = useState(false);

  // Targeting
  const [platforms, setPlatforms] = useState(['tiktok']);
  const [scenario, setScenario] = useState('ugc');

  // Settings
  const [inputLang, setInputLang] = useState('auto');
  const [translateTo, setTranslateTo] = useState('');
  const [duration, setDuration] = useState('30');
  const [customDur, setCustomDur] = useState('45');
  const [subStyle, setSubStyle] = useState('tiktok');
  const [intensity, setIntensity] = useState(55);
  const [variations, setVariations] = useState(3);

  // Upload
  const [file, setFile] = useState(null);
  const [splitScenes, setSplitScenes] = useState(false);
  const [removeOrig, setRemoveOrig] = useState(true);

  // Extras
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [thumbs, setThumbs] = useState(false);
  const [banScore, setBanScore] = useState(true);
  const [savePreset, setSavePreset] = useState(false);

  // Generation
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [creatives, setCreatives] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getOffers()
      .then(list => {
        setOffers(list);
        if (list.length > 0) setOfferId(list[0].id);
      })
      .catch(() => {});
  }, []);

  async function handleCreateOffer() {
    if (!newOffer.name) return;
    setOfferLoading(true);
    try {
      const offer = await createOffer(newOffer);
      setOffers(prev => [...prev, offer]);
      setOfferId(offer.id);
      setShowOfferModal(false);
      setNewOffer({ name: '', geo: '', note: '' });
    } catch (err) {
      alert('Ошибка создания оффера: ' + (err.response?.data?.error || err.message));
    } finally {
      setOfferLoading(false);
    }
  }

  function simulateProgress() {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15;
      setGenProgress(Math.min(Math.round(p), 90));
      if (p >= 90) clearInterval(iv);
    }, 400);
    return () => { clearInterval(iv); setGenProgress(100); };
  }

  async function handleGenerate() {
    if (!file) return;
    setGenerating(true);
    setError('');
    setCreatives([]);
    const stopProgress = simulateProgress();

    try {
      const data = await generateCreatives({
        videoFile: file,
        offerId: offerId || undefined,
        platforms,
        scenario,
        inputLanguage: inputLang,
        translateTo: translateTo || undefined,
        durationType: duration,
        customDuration: duration === 'custom' ? customDur : undefined,
        subtitleStyle: subStyle,
        uniqIntensity: intensity,
        variations,
        generateThumbs: thumbs,
        calcBanScore: banScore,
        saveAsPreset: savePreset,
      });

      stopProgress();
      setGenProgress(100);
      setCreatives(data.creatives || []);
    } catch (err) {
      stopProgress();
      const apiError = err.response?.data?.error ?? err.message ?? 'Ошибка сервера';
      if (typeof apiError === 'string') {
        setError(apiError);
      } else if (apiError && typeof apiError === 'object') {
        setError(apiError.message || JSON.stringify(apiError));
      } else {
        setError('Неизвестная ошибка сервера');
      }
    } finally {
      setGenerating(false);
    }
  }

  const selectedOffer = offers.find(o => o.id === offerId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Block A: Оффер + Площадка */}
      <Card>
        <SectionTitle accent="#ec4899">A — Оффер и площадка</SectionTitle>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <Select
              value={offerId}
              onChange={setOfferId}
              placeholder="— Выбери оффер —"
              options={offers.map(o => ({ value: o.id, label: `${o.name} [${o.geo || '?'}]` }))}
            />
          </div>
          <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 12, whiteSpace: 'nowrap' }}
            onClick={() => setShowOfferModal(true)}>
            + Новый
          </button>
        </div>

        <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>Площадки</div>
        <ChipGroup
          options={PLATFORMS}
          value={platforms}
          onChange={setPlatforms}
          multi
          color="#ec4899"
        />

        <div style={{ fontSize: 11, color: '#555', marginBottom: 8, marginTop: 14 }}>Сценарий</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SCENARIOS.map(s => (
            <button key={s.value} onClick={() => setScenario(s.value)} style={{
              padding: '10px 12px', textAlign: 'left',
              background: scenario === s.value ? '#a855f711' : '#0a0a18',
              border: `1px solid ${scenario === s.value ? '#a855f7' : '#1e1e3a'}`,
              borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ color: scenario === s.value ? '#e0e0ff' : '#888', fontSize: 12, fontWeight: 700 }}>{s.label}</div>
              <div style={{ color: '#444', fontSize: 10, marginTop: 2, lineHeight: 1.3 }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Block B: Настройки */}
      <Card>
        <SectionTitle accent="#00f5d4">B — Настройки креатива</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Левая колонка */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 5 }}>Язык оригинала</div>
              <Select value={inputLang} onChange={setInputLang} options={LANGUAGES} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 5 }}>Перевод субтитров</div>
              <Select value={translateTo} onChange={setTranslateTo} options={[
                { value: '', label: 'Не переводить' },
                ...LANGUAGES.filter(l => l !== 'auto').map(l => ({ value: l, label: l.toUpperCase() })),
              ]} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>Длительность</div>
              <ChipGroup options={DURATIONS} value={duration} onChange={setDuration} color="#00f5d4" />
              {duration === 'custom' && (
                <Input value={customDur} onChange={setCustomDur} placeholder="Секунды" style={{ marginTop: 8 }} />
              )}
            </div>
          </div>

          {/* Правая колонка */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 5 }}>Стиль субтитров</div>
              <Select
                value={subStyle}
                onChange={setSubStyle}
                options={SUBTITLE_STYLES.map(s => ({ value: s.value, label: `${s.label} ${s.badge}` }))}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#555' }}>Интенсивность уникализации</span>
                <span style={{ fontSize: 12, color: '#a855f7', fontWeight: 700, fontFamily: 'monospace' }}>{intensity}</span>
              </div>
              <Slider value={intensity} onChange={setIntensity} labels={['Мягко', 'Баланс', 'Агрессивно']} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>Вариации</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 3, 10].map(v => (
                  <button key={v} onClick={() => setVariations(v)} style={{
                    flex: 1, padding: '10px 0',
                    background: variations === v ? '#a855f722' : '#0d0d1a',
                    border: `1px solid ${variations === v ? '#a855f7' : '#2a2a4a'}`,
                    borderRadius: 8, color: variations === v ? '#a855f7' : '#555',
                    fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    {v}
                    {v === 10 && <div style={{ fontSize: 8, color: '#f59e0b' }}>PRO</div>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Block C: Загрузка */}
      <Card>
        <SectionTitle accent="#f59e0b">C — Загрузка сырья</SectionTitle>
        <DropZone file={file} onFile={setFile} color="#f59e0b" icon="🎞️" title="Загрузить сырой ролик" />
        {file && (
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <Toggle value={splitScenes} onChange={setSplitScenes} label="Разрезать по сценам" color="#f59e0b" />
            <Toggle value={removeOrig} onChange={setRemoveOrig} label="Убрать оригинальные субтитры" color="#f59e0b" />
          </div>
        )}
      </Card>

      {/* Block D: Дополнительно */}
      <Card>
        <button
          onClick={() => setAccordionOpen(!accordionOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
        >
          <span style={{ color: '#777', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            ⚙️ D — Дополнительно для арбитража
          </span>
          <span style={{ color: '#444', fontSize: 14 }}>{accordionOpen ? '▲' : '▼'}</span>
        </button>
        {accordionOpen && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }} className="animate-fade-in">
            <Toggle value={thumbs} onChange={setThumbs} label="🖼 Сгенерировать 3 обложки (thumbs)" />
            <Toggle value={banScore} onChange={setBanScore} label="🛡 Посчитать риск бана (ban-score)" color="#22c55e" />
            <Toggle value={savePreset} onChange={setSavePreset} label="💾 Сохранить как пресет под этот оффер" color="#f59e0b" />
            {savePreset && !offerId && (
              <div style={{ fontSize: 11, color: '#f59e0b', padding: '6px 10px', background: '#f59e0b11', borderRadius: 6 }}>
                ⚠️ Выбери оффер выше, чтобы сохранить пресет
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Error */}
      {error && (
        <div style={{ background: '#ef444411', border: '1px solid #ef444444', borderRadius: 10, padding: '12px 16px', color: '#ef4444', fontSize: 13 }}>
          ❌ {error}
        </div>
      )}

      {/* Bottom bar */}
      <div style={{
        background: '#0a0a18', border: '1px solid #1e1e3a', borderRadius: 16,
        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 11, color: '#555', lineHeight: 1.8 }}>
          <div>📦 Оффер: <span style={{ color: '#a855f7' }}>{selectedOffer?.name || '—'}</span></div>
          <div>📱 Площадки: <span style={{ color: '#a855f7' }}>{platforms.join(', ') || '—'}</span></div>
          <div>🎬 <span style={{ color: '#a855f7' }}>{variations}</span> вар. · <span style={{ color: '#a855f7' }}>{duration === 'custom' ? customDur + 'с' : duration + 'с'}</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', minWidth: 220 }}>
          {generating && <ProgressBar value={genProgress} color="#ec4899" label={`Генерация... ${genProgress}%`} />}
          <button
            className={`btn ${file && !generating ? 'btn-danger animate-pulse-glow' : 'btn-outline'}`}
            style={{ padding: '14px 24px', fontSize: 14, letterSpacing: 0.3, whiteSpace: 'nowrap' }}
            onClick={handleGenerate}
            disabled={!file || generating}
          >
            {generating ? <><Spinner size={16} color="#fff" /> &nbsp; Генерация...</> : '🚀 Сгенерировать креативы'}
          </button>
        </div>
      </div>

      {/* Creatives results */}
      {creatives.length > 0 && (
        <div className="animate-fade-in">
          <div style={{ fontWeight: 700, color: '#22c55e', marginBottom: 12 }}>
            ✅ Сгенерировано {creatives.length} {creatives.length === 1 ? 'креатив' : 'креатива'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {creatives.map(c => (
              <Card key={c.id} accent="#a855f7" style={{ padding: 14 }}>
                <div style={{
                  height: 90, borderRadius: 8, marginBottom: 10, background: 'linear-gradient(135deg, #1a1a2e, #0d0d1a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                  border: '1px solid #2a2a4a',
                }}>🎬</div>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Вариация #{c.variationIndex}</div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{c.platform}</div>
                {c.banScore && <div style={{ marginBottom: 8 }}><BanScoreBadge score={c.banScore} /></div>}
                <a
                  href={c.downloadUrl ? `${BACKEND_BASE_URL || ''}${c.downloadUrl}` : '#'}
                  style={{
                    display: 'block', textAlign: 'center', padding: '7px 0',
                    background: 'linear-gradient(90deg, #00f5d4, #0ea5e9)',
                    borderRadius: 8, color: '#000', fontWeight: 700, fontSize: 11, textDecoration: 'none',
                  }}
                >⬇ Скачать</a>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* New offer modal */}
      {showOfferModal && (
        <Modal title="➕ Новый оффер" onClose={() => setShowOfferModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Input value={newOffer.name} onChange={v => setNewOffer(p => ({ ...p, name: v }))} placeholder="Название оффера *" />
            <Input value={newOffer.geo} onChange={v => setNewOffer(p => ({ ...p, geo: v }))} placeholder="GEO (RU, EU, LATAM...)" />
            <Input value={newOffer.note} onChange={v => setNewOffer(p => ({ ...p, note: v }))} placeholder="Заметка (необязательно)" />
            <button
              className="btn btn-primary"
              style={{ padding: '10px 0', marginTop: 4 }}
              onClick={handleCreateOffer}
              disabled={!newOffer.name || offerLoading}
            >
              {offerLoading ? <Spinner size={16} color="#fff" /> : 'Создать оффер'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
