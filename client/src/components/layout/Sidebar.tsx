// Path: ranch-tracker/client/src/components/layout/Sidebar.tsx

import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Leaf, Milk,  ShoppingCart, ChevronRight, ChevronLeft,
} from 'lucide-react';

const nav = [
  { key: 'dashboard',   label: 'Dashboard',  path: '/',           icon: LayoutDashboard, color: '#4ade80' },
  { key: 'agriculture', label: 'Agriculture', path: '/agriculture', icon: Leaf,            color: '#86efac' },
  { key: 'dairy',       label: 'Dairy',       path: '/dairy',       icon: Milk,            color: '#38bdf8' },
  { key: 'shop',        label: 'Shop & POS',  path: '/shop',        icon: ShoppingCart,    color: '#fbbf24' },
];

interface Props { collapsed: boolean; onToggle: () => void; }

export default function Sidebar({ collapsed, onToggle }: Props) {
  const loc = useLocation();

  return (
    <aside style={{
      width: '100%', height: '100%',
      background: '#080c10',
      borderRight: '1px solid #1a2030',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Logo */}
      <div style={{
        height: 52, display: 'flex', alignItems: 'center',
        padding: collapsed ? '0 12px' : '0 14px',
        borderBottom: '1px solid #1a2030',
        gap: 10, flexShrink: 0,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 35, height: 35, borderRadius: 11, background: '#22c55e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: '0 0 12px rgba(34,197,94,0.4)',
        }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#000', fontFamily: 'Syne,sans-serif' }}>RT</span>
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#f0f4f8', fontFamily: 'Syne,sans-serif', lineHeight: 1.1 }}>Ranch</p>
            <p style={{ fontSize: 16, color: '#3a4a5a', letterSpacing: '0.15em', fontFamily: 'Syne,sans-serif' }}>TRACKER</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        {!collapsed && (
          <p style={{ fontSize: 9, color: '#2a3545', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '6px 8px 4px', fontFamily: 'Syne,sans-serif' }}>
        
          </p>
        )}
        {nav.map(item => {
          const Icon = item.icon;
          const active = item.path === '/' ? loc.pathname === '/' : loc.pathname.startsWith(item.path);
          return (
            <NavLink key={item.key} to={item.path} title={collapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: collapsed ? '9px 0' : '7px 9px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8, marginBottom: 1, textDecoration: 'none',
                background: active ? `${item.color}15` : 'transparent',
                color: active ? '#e8f0fe' : '#4a5a6a',
                position: 'relative', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#8a9aaa'; (e.currentTarget as HTMLElement).style.background = active ? `${item.color}15` : '#ffffff08'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active ? '#e8f0fe' : '#4a5a6a'; (e.currentTarget as HTMLElement).style.background = active ? `${item.color}15` : 'transparent'; }}
            >
              {active && !collapsed && (
                <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 2.5, height: 18, background: item.color, borderRadius: 2 }} />
              )}
              <Icon size={14} style={{ color: active ? item.color : 'inherit', flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, flex: 1,
                  fontFamily: 'DM Sans,sans-serif', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              )}
              {!collapsed && !active && <ChevronRight size={11} style={{ opacity: 0.3 }} />}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{ padding: '8px', borderTop: '1px solid #1a2030', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: '#1a2535',
              border: '1px solid #2a3545', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#6a7a8a', fontFamily: 'Syne,sans-serif' }}>N</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6a7a8a', fontFamily: 'DM Sans,sans-serif' }}>Nandha Farm</p>
              <p style={{ fontSize: 9, color: '#2a3545' }}>Fatehpur · Patiala</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button onClick={onToggle} className="hidden lg:flex" style={{
        height: 36, border: 'none', background: '#0d1218',
        borderTop: '1px solid #1a2030',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#2a3545', transition: 'color 0.15s', flexShrink: 0,
      }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#6a7a8a'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#2a3545'}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </aside>
  );
}