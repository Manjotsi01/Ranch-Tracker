// client/src/components/layout/Topbar.tsx
import { useLocation } from 'react-router-dom';
import { Bell, Settings, Menu } from 'lucide-react';

interface TopbarProps {
  collapsed: boolean;
  onMenuClick: () => void;
}

const routeLabels: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/agriculture': 'Agriculture',
  '/dairy':       'Dairy',
  '/shop':        'Shop',
};

function getLabel(pathname: string): string {
  const match = Object.keys(routeLabels)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname.startsWith(key));
  return match ? routeLabels[match] : 'Ranch Tracker';
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();

  return (
    <div style={{
      height: 52,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      background: '#162215',
      borderBottom: '1px solid #1d2e1c',
    }}>
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 6, borderRadius: 7, color: '#4a7c4a',
          display: 'flex', alignItems: 'center',
          marginRight: 10,
        }}
      >
        <Menu size={17} />
      </button>

      <span style={{
        fontSize: 14, fontWeight: 700, color: '#e8f5e9',
        fontFamily: "'Syne',sans-serif", flex: 1,
      }}>
        {getLabel(location.pathname)}
      </span>

      <div style={{ display: 'flex', gap: 4 }}>
        {[Bell, Settings].map((Icon, i) => (
          <button key={i} style={{
            padding: 7, borderRadius: 8,
            background: 'transparent', border: 'none',
            cursor: 'pointer', color: '#4a7c4a',
            display: 'flex', alignItems: 'center',
          }}>
            <Icon size={15} />
          </button>
        ))}
      </div>
    </div>
  );
}