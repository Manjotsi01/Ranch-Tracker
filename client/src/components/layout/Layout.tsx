// client/src/components/layout/Layout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SW = collapsed ? 56 : 210;

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#d4d0c8',
    }}>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 98,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Desktop sidebar */}
      <div style={{
        width: SW, minWidth: SW, maxWidth: SW,
        flexShrink: 0,
        height: '100vh',
        zIndex: 99,
        transition: 'width 0.2s ease, min-width 0.2s ease, max-width 0.2s ease',
        overflow: 'hidden',
      }}>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
        />
      </div>

      {/* Mobile sidebar (overlay) */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: 100, width: 210,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.22s ease',
      }}>
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      {/* Right column — column layout, owns the scroll */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Topbar — fixed at top, never scrolls */}
        <Topbar
          collapsed={collapsed}
          onMenuClick={() => setMobileOpen(o => !o)}
        />

        {/* Scrollable page area — THE only scroll container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0px',
          background: '#d4d0c8',
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
