// Path: ranch-tracker/client/src/pages/agriculture/CropDetail.tsx

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Calendar, Sprout, TrendingUp,
  TrendingDown, IndianRupee, Scale, ChevronRight
} from 'lucide-react';
import api from '../../lib/api';
import type { Crop, CropSeason } from '../../types/index';
import { useSeasons } from '../../hooks/Useseasons';
import { formatCurrency, formatDateRange } from '../../lib/utils';
import { ARABLE_CROPS, VEGETABLE_GROUPS, SEASON_STATUSES } from '../../lib/constant';
import AlertPanel from '../../components/shared/AlertPanel';
import CreateSeasonModal from '../../components/CreateSeasonModal';

const allStaticCrops = [
  ...ARABLE_CROPS,
  ...Object.values(VEGETABLE_GROUPS).flatMap((g) => g.crops),
];

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  ACTIVE:    { bg: '#eaf4ea', color: '#1a5c1a', dot: '#237a23' },
  PLANNED:   { bg: '#f0ece0', color: '#6b5a2a', dot: '#b09040' },
  HARVESTED: { bg: '#fff4d6', color: '#8a5a00', dot: '#f5a623' },
  COMPLETED: { bg: '#e8f0e8', color: '#2a5a2a', dot: '#3a7a3a' },
  ABANDONED: { bg: '#fdecea', color: '#8a2a2a', dot: '#c0392b' },
};

export default function CropDetail() {
  const { cropId } = useParams<{ cropId: string }>();
  const navigate = useNavigate();
  const { fetchSeasonsByCrop, loading: seasonsLoading } = useSeasons();

  const [crop, setCrop] = useState<Crop | null>(null);
  const [seasons, setSeasons] = useState<CropSeason[]>([]);
  const [loadingCrop, setLoadingCrop] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const staticCrop = allStaticCrops.find((c) => c.id === cropId);

const loadData = useCallback(async () => {
  if (!cropId) return;

  setLoadingCrop(true);
  setError(null);

  try {
    // Fetch seasons regardless — they may exist even if no aggregate crop doc
    const seasonsData = await fetchSeasonsByCrop(cropId);
    setSeasons(seasonsData || []);

    // Try to get aggregated crop stats — 404 is fine, it just means no seasons yet
    try {
      const cropRes = await api.get<{ data: Crop }>(`/agriculture/crops/${cropId}`);
      setCrop(cropRes.data.data);
    } catch {
      // No seasons exist yet — use static crop data, not an error
      setCrop(null);
    }

  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : 'Failed to load seasons');
  } finally {
    setLoadingCrop(false);
  }
}, [cropId, fetchSeasonsByCrop]);

  useEffect(() => { loadData(); }, [loadData]);

  const cropName = crop?.name ?? staticCrop?.name ?? cropId;
  const cropLocalName = (crop as unknown as { localName?: string })?.localName ?? staticCrop?.localName;

  const totalExpense = seasons.reduce((s, se) => s + (se.totalExpense ?? 0), 0);
  const totalRevenue = seasons.reduce((s, se) => s + (se.totalRevenue ?? 0), 0);
  const totalProfit  = totalRevenue - totalExpense;
  const totalArea    = seasons.reduce((s, se) => s + (se.areaSown ?? 0), 0);

  const filteredSeasons = statusFilter === 'ALL'
    ? seasons
    : seasons.filter((s) => s.status === statusFilter);

  return (
    <div style={{ background: '#f5f0e8', minHeight: '100%' }}>

      {/* Header bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1a5c1a 0%, #237a23 60%, #e8960e 100%)',
        padding: '20px 24px', borderRadius: 16, marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate('/agriculture')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', marginBottom: 14,
            }}>
            <ArrowLeft size={13} /> Back to Agriculture
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,255,255,0.18)',
                border: '2px solid rgba(255,255,255,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sprout size={22} color="#fff" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: "'Syne',sans-serif" }}>
                  {cropName}
                </h1>
                {cropLocalName && (
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                    {cropLocalName} · {seasons.length} season{seasons.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <button onClick={() => setShowCreate(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#f5a623', color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 18px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              }}>
              <Plus size={15} /> New Season
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16 }}>
          <AlertPanel
            alerts={[{ id: '1', type: 'danger', message: error, module: 'System', createdAt: new Date().toISOString() }]}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Area Sown',  value: loadingCrop ? '...' : `${totalArea.toFixed(1)} ac`,          icon: <Scale size={16} />,       accent: '#237a23' },
          { label: 'Expenses',   value: loadingCrop ? '...' : formatCurrency(totalExpense, true),    icon: <IndianRupee size={16} />, accent: '#e8960e' },
          { label: 'Revenue',    value: loadingCrop ? '...' : formatCurrency(totalRevenue, true),    icon: <TrendingUp size={16} />,  accent: '#237a23' },
          {
            label: 'Net Profit', value: loadingCrop ? '...' : formatCurrency(totalProfit, true),
            icon: totalProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />,
            accent: totalProfit >= 0 ? '#237a23' : '#c0392b',
          },
        ].map((k) => (
          <div key={k.label} style={{
            background: '#fff', borderRadius: 13,
            border: `2px solid ${k.accent}22`,
            padding: '16px 16px 14px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#8a7a50', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                {k.label}
              </span>
              <span style={{
                width: 28, height: 28, borderRadius: 7,
                background: `${k.accent}18`,
                color: k.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{k.icon}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1a3a0a', fontFamily: "'Syne',sans-serif" }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Seasons section */}
      <div style={{
        background: '#fff', borderRadius: 16,
        border: '2px solid #e0d5c0', padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={16} color="#237a23" />
            <span style={{ fontSize: 15, fontWeight: 800, color: '#1a3a0a', fontFamily: "'Syne',sans-serif" }}>
              Farming Seasons
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['ALL', ...SEASON_STATUSES.map((s) => s.value)].map((s) => {
              const cfg = s !== 'ALL' ? STATUS_CONFIG[s] : null;
              const isActive = statusFilter === s;
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', border: '1.5px solid',
                    background: isActive ? (cfg?.bg ?? '#e8dfc8') : '#fff',
                    color:      isActive ? (cfg?.color ?? '#3d2e0e') : '#8a7a50',
                    borderColor: isActive ? (cfg?.dot ?? '#b09040') : '#e0d5c0',
                    transition: 'all 0.15s',
                  }}>
                  {s === 'ALL' ? 'All' : SEASON_STATUSES.find((st) => st.value === s)?.label ?? s}
                </button>
              );
            })}
          </div>
        </div>

        {seasonsLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
            {[1,2,3].map((i) => (
              <div key={i} style={{ height: 120, borderRadius: 12, background: '#f0ebe0', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : filteredSeasons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Sprout size={36} color="#d4c9a8" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: 14, color: '#8a7a50', fontWeight: 600 }}>No seasons found</p>
            <p style={{ margin: '4px 0 16px', fontSize: 12, color: '#b0a07a' }}>Create a season to start tracking this crop</p>
            <button onClick={() => setShowCreate(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#1a5c1a', color: '#fff', border: 'none',
                borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>
              <Plus size={14} /> Create First Season
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
            {filteredSeasons.map((season) => (
              <SeasonCard key={season.seasonId} season={season}
                onClick={() => navigate(`/agriculture/seasons/${season.seasonId}`)} />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateSeasonModal
          cropId={cropId!} cropName={cropName ?? ''}
          onClose={() => setShowCreate(false)}
          onCreated={(s) => { setSeasons((p) => [s, ...p]); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

function SeasonCard({ season, onClick }: { season: CropSeason; onClick: () => void }) {
  const profit = (season.totalRevenue ?? 0) - (season.totalExpense ?? 0);
  const cfg = STATUS_CONFIG[season.status] ?? STATUS_CONFIG.PLANNED;
  const [hov, setHov] = useState(false);

  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff', textAlign: 'left',
        border: `2px solid ${hov ? '#f5a623' : cfg.dot + '55'}`,
        borderRadius: 12, padding: '16px',
        cursor: 'pointer',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov ? '0 6px 18px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.18s',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a0a', fontFamily: "'Syne',sans-serif" }}>
            {season.label}
          </div>
          {season.variety && (
            <div style={{ fontSize: 10, color: '#8a7a50', marginTop: 1 }}>{season.variety}</div>
          )}
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.dot}55`,
          flexShrink: 0, marginLeft: 6,
        }}>
          {season.status}
        </span>
      </div>

      <div style={{ fontSize: 11, color: '#8a7a50', marginBottom: 12 }}>
        {formatDateRange(season.startDate, season.endDate)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, borderTop: '1px solid #f0e8d8', paddingTop: 10 }}>
        {[
          { label: 'Area',    value: `${season.areaSown} ${season.areaUnit}`,              color: '#1a5c1a' },
          { label: 'Expense', value: formatCurrency(season.totalExpense ?? 0, true),       color: '#8a5a00' },
          { label: 'Profit',  value: formatCurrency(profit, true), color: profit >= 0 ? '#1a5c1a' : '#c0392b' },
        ].map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 8, color: '#8a7a50', textTransform: 'uppercase', letterSpacing: 0.4 }}>{s.label}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginTop: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <ChevronRight size={13} color="#c8b880" style={{ position: 'absolute' as const, display: 'none' }} />
    </button>
  );
}