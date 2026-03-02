// ─────────────────────────────────────────────────────────────────────────────
// CLASSIC MODE — упрощённый режим уникализации
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Card, SectionTitle, Toggle, Select, DropZone, ProgressBar } from '../components/ui.jsx';
import { generateCreatives, exportSRT, BACKEND_BASE_URL } from '../api.js';

const LANGUAGES = ['auto', 'ru', 'en', 'es', 'fr', 'de', 'pt', 'it', 'zh', 'ar', 'tr', 'uk'];

const SUBTITLE_STYLES = [
  { value: 'tiktok', label: '🔥 TikTok Bold' },
  { value: 'youtube', label: '▶ YouTube Clean' },
  { value: 'anime', label: '⚡ Anime Impact' },
  { value: 'news', label: '📺 News Ticker' },
  { value: 'neon', label: '✨ Neon Glow' },
  { value: 'minimal', label: '◻ Minimal White' },
  { value: 'karaoke', label: '🎤 Karaoke' },
  { value: 'reels', label: '📱 Reels Gradient' },
];

const LOG_STEPS = [
  { label: 'Загрузка видео...', pct: 10 },
  { label: 'Транскрибирование (Whisper)...', pct: 35 },
  { label: 'Перевод субтитров...', pct: 55 },
  { label: 'Уникализация (визуал + мета)...', pct: 75 },
  { label: 'Рендеринг...', pct: 90 },
  { label: '✅ Готово!', pct: 100 },
];

export default function ClassicMode() {
  const [mode, setMode] = useState('DEEP_VISUAL');
  const [subtitles, setSubtitles] = useState(true);
  const [lang, setLang] = useState('auto');
  const [style, setStyle] = useState('tiktok');
  const [batch, setBatch] = useState(false);
  const [file, setFile] = useState(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  function simulateProgress(stepIndex = 0) {
    const s = LOG_STEPS[stepIndex];
    if (!s) return;
    setStep(stepIndex);
    setProgress(s.pct);
    if (stepIndex < LOG_STEPS.length - 1) {
      setTimeout(() => simulateProgress(stepIndex + 1), 900);
    }
  }

  async function handleStart() {
    if (!file) return;
    setRunning(true);
    setError('');
    setResults([]);
    simulateProgress(0);

    try {
      const data = await generateCreatives({
        videoFile: file,
        platforms: ['tiktok'],
        scenario: 'ugc',
        inputLanguage: lang,
        durationType: '30',
        subtitleStyle: style,
        uniqIntensity: 60,
        variations: 1,
        uniqMode: mode,
      });

      setResults(data.creatives || []);
    } catch (err) {
      const apiError = err.response?.data?.error ?? err.message ?? 'Ошибка сервера';
      if (typeof apiError === 'string') {
        setError(apiError);
      } else if (apiError && typeof apiError === 'object') {
        setError(apiError.message || JSON.stringify(apiError));
      } else {
        setError('Неизвестная ошибка сервера');
      }
    } finally {
      setRunning(false);
    }
  }

  const currentStep = LOG_STEPS[step];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Mode selector */}
      <Card>
        <SectionTitle>Режим уникализации</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { key: 'DEEP_VISUAL', label: '🔮 DEEP VISUAL', desc: 'Цветокор + zoom/pan + шум + fingerprint' },
            { key: 'PHANTOM', label: '👻 PHANTOM', desc: 'Максимальная невидимость + аудио-сдвиг' },
          ].map(m => (
            <button key={m.key} onClick={() => setMode(m.key)} style={{
              padding: '14px 12px', textAlign: 'left',
              background: mode === m.key ? 'linear-gradient(135deg, #a855f722, #7c3aed11)' : '#0a0a18',
              border: `1px solid ${mode === m.key ? '#a855f7' : '#2a2a4a'}`,
              borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: mode === m.key ? '0 0 20px #a855f733' : 'none',
            }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: mode === m.key ? '#e0e0ff' : '#666', marginBottom: 4 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 11, color: '#555' }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Subtitles */}
      <Card>
        <SectionTitle>AI Субтитры</SectionTitle>
        <Toggle value={subtitles} onChange={setSubtitles} label="Включить AI субтитры" />
        {subtitles && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 5 }}>Язык распознавания</div>
              <Select value={lang} onChange={setLang} options={LANGUAGES} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 5 }}>Стиль субтитров</div>
              <Select value={style} onChange={setStyle} options={SUBTITLE_STYLES} />
            </div>
          </div>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, cursor: 'pointer' }}>
          <input type="checkbox" checked={batch} onChange={e => setBatch(e.target.checked)} />
          <span style={{ color: '#888', fontSize: 12 }}>Batch Processing — обработать все загруженные видео</span>
        </label>
      </Card>

      {/* Upload */}
      <Card>
        <SectionTitle>Загрузка видео</SectionTitle>
        <DropZone file={file} onFile={setFile} />
      </Card>

      {/* Error */}
      {error && (
        <div style={{ background: '#ef444411', border: '1px solid #ef444444', borderRadius: 10, padding: '12px 16px', color: '#ef4444', fontSize: 13 }}>
          ❌ {error}
        </div>
      )}

      {/* Run button */}
      <button
        className={`btn ${file && !running ? 'btn-primary animate-pulse-glow' : 'btn-outline'}`}
        style={{ padding: '16px 0', fontSize: 15, letterSpacing: 0.5, width: '100%' }}
        onClick={handleStart}
        disabled={!file || running}
      >
        {running ? '⏳ ОБРАБОТКА...' : '⚡ START UNIQUALIZATION'}
      </button>

      {/* Progress */}
      {running && (
        <Card>
          <div style={{ marginBottom: 10 }}>
            <ProgressBar value={progress} label={currentStep?.label} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {LOG_STEPS.slice(0, step + 1).map((s, i) => (
              <span key={i} style={{ fontSize: 10, color: '#555', fontFamily: 'monospace' }}>
                {i < step ? '✓' : '▶'} {s.label}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Results */}
      {results.map((r, i) => (
        <Card key={r.id || i} accent="#a855f7">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                🎬 {file?.name} — Вариация #{r.variationIndex || 1}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Deep Visual ✓', `Стиль: ${style}`, 'Уникализирован ✓'].map(s => (
                  <span key={s} className="badge" style={{ background: '#00f5d422', border: '1px solid #00f5d444', color: '#00f5d4' }}>{s}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => exportSRT({ captions: r.captions || [], filename: file?.name?.replace(/\.[^.]+$/, '') })}
                className="btn btn-outline"
                style={{ padding: '8px 12px', fontSize: 12 }}
              >
                📄 SRT
              </button>
              <a
                href={r.downloadUrl ? `${BACKEND_BASE_URL || ''}${r.downloadUrl}` : '#'}
                className="btn"
                style={{ padding: '8px 16px', fontSize: 12, background: 'linear-gradient(90deg, #00f5d4, #0ea5e9)', color: '#000', fontWeight: 700, textDecoration: 'none' }}
              >
                ⬇ Скачать
              </a>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
