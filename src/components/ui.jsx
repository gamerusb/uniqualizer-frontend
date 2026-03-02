// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';

// ── BADGE ─────────────────────────────────────────────────────────────────────

export function Badge({ children, color = '#a855f7' }) {
  return (
    <span className="badge" style={{ background: color + '22', border: `1px solid ${color}55`, color }}>
      {children}
    </span>
  );
}

// ── BAN SCORE BADGE ───────────────────────────────────────────────────────────

export function BanScoreBadge({ score }) {
  const map = { low: ['#22c55e', '🟢 Низкий'], medium: ['#f59e0b', '🟡 Средний'], high: ['#ef4444', '🔴 Высокий'] };
  const [color, label] = map[score] || ['#666', '—'];
  return <Badge color={color}>🛡 {label}</Badge>;
}

// ── PLAN BADGE ────────────────────────────────────────────────────────────────

export function PlanBadge({ plan }) {
  const colors = { FREE: '#6b7280', BASIC: '#3b82f6', PRO: '#a855f7', PREMIUM: '#f59e0b' };
  const color = colors[plan] || '#666';
  return (
    <span style={{
      background: color + '18', border: `1px solid ${color}44`, color,
      fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 700,
    }}>{plan}</span>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────────────────────

export function ProgressBar({ value = 0, color = '#a855f7', label }) {
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: '#888' }}>{label}</span>
          <span style={{ fontSize: 12, color, fontWeight: 700, fontFamily: 'monospace' }}>{value}%</span>
        </div>
      )}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, boxShadow: `0 0 8px ${color}88` }} />
      </div>
    </div>
  );
}

// ── TOGGLE ────────────────────────────────────────────────────────────────────

export function Toggle({ value, onChange, label, color = '#a855f7' }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <div
        className="toggle"
        style={{ background: value ? color : '#2a2a4a', boxShadow: value ? `0 0 10px ${color}66` : 'none' }}
        onClick={() => onChange(!value)}
      >
        <div className="toggle-thumb" style={{ left: value ? 21 : 3 }} />
      </div>
      {label && <span style={{ color: '#c0c0e0', fontSize: 13 }}>{label}</span>}
    </label>
  );
}

// ── SECTION TITLE ─────────────────────────────────────────────────────────────

export function SectionTitle({ children, accent = '#a855f7' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ width: 3, height: 18, background: accent, borderRadius: 2 }} />
      <span style={{ color: '#c0c0e0', fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
        {children}
      </span>
    </div>
  );
}

// ── CARD ──────────────────────────────────────────────────────────────────────

export function Card({ children, style = {}, accent }) {
  return (
    <div className="card" style={{ borderColor: accent ? accent + '44' : undefined, ...style }}>
      {children}
    </div>
  );
}

// ── SELECT ────────────────────────────────────────────────────────────────────

export function Select({ value, onChange, options, placeholder }) {
  return (
    <select className="form-select" value={value} onChange={e => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  );
}

// ── INPUT ─────────────────────────────────────────────────────────────────────

export function Input({ value, onChange, placeholder, type = 'text', style = {} }) {
  return (
    <input
      className="form-input"
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={style}
    />
  );
}

// ── DRAG & DROP FILE ZONE ─────────────────────────────────────────────────────

export function DropZone({ file, onFile, accept = 'video/*', icon = '🎞️', title = 'Загрузить видео', subtitle = 'MP4, MOV, AVI, WebM', color = '#a855f7' }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }

  return (
    <div
      className={`dropzone ${dragging ? 'active' : ''} ${file ? 'has-file' : ''}`}
      style={{ borderColor: file ? color + 'aa' : undefined }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
    >
      <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }}
        onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
      <div style={{ fontSize: 36, marginBottom: 8 }}>{file ? '🎬' : icon}</div>
      <div style={{ color: file ? color : '#666', fontSize: 14, fontWeight: 600 }}>
        {file ? file.name : title}
      </div>
      {!file && <div style={{ color: '#333', fontSize: 11, marginTop: 4 }}>{subtitle}</div>}
      {file && (
        <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>
          {(file.size / 1024 / 1024).toFixed(1)} МБ
        </div>
      )}
    </div>
  );
}

// ── SLIDER ────────────────────────────────────────────────────────────────────

export function Slider({ value, onChange, min = 0, max = 100, labels }) {
  return (
    <div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)} />
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555', marginTop: 2 }}>
          {labels.map(l => <span key={l}>{l}</span>)}
        </div>
      )}
    </div>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────────────────

export function Modal({ title, children, onClose }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: '#000000cc', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      onClick={onClose}
    >
      <div
        className="card animate-fade-in"
        style={{ width: 380, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── SPINNER ───────────────────────────────────────────────────────────────────

export function Spinner({ size = 20, color = '#a855f7' }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid ${color}33`,
      borderTop: `2px solid ${color}`, borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}

// ── CHIP SELECTOR (платформы, длительность) ───────────────────────────────────

export function ChipGroup({ options, value, onChange, multi = false, color = '#a855f7' }) {
  function toggle(key) {
    if (multi) {
      const arr = Array.isArray(value) ? value : [value];
      onChange(arr.includes(key) ? arr.filter(k => k !== key) : [...arr, key]);
    } else {
      onChange(key);
    }
  }

  function isActive(key) {
    return multi ? (Array.isArray(value) ? value.includes(key) : false) : value === key;
  }

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(o => (
        <button
          key={o.value ?? o}
          onClick={() => toggle(o.value ?? o)}
          style={{
            padding: '6px 14px',
            background: isActive(o.value ?? o) ? color + '22' : '#0d0d1a',
            border: `1px solid ${isActive(o.value ?? o) ? color : '#2a2a4a'}`,
            borderRadius: 99,
            color: isActive(o.value ?? o) ? color : '#666',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            boxShadow: isActive(o.value ?? o) ? `0 0 10px ${color}44` : 'none',
            transition: 'all 0.15s',
          }}
        >
          {o.icon && `${o.icon} `}{o.label ?? o}
        </button>
      ))}
    </div>
  );
}
