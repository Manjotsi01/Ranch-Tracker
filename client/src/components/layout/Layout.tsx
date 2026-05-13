// src/components/layout/Layout.tsx
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const SW = isMobile ? 0 : collapsed ? 60 : 228;

  return (
    <div
      style={{
        display: 'flex',
        height: '100dvh',
        width: '100vw',
        overflow: 'hidden',
        background: '#0a0f1c',
        position: 'relative',
      }}
    >
      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 98,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
          }}
        />
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <div
          style={{
            width: SW, minWidth: SW, maxWidth: SW,
            height: '100dvh', flexShrink: 0, zIndex: 10,
            transition: 'width .22s cubic-bezier(.4,0,.2,1), min-width .22s, max-width .22s',
            overflow: 'hidden',
          }}
        >
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        </div>
      )}

      {/* Mobile sidebar drawer */}
      {isMobile && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0,
            height: '100dvh', width: 240, zIndex: 99,
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
          }}
        >
          <Sidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            isMobile
            onClose={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div
        style={{
          flex: 1, minWidth: 0,
          display: 'flex', flexDirection: 'column',
          height: '100dvh', overflow: 'hidden',
        }}
      >
        <Topbar
          collapsed={collapsed}
          onMenuClick={() => isMobile ? setMobileOpen(o => !o) : setCollapsed(c => !c)}
          isMobile={isMobile}
        />
        <main
          style={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
            background: '#0a0f1c',
            padding: isMobile ? '16px 14px' : '22px 26px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.09) transparent',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}