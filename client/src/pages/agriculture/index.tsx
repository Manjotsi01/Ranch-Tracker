// Path: ranch-tracker/client/src/pages/agriculture/index.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wheat, Leaf, ChevronRight, TrendingUp,
  Search, Sprout, Plus
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { ARABLE_CROPS, VEGETABLE_GROUPS } from '../../lib/constant';
import api from '../../lib/api';
import AlertPanel from '../../components/shared/AlertPanel';

type ActiveTab = 'ARABLE' | 'VEGETABLE';

interface CropCardData {
  cropId: string;
  name: string;
  localName?: string;
  stats?: {
    activeSeasonsCount: number;
    totalArea: number;
    totalExpense: number;
    totalRevenue: number;
    totalProfit: number;
  };
  latestSeason?: { label: string; status: string };
}

const ARABLE_IDS = new Set(ARABLE_CROPS.map((c) => c.id));

const S = {
  page: {
    background: '#f5f0e8',
    minHeight: '100%',
  } as React.CSSProperties,

  hero: {
    background: 'linear-gradient(135deg, #1a5c1a 0%, #237a23 55%, #e8960e 100%)',
    padding: '24px 28px 20px',
    borderRadius: 16,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  } as React.CSSProperties,
  heroBg1: {
    position: 'absolute', right: -30, top: -30,
    width: 160, height: 160, borderRadius: '50%',
    background: 'rgba(255,255,255,0.07)',
  } as React.CSSProperties,
  heroBg2: {
    position: 'absolute', right: 60, bottom: -20,
    width: 90, height: 90, borderRadius: '50%',
    background: 'rgba(255,255,255,0.04)',
  } as React.CSSProperties,
  heroInner: {
    position: 'relative', zIndex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
  } as React.CSSProperties,
  heroLeft: { display: 'flex', alignItems: 'center', gap: 14 } as React.CSSProperties,
  heroIcon: {
    width: 48, height: 48, borderRadius: 13,
    background: 'rgba(255,255,255,0.18)',
    border: '2px solid rgba(255,255,255,0.28)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,
  heroTitle: {
    margin: 0, fontSize: 22, fontWeight: 800, color: '#fff',
    fontFamily: "'Syne', sans-serif", letterSpacing: -0.3, lineHeight: 1.1,
  } as React.CSSProperties,
  heroSub: { margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 3 } as React.CSSProperties,
  heroStats: { display: 'flex', gap: 10, flexWrap: 'wrap' } as React.CSSProperties,
  statPill: {
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.22)',
    borderRadius: 10, padding: '8px 16px', textAlign: 'center',
  } as React.CSSProperties,
  statVal: {
    fontSize: 20, fontWeight: 800, color: '#fff',
    fontFamily: "'Syne', sans-serif", lineHeight: 1,
  } as React.CSSProperties,
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 } as React.CSSProperties,

  controls: {
    background: '#fff',
    border: '2px solid #e0d5c0',
    borderRadius: 14,
    padding: '12px 16px',
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  } as React.CSSProperties,
  tabGroup: {
    display: 'flex', borderRadius: 10, overflow: 'hidden',
    border: '2px solid #1a5c1a', flexShrink: 0,
  } as React.CSSProperties,
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f7f3eb', border: '1.5px solid #d4c9a8',
    borderRadius: 9, padding: '7px 13px', marginLeft: 'auto',
  } as React.CSSProperties,

  sectionHead: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 16,
  } as React.CSSProperties,
  sectionBar: {
    width: 4, height: 26, borderRadius: 2, background: '#f5a623', flexShrink: 0,
  } as React.CSSProperties,

  arableGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 12,
  } as React.CSSProperties,
  vegGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
    gap: 10,
  } as React.CSSProperties,

  groupWrap: { marginBottom: 28 } as React.CSSProperties,
  groupHead: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 12, paddingBottom: 8,
    borderBottom: '2px solid #e8dfc8',
  } as React.CSSProperties,
  groupIcon: {
    width: 30, height: 30, borderRadius: 8,
    background: 'linear-gradient(135deg, #237a23, #f5a623)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,
};

export default function AgricultureIndex() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('ARABLE');
  const [crops, setCrops] = useState<CropCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadCrops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/agriculture/crops');
      setCrops((res.data.data ?? []) as CropCardData[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load crops');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCrops(); }, [loadCrops]);

  const arableList = ARABLE_CROPS.map((s) => {
    const match = crops.find((c) => c.cropId === s.id || (c.name != null && c.name.toLowerCase() === s.name.toLowerCase()));
    return { ...s, cropId: s.id, ...(match ?? {}) } as CropCardData & { name: string; localName?: string };
  });

  const vegGroups = Object.entries(VEGETABLE_GROUPS).map(([key, group]) => ({
    key, label: group.label,
    crops: group.crops.map((s) => {
      const match = crops.find((c) => c.cropId === s.id || (c.name != null && c.name.toLowerCase() === s.name.toLowerCase()));
      return { ...s, cropId: s.id, ...(match ?? {}) } as CropCardData & { name: string; localName?: string };
    }),
  }));

  const filter = <T extends { name: string; localName?: string }>(list: T[]) =>
    search.trim()
      ? list.filter((c) =>
          (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.localName ?? '').toLowerCase().includes(search.toLowerCase())
        )
      : list;

  const activeSeasonsTotal = crops
    .filter((c) => activeTab === 'ARABLE' ? ARABLE_IDS.has(c.cropId) : !ARABLE_IDS.has(c.cropId))
    .reduce((a, c) => a + (c.stats?.activeSeasonsCount ?? 0), 0);

  return (
    <div style={S.page}>

      {/* Hero */}
      <div style={S.hero}>
        <div style={S.heroBg1} />
        <div style={S.heroBg2} />
        <div style={S.heroInner}>
          <div style={S.heroLeft}>
            <div style={S.heroIcon}><Sprout size={24} color="#fff" /></div>
            <div>
              <h1 style={S.heroTitle}>Agriculture</h1>
              <p style={S.heroSub}>Crops · Seasons · Expenses · Yield</p>
            </div>
          </div>
          <div style={S.heroStats}>
            {[
              { label: 'Active Seasons', value: loading ? '—' : activeSeasonsTotal },
              { label: 'Tracked Crops',  value: loading ? '—' : crops.length },
            ].map((s) => (
              <div key={s.label} style={S.statPill}>
                <div style={S.statVal}>{s.value}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={S.controls}>
        <div style={S.tabGroup}>
          {([
            { key: 'ARABLE',    label: 'Arable Crops', icon: <Wheat size={14} /> },
            { key: 'VEGETABLE', label: 'Vegetables',   icon: <Leaf  size={14} /> },
          ] as { key: ActiveTab; label: string; icon: React.ReactNode }[]).map((tab) => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearch(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 20px', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', border: 'none', outline: 'none',
                background: activeTab === tab.key ? '#1a5c1a' : '#fff',
                color:       activeTab === tab.key ? '#fff'   : '#1a5c1a',
                transition: 'background 0.15s, color 0.15s',
              }}
            >{tab.icon}{tab.label}</button>
          ))}
        </div>

        <div style={S.searchBox}>
          <Search size={13} color="#8a7a50" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crops..."
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#3d2e0e', width: 180 }}
          />
        </div>

        <button onClick={() => navigate('/agriculture')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', fontSize: 13, fontWeight: 700,
            background: '#f5a623', color: '#fff', border: 'none',
            borderRadius: 9, cursor: 'pointer',
          }}>
          <Plus size={14} /> New Season
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 16 }}>
          <AlertPanel
            alerts={[{ id: '1', type: 'danger', message: error, module: 'System', createdAt: new Date().toISOString() }]}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      {/* Arable Tab */}
      {activeTab === 'ARABLE' && (
        <div>
          <div style={S.sectionHead}>
            <div style={S.sectionBar} />
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1a3a0a', fontFamily: "'Syne',sans-serif" }}>
                Arable Crops
              </h2>
              <p style={{ margin: 0, fontSize: 11, color: '#6b7c50', marginTop: 1 }}>
                {filter(arableList).length} crops — click to manage seasons
              </p>
            </div>
          </div>
          <div style={S.arableGrid}>
            {filter(arableList).map((crop) => (
              <ArableCard key={crop.cropId} crop={crop} loading={loading}
                onClick={() => navigate(`/agriculture/crops/${crop.cropId}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Vegetables Tab */}
      {activeTab === 'VEGETABLE' && (
        <div>
          {vegGroups.map((group) => {
            const filtered = filter(group.crops);
            if (!filtered.length) return null;
            return (
              <div key={group.key} style={S.groupWrap}>
                <div style={S.groupHead}>
                  <div style={S.groupIcon}><Leaf size={14} color="#fff" /></div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#1a3a0a', fontFamily: "'Syne',sans-serif" }}>
                      {group.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#8a7a50' }}>{filtered.length} varieties</div>
                  </div>
                </div>
                <div style={S.vegGrid}>
                  {filtered.map((crop) => (
                    <VegCard key={crop.cropId} crop={crop} loading={loading}
                      onClick={() => navigate(`/agriculture/crops/${crop.cropId}`)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Arable Card ──────────────────────────────────────────────────────────────
function ArableCard({ crop, loading, onClick }: {
  crop: CropCardData & { name: string; localName?: string };
  loading: boolean; onClick: () => void;
}) {
  const active = !!(crop.stats?.activeSeasonsCount);
  const profit = crop.stats?.totalProfit ?? 0;
  const [hov, setHov] = useState(false);

  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: `2px solid ${hov ? '#f5a623' : active ? '#237a23' : '#e0d5c0'}`,
        borderRadius: 13, padding: '14px 12px',
        cursor: 'pointer', textAlign: 'left',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hov ? '0 8px 22px rgba(26,92,26,0.16)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.18s', position: 'relative', overflow: 'hidden',
      }}>
      {active && (
        <div style={{
          position: 'absolute', top: 9, right: 9,
          width: 7, height: 7, borderRadius: '50%', background: '#237a23',
        }} />
      )}
      <div style={{
        width: 34, height: 34, borderRadius: 9, marginBottom: 9,
        background: active ? 'linear-gradient(135deg,#1a5c1a,#237a23)' : '#f0ebe0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Wheat size={17} color={active ? '#fff' : '#a09060'} />
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: '#1a3a0a', lineHeight: 1.25, marginBottom: 2 }}>
        {crop.name}
      </div>
      {crop.localName && (
        <div style={{ fontSize: 10, color: '#8a7a50', marginBottom: 7 }}>{crop.localName}</div>
      )}

      {crop.latestSeason ? (
        <div style={{
          fontSize: 9, fontWeight: 600, color: '#1a5c1a',
          background: '#eaf4ea', borderRadius: 5, padding: '2px 6px',
          display: 'inline-block', marginBottom: 8,
        }}>
          {crop.latestSeason.label}
        </div>
      ) : (
        <div style={{ fontSize: 9, color: '#b0a07a', fontStyle: 'italic', marginBottom: 8 }}>No seasons yet</div>
      )}

      {loading ? (
        <div style={{ height: 7, borderRadius: 4, background: '#e8dfc8' }} />
      ) : crop.stats ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 7, borderTop: '1px solid #f0e8d8' }}>
          <div>
            <div style={{ fontSize: 8, color: '#8a7a50', textTransform: 'uppercase', letterSpacing: 0.4 }}>Active</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#1a5c1a' }}>{crop.stats.activeSeasonsCount}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 8, color: '#8a7a50', textTransform: 'uppercase', letterSpacing: 0.4 }}>Profit</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: profit >= 0 ? '#1a5c1a' : '#c0392b' }}>
              {formatCurrency(profit, true)}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <TrendingUp size={9} color="#c8b880" />
          <span style={{ fontSize: 9, color: '#b0a07a' }}>Tap to track</span>
        </div>
      )}
      <ChevronRight size={12} color="#c8b880"
        style={{ position: 'absolute', bottom: 10, right: 10 }} />
    </button>
  );
}

// ─── Vegetable Card ───────────────────────────────────────────────────────────
function VegCard({ crop, loading, onClick }: {
  crop: CropCardData & { name: string; localName?: string };
  loading: boolean; onClick: () => void;
}) {
  const active = !!(crop.stats?.activeSeasonsCount);
  const [hov, setHov] = useState(false);

  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: `2px solid ${hov ? '#f5a623' : active ? '#e8960e' : '#e0d5c0'}`,
        borderRadius: 11, padding: '12px 11px',
        cursor: 'pointer', textAlign: 'left',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov ? '0 6px 18px rgba(232,150,14,0.18)' : '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.18s',
      }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, marginBottom: 8,
        background: active ? 'linear-gradient(135deg,#f5a623,#e8960e)' : '#f7f3eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Leaf size={14} color={active ? '#fff' : '#b0a07a'} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#1a3a0a', lineHeight: 1.25 }}>{crop.name}</div>
      {crop.localName && (
        <div style={{ fontSize: 9, color: '#8a7a50', marginTop: 2 }}>{crop.localName}</div>
      )}
      {loading ? (
        <div style={{ height: 6, borderRadius: 3, background: '#e8dfc8', marginTop: 7 }} />
      ) : active ? (
        <div style={{
          marginTop: 7, fontSize: 9, fontWeight: 700, color: '#c87800',
          background: '#fff4d6', borderRadius: 4, padding: '2px 5px', display: 'inline-block',
        }}>
          {crop.stats!.activeSeasonsCount} active
        </div>
      ) : (
        <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
          <ChevronRight size={9} color="#c8b880" />
          <span style={{ fontSize: 9, color: '#b0a07a' }}>Add season</span>
        </div>
      )}
    </button>
  );
}