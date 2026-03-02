// ─────────────────────────────────────────────────────────────────────────────
// HEADER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { PlanBadge, ProgressBar } from './ui.jsx';
import { getMe } from '../api.js';

export default function Header() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    getMe().then(setUserData).catch(() => {});
  }, []);

  const user = userData?.user;
  const limits = userData?.limits;
  const usagePct = user && limits?.videosPerMonth && limits.videosPerMonth !== Infinity
    ? Math.round((user.videosProcessedThisMonth / limits.videosPerMonth) * 100)
    : 0;

  const APP_VERSION = 'v1.2';

  return (
    <header style={{
      background: 'linear-gradient(90deg, #080815, #0f0f22)',
      borderBottom: '1px solid #1e1e3a',
      padding: '13px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 18, color: '#fff',
          boxShadow: '0 0 20px #a855f755',
        }}>U</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.5 }}>
            Uniqualizer <span style={{ color: '#a855f7' }}>Pro</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 1 }}>
            <div style={{ fontSize: 9, color: '#333', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Creative Engine for Arbitrage
            </div>
            <span style={{
              fontSize: 9,
              color: '#555',
              padding: '2px 6px',
              borderRadius: 999,
              border: '1px solid #2a2a4a',
              background: '#050515',
              fontFamily: 'monospace',
            }}>
              {APP_VERSION}
            </span>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {user && limits && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, marginBottom: 4, fontFamily: 'monospace' }}>
              {user.videosProcessedThisMonth} / {limits.videosPerMonth === Infinity ? '∞' : limits.videosPerMonth} видео
            </div>
            <div style={{ width: 120 }}>
              <ProgressBar value={usagePct} color="#a855f7" />
            </div>
          </div>
        )}
        {user && <PlanBadge plan={user.plan} />}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 14, cursor: 'pointer',
          boxShadow: '0 0 12px #a855f755',
        }}>
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  );
}
