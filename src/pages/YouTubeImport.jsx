// ─────────────────────────────────────────────────────────────────────────────
// YOUTUBE IMPORT
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Card, SectionTitle, Toggle, Input, Badge, Spinner } from '../components/ui.jsx';
import { importYoutube, importYoutubeShorts } from '../api.js';

export default function YouTubeImport() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [mode, setMode] = useState('full');
  const [start, setStart] = useState('0');
  const [end, setEnd] = useState('60');
  const [makeShorts, setMakeShorts] = useState(true);

  const [genMetaLoading, setGenMetaLoading] = useState(false);

  async function handleImport() {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await importYoutube({
        url: url.trim(),
        mode,
        start: mode === 'clip' ? Number(start) : 0,
        end: mode === 'clip' ? Number(end) : undefined,
      });
      setResult(data);
    } catch (err) {
      const apiError = err.response?.data?.error ?? err.message ?? 'Ошибка импорта';
      if (typeof apiError === 'string') {
        setError(apiError);
      } else if (apiError && typeof apiError === 'object') {
        setError(apiError.message || JSON.stringify(apiError));
      } else {
        setError('Неизвестная ошибка импорта');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateShorts() {
    if (!result || !url.trim()) return;
    setGenMetaLoading(true);
    setError('');
    try {
      const data = await importYoutubeShorts({
        url: url.trim(),
        mode,
        start: mode === 'clip' ? Number(start) : 0,
        end: mode === 'clip' ? Number(end) : undefined,
      });
      if (data.downloadUrl) {
        window.location.href = data.downloadUrl;
      } else {
        setError('Сервер не вернул ссылку на скачивание Shorts.');
      }
    } catch (err) {
      const apiError = err.response?.data?.error ?? err.message ?? 'Ошибка импорта';
      if (typeof apiError === 'string') {
        setError(apiError);
      } else if (apiError && typeof apiError === 'object') {
        setError(apiError.message || JSON.stringify(apiError));
      } else {
        setError('Неизвестная ошибка импорта');
      }
    } finally {
      setGenMetaLoading(false);
    }
  }

  const generatedMeta = result?.meta?.generated;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* URL input */}
      <Card>
        <SectionTitle accent="#ff0000">▶ YouTube Импорт</SectionTitle>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 14 }}>
          Вставь ссылку на YouTube — получи Shorts с новыми субтитрами и метаданными.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            value={url}
            onChange={setUrl}
            placeholder="https://youtube.com/watch?v=... или просто ID"
          />
          <button
            className="btn"
            style={{
              padding: '9px 20px',
              background: url && !loading ? 'linear-gradient(135deg, #ff2020, #cc0000)' : '#1a1a2e',
              color: url && !loading ? '#fff' : '#444',
              fontSize: 13, whiteSpace: 'nowrap', cursor: url && !loading ? 'pointer' : 'not-allowed',
            }}
            onClick={handleImport}
            disabled={!url || loading}
          >
            {loading ? <Spinner size={16} color="#ff4444" /> : '▶ Импортировать'}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: 10, color: '#ef4444', fontSize: 12 }}>❌ {error}</div>
        )}
      </Card>

      {/* Result */}
      {result && (
        <>
          <Card accent="#ff000033" className="animate-fade-in">
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* Thumbnail */}
              <img
                src={result.thumbnailUrl}
                alt=""
                style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid #2a2a4a' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#e0e0ff', marginBottom: 4 }}>
                  {result.meta?.original?.title}
                </div>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 10, fontFamily: 'monospace' }}>
                  ID: {result.videoId}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['full', 'clip'].map(m => (
                    <button key={m} onClick={() => setMode(m)} style={{
                      padding: '5px 14px',
                      background: mode === m ? '#ff000022' : '#0d0d1a',
                      border: `1px solid ${mode === m ? '#ff0000' : '#2a2a4a'}`,
                      borderRadius: 99, color: mode === m ? '#ff6666' : '#666',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}>
                      {m === 'full' ? '📹 Весь ролик' : '✂️ Отрезок'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {mode === 'clip' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 5 }}>Начало (сек)</div>
                  <Input value={start} onChange={setStart} placeholder="0" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 5 }}>Конец (сек)</div>
                  <Input value={end} onChange={setEnd} placeholder="60" />
                </div>
              </div>
            )}

            <div style={{ marginTop: 14 }}>
              <Toggle
                value={makeShorts}
                onChange={setMakeShorts}
                label="🎬 Сделать Shorts-варианты (15–60с, формат 9:16)"
                color="#ff0000"
              />
            </div>
          </Card>

          {/* Generated meta */}
          <Card>
            <SectionTitle accent="#f59e0b">Новые метаданные (Groq AI)</SectionTitle>
            {generatedMeta ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-fade-in">
                {/* Titles */}
                <div>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>Варианты заголовков</div>
                  {generatedMeta.titles?.map((t, i) => (
                    <div key={i} style={{
                      background: '#0a0a18', border: '1px solid #1e1e3a', borderRadius: 8,
                      padding: '9px 12px', marginBottom: 6, fontSize: 12, color: '#c0c0e0',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                    }}>
                      <span>{t}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(t)}
                        style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', fontSize: 10, whiteSpace: 'nowrap' }}
                      >📋 Копировать</button>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>Теги</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {generatedMeta.tags?.map(t => (
                      <Badge key={t} color="#f59e0b">#{t}</Badge>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>Описание</div>
                  <div style={{
                    background: '#0a0a18', border: '1px solid #1e1e3a', borderRadius: 8,
                    padding: '10px 12px', fontSize: 12, color: '#888', lineHeight: 1.5,
                  }}>
                    {generatedMeta.description}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#555' }}>
                Метаданные генерируются через Groq AI на бэкенде при импорте.
              </div>
            )}
          </Card>

          <button
            className="btn"
            style={{
              padding: '15px 0', fontSize: 14, fontWeight: 800,
              background: 'linear-gradient(135deg, #ff2020, #a855f7)',
              color: '#fff', boxShadow: '0 0 30px #ff000044',
            }}
            onClick={handleGenerateShorts}
            disabled={genMetaLoading}
          >
            {genMetaLoading ? <><Spinner size={16} color="#fff" /> &nbsp; Обработка...</> : '🚀 Уникализировать и скачать Shorts'}
          </button>
        </>
      )}
    </div>
  );
}
