// src/components/layout/Topbar.tsx
import { useLocation } from 'react-router-dom';
import { Bell, Settings, Menu, Search, ChevronRight, Sun } from 'lucide-react';
import { useState } from 'react';

interface TopbarProps {
  collapsed:    boolean;
  onMenuClick:  () => void;
  isMobile?:    boolean;
}

const routeTree: Record<string, { label: string; parent?: string }> = {
  '/dashboard':       { label: 'Dashboard' },
  '/agriculture':     { label: 'Agriculture' },
  '/dairy':           { label: 'Dairy' },
  '/shop':            { label: 'Shop & POS' },
  '/shop/pos':        { label: 'Point of Sale',    parent: 'Shop'  },
  '/shop/processing': { label: 'Batch Processing', parent: 'Shop'  },
  '/shop/sales':      { label: 'Sales History',    parent: 'Shop'  },
  '/dairy/fodder':    { label: 'Fodder & Feed',    parent: 'Dairy' },
};

function getRouteInfo(pathname: string) {
  if (routeTree[pathname]) return routeTree[pathname];
  const match = Object.keys(routeTree)
    .sort((a, b) => b.length - a.length)
    .find(k => pathname.startsWith(k));
  return match ? routeTree[match] : { label: 'Ranch Tracker' };
}

const moduleAccent: Record<string, string> = {
  '/dashboard':   '#34d399',
  '/agriculture': '#6ee7b7',
  '/dairy':       '#38bdf8',
  '/shop':        '#fbbf24',
};

function getAccent(pathname: string) {
  const match = Object.keys(moduleAccent)
    .sort((a, b) => b.length - a.length)
    .find(k => pathname.startsWith(k));
  return match ? moduleAccent[match] : '#34d399';
}

/* Shared icon button style */
const iconBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 9,
  background: 'transparent',
  border: '1px solid transparent',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: '#4b5e76',
  transition: 'all .15s',
};

export default function Topbar({ onMenuClick, isMobile }: TopbarProps) {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifCount] = useState(3);

  const info   = getRouteInfo(location.pathname);
  const accent = getAccent(location.pathname);

  return (
    <header
      style={{
        height: 60,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 14px' : '0 24px',
        background: '#111827',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.3)',
        gap: 12,
        zIndex: 10,
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        {/* Menu toggle */}
        <button
          onClick={onMenuClick}
          aria-label="Toggle menu"
          style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#4b5e76',
            flexShrink: 0, transition: 'all .15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = `${accent}14`;
            el.style.borderColor = `${accent}30`;
            el.style.color = accent;
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'rgba(255,255,255,0.05)';
            el.style.borderColor = 'rgba(255,255,255,0.07)';
            el.style.color = '#4b5e76';
          }}
        >
          <Menu size={15} />
        </button>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, overflow: 'hidden' }}>
          {info.parent && !isMobile && (
            <>
              <span style={{ fontSize: 13, color: '#4b5e76', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
                {info.parent}
              </span>
              <ChevronRight size={11} style={{ color: '#2a3a50', flexShrink: 0 }} />
            </>
          )}
          <span
            style={{
              fontSize: isMobile ? 14 : 15,
              fontWeight: 700,
              color: '#f1f5f9',
              fontFamily: "'Syne', sans-serif",
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {info.label}
          </span>
          {/* Accent dot */}
          <div
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: accent, flexShrink: 0, marginLeft: 3,
              boxShadow: `0 0 6px ${accent}88`,
            }}
          />
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>

        {/* Weather pill — desktop */}
        {!isMobile && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px',
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.18)',
              borderRadius: 20, fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              marginRight: 4,
            }}
          >
            <Sun size={13} style={{ color: '#fbbf24' }} />
            <span style={{ fontWeight: 700, color: '#fbbf24' }}>28°C</span>
            <span style={{ color: '#94a3b8' }}>Sunny</span>
          </div>
        )}

        {/* Date — desktop */}
        {!isMobile && (
          <div
            style={{
              padding: '5px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, fontSize: 12,
              color: '#64748b',
              fontFamily: "'DM Sans', sans-serif",
              marginRight: 2,
            }}
          >
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}

        {/* Search */}
        {!isMobile && (
          <div
            className="topbar-search"
            style={{ width: searchOpen ? 190 : 34, transition: 'width .2s ease', overflow: 'hidden' }}
            onClick={() => setSearchOpen(true)}
          >
            <Search size={13} style={{ color: '#4b5e76', flexShrink: 0 }} />
            <input
              placeholder="Search…"
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        )}

        {/* Notifications */}
        <button
          style={iconBtn}
          aria-label={`${notifCount} notifications`}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'rgba(255,255,255,0.06)';
            el.style.borderColor = 'rgba(255,255,255,0.09)';
            el.style.color = '#94a3b8';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'transparent';
            el.style.borderColor = 'transparent';
            el.style.color = '#4b5e76';
          }}
        >
          <Bell size={16} />
          {notifCount > 0 && (
            <span
              style={{
                position: 'absolute', top: 7, right: 7,
                width: 7, height: 7, borderRadius: '50%',
                background: '#f87171',
                border: '2px solid #111827',
              }}
            />
          )}
        </button>

        {/* Settings */}
        <button
          style={iconBtn}
          aria-label="Settings"
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'rgba(255,255,255,0.06)';
            el.style.borderColor = 'rgba(255,255,255,0.09)';
            el.style.color = '#94a3b8';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'transparent';
            el.style.borderColor = 'transparent';
            el.style.color = '#4b5e76';
          }}
        >
          <Settings size={16} />
        </button>

        {/* Avatar */}
        <div
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
            cursor: 'pointer',
            fontFamily: "'Syne', sans-serif",
            boxShadow: '0 0 12px rgba(16,185,129,0.25)',
            flexShrink: 0,
          }}
          title="Farm Manager"
        >
          NF
        </div>
      </div>
    </header>
  );
}