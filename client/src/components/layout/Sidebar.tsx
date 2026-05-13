// src/components/layout/Sidebar.tsx
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Leaf, Milk, ShoppingCart,
  ChevronLeft, X, Menu,
} from 'lucide-react';

/* ── Nav items — preserved from original ── */
const nav = [
  { key: 'dashboard',   label: 'Dashboard',  path: '/dashboard',   icon: LayoutDashboard, accent: '#34d399' },
  { key: 'agriculture', label: 'Agriculture', path: '/agriculture',  icon: Leaf,            accent: '#6ee7b7' },
  { key: 'dairy',       label: 'Dairy',       path: '/dairy',        icon: Milk,            accent: '#38bdf8' },
  { key: 'shop',        label: 'Shop & POS',  path: '/shop',         icon: ShoppingCart,    accent: '#fbbf24' },
];

interface Props {
  collapsed: boolean;
  onToggle:  () => void;
  isMobile?: boolean;
  onClose?:  () => void;
}

export default function Sidebar({ collapsed, onToggle, isMobile, onClose }: Props) {
  const loc = useLocation();

  const isActive = (path: string) =>
    path === '/dashboard'
      ? loc.pathname === '/dashboard' || loc.pathname === '/'
      : loc.pathname.startsWith(path);

  /* ── Icon-only width helpers ── */
  const iconOnly = collapsed && !isMobile;

  return (
    <aside
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #0b1422 0%, #0e1a2e 100%)',
        borderRight: '1px solid rgba(255,255,255,0.055)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >

      {/* ── Brand ─────────────────────────────────── */}
      <div
        style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          padding: iconOnly ? '0 13px' : '0 18px',
          justifyContent: iconOnly ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          {/* Logo mark */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 18px rgba(16,185,129,0.28), 0 2px 6px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)',
              }}
            />
            <span
              style={{
                fontSize: 13, fontWeight: 900, color: '#fff',
                fontFamily: "'Syne', sans-serif",
                letterSpacing: '-0.5px', position: 'relative', zIndex: 1,
              }}
            >
              RT
            </span>
          </div>

          {!iconOnly && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <p
                style={{
                  fontSize: 15, fontWeight: 800, color: '#f1f5f9',
                  fontFamily: "'Syne', sans-serif",
                  lineHeight: 1, letterSpacing: '-0.3px', whiteSpace: 'nowrap',
                }}
              >
                Ranch
              </p>
              <p
                style={{
                  fontSize: 9, color: 'rgba(255,255,255,0.22)',
                  letterSpacing: '0.2em', fontFamily: "'Syne', sans-serif",
                  textTransform: 'uppercase', marginTop: 2,
                }}
              >
                Tracker
              </p>
            </div>
          )}
        </div>

        {/* Mobile close */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.38)', flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#fff';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.38)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Navigation ────────────────────────────── */}
      <nav
        style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', scrollbarWidth: 'none' }}
        aria-label="Main navigation"
      >
        {!iconOnly && (
          <p
            style={{
              fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              padding: '2px 8px 10px', fontFamily: "'Syne', sans-serif",
            }}
          >
            Navigation
          </p>
        )}

        {nav.map((item, idx) => {
          const Icon   = item.icon;
          const active = isActive(item.path);

          return (
            <NavLink
              key={item.key}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              title={iconOnly ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: iconOnly ? 0 : 10,
                padding: iconOnly ? '11px 0' : '9px 12px',
                justifyContent: iconOnly ? 'center' : 'flex-start',
                borderRadius: 10,
                marginBottom: 3,
                textDecoration: 'none',
                background: active ? 'rgba(20,184,166,0.1)' : 'transparent',
                color: active ? '#f1f5f9' : 'rgba(255,255,255,0.38)',
                position: 'relative',
                transition: 'all 0.15s ease',
                border: 'none',
                cursor: 'pointer',
                animationDelay: `${idx * 0.06}s`,
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.72)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.38)';
                }
              }}
            >
              {/* Active left bar */}
              {active && !iconOnly && (
                <span
                  style={{
                    position: 'absolute', left: 0, top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3, height: 18, background: item.accent,
                    borderRadius: '0 2px 2px 0',
                    boxShadow: `0 0 8px ${item.accent}88`,
                  }}
                />
              )}

              <Icon
                size={16}
                style={{
                  color: active ? item.accent : 'inherit',
                  flexShrink: 0,
                  filter: active ? `drop-shadow(0 0 4px ${item.accent}60)` : 'none',
                  transition: 'all 0.15s',
                }}
              />

              {!iconOnly && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    flex: 1,
                    fontFamily: "'DM Sans', sans-serif",
                    whiteSpace: 'nowrap',
                    letterSpacing: active ? '-0.1px' : '0',
                  }}
                >
                  {item.label}
                </span>
              )}

              {/* Collapsed active dot */}
              {active && iconOnly && (
                <span
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 5, height: 5, borderRadius: '50%',
                    background: item.accent,
                    boxShadow: `0 0 5px ${item.accent}`,
                  }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Farm card ─────────────────────────────── */}
      {!iconOnly && (
        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.055)', flexShrink: 0 }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                width: 30, height: 30, borderRadius: 9,
                background: 'rgba(16,185,129,0.14)',
                border: '1px solid rgba(16,185,129,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, color: '#34d399', fontFamily: "'Syne', sans-serif" }}>N</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>
                Nandha Farm
              </p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', whiteSpace: 'nowrap', marginTop: 1 }}>
                Fatehpur · Patiala
              </p>
            </div>
            <div
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#34d399',
                boxShadow: '0 0 7px rgba(52,211,153,0.7)',
                flexShrink: 0, marginLeft: 'auto',
                animation: 'pulseDot 2.5s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      )}

      {/* ── Collapse toggle ───────────────────────── */}
      {!isMobile && (
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            height: 40, border: 'none',
            borderTop: '1px solid rgba(255,255,255,0.055)',
            background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.2)',
            transition: 'color .15s, background .15s',
            flexShrink: 0, gap: 6,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#14b8a6';
            (e.currentTarget as HTMLElement).style.background = 'rgba(20,184,166,0.07)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.2)';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          {collapsed
            ? <Menu size={13} />
            : (
              <>
                <ChevronLeft size={13} />
                <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", letterSpacing: '.04em' }}>
                  Collapse
                </span>
              </>
            )
          }
        </button>
      )}
    </aside>
  );
}