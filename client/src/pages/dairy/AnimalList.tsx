// client/src/pages/dairy/AnimalList.tsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../lib/api'
import Modal from '../../components/ui/Modal'
import { formatDate } from '../../lib/utils'
import { AddAnimalForm } from './AddAnimalForm'
import { useDebounce } from '../../hooks/useDebounce'
import {
  ALL_STAGES,
  STATUS_DOT,
  STATUS_BG,
  STATUS_TEXT,
  STATUS_LABEL,
} from '../../lib/animalStatus'
import type { AnimalType, Animal } from '../../types/index'

export default function AnimalList() {
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const animalType: AnimalType = type === 'buffalo' ? 'BUFFALO' : 'COW'
  const isCow  = animalType === 'COW'
  const accent = isCow ? '#2563eb' : '#0f172a'

  const [animals, setAnimals]         = useState<Animal[]>([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd]         = useState(false)
  const [view, setView]               = useState<'grid' | 'list'>('grid')

  // Debounce search so we don't filter on every keystroke
  const debouncedSearch = useDebounce(search, 250)

  const loadAnimals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = { type: animalType }
      if (statusFilter) params.status = statusFilter
      // FIX: use the configured api instance so the auth interceptor fires
      const res = await api.get('/dairy/animals', { params })
      setAnimals(res.data?.data ?? res.data ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load animals')
    } finally {
      setLoading(false)
    }
  }, [animalType, statusFilter])

  useEffect(() => { loadAnimals() }, [loadAnimals])

  const filtered = animals.filter((a) => {
    if (!debouncedSearch) return true
    const s = debouncedSearch.toLowerCase()
    return (
      (a.tagNo ?? '').toLowerCase().includes(s) ||
      (a.name  ?? '').toLowerCase().includes(s) ||
      (a.breed ?? '').toLowerCase().includes(s)
    )
  })

  const counts: Record<string, number> = {}
  animals.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1 })

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f8fafc' }}>
      {/* Toolbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/dairy')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, padding: 0 }}>←</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>{isCow ? '🐄 Cow Herd' : '🐃 Buffalo Herd'}</h1>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
            {filtered.length} animal{filtered.length !== 1 ? 's' : ''}{statusFilter ? ` · ${STATUS_LABEL[statusFilter] ?? statusFilter}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3 }}>
          {(['grid', 'list'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: view === v ? '#fff' : 'transparent', color: view === v ? '#0f172a' : '#94a3b8', boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              {v === 'grid' ? '⊞ Grid' : '☰ List'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add Animal</button>
      </div>

      <div style={{ padding: '16px 24px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tag, name, breed…"
              style={{ height: 36, paddingLeft: 32, paddingRight: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', width: 220 }}
            />
          </div>
          <button onClick={() => setStatusFilter('')} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: !statusFilter ? accent : '#f1f5f9', color: !statusFilter ? '#fff' : '#475569' }}>
            All ({animals.length})
          </button>
          {ALL_STAGES.filter((s) => (counts[s.value] ?? 0) > 0).map((s) => (
            <button key={s.value} onClick={() => setStatusFilter(s.value)} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: statusFilter === s.value ? (STATUS_BG[s.value] ?? '#f1f5f9') : '#f1f5f9',
              color:      statusFilter === s.value ? (STATUS_TEXT[s.value] ?? '#475569') : '#475569',
              border:     statusFilter === s.value ? `1px solid ${STATUS_DOT[s.value] ?? '#94a3b8'}40` : '1px solid transparent',
            }}>
              {s.label} ({counts[s.value]})
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading herd…</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ fontSize: 48, margin: '0 0 12px' }}>{isCow ? '🐄' : '🐃'}</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#475569', margin: '0 0 4px' }}>No animals found</p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Add your first {isCow ? 'cow' : 'buffalo'} to start tracking</p>
          </div>
        )}

        {/* Grid view */}
        {!loading && filtered.length > 0 && view === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {filtered.map((animal) => {
              const dot = STATUS_DOT[animal.status] ?? '#94a3b8'
              const bg  = STATUS_BG[animal.status]  ?? '#f8fafc'
              const tx  = STATUS_TEXT[animal.status] ?? '#475569'
              const lbl = STATUS_LABEL[animal.status] ?? animal.status
              return (
                <div
                  key={animal._id}
                  onClick={() => navigate(`/dairy/${type}/${animal._id}`)}
                  style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = accent; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 14px ${accent}18` }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: accent + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{isCow ? '🐄' : '🐃'}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: bg, color: tx, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />{lbl}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>{animal.name || animal.tagNo}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 12px' }}>Tag: {animal.tagNo}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 8px', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                    <Pair label="Breed"  value={animal.breed} />
                    <Pair label="Gender" value={animal.gender} />
                    <Pair label="DOB"    value={formatDate(animal.dateOfBirth ?? '')} />
                    <Pair label="Weight" value={animal.currentWeight ? `${animal.currentWeight}kg` : '-'} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List view */}
        {!loading && filtered.length > 0 && view === 'list' && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Tag No', 'Name', 'Breed', 'Stage', 'Gender', 'DOB', 'Weight'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((animal, i) => {
                  const dot = STATUS_DOT[animal.status] ?? '#94a3b8'
                  const bg  = STATUS_BG[animal.status]  ?? '#f8fafc'
                  const tx  = STATUS_TEXT[animal.status] ?? '#475569'
                  const lbl = STATUS_LABEL[animal.status] ?? animal.status
                  return (
                    <tr
                      key={animal._id}
                      onClick={() => navigate(`/dairy/${type}/${animal._id}`)}
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = '#fff'}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: accent }}>{animal.tagNo}</td>
                      <td style={{ padding: '10px 14px', color: '#0f172a' }}>{animal.name || '-'}</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>{animal.breed}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: bg, color: tx, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot }} />{lbl}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>{animal.gender}</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>{formatDate(animal.dateOfBirth ?? '')}</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>{animal.currentWeight ? `${animal.currentWeight} kg` : '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={`Add New ${isCow ? 'Cow' : 'Buffalo'}`} size="lg">
        <AddAnimalForm
          animalType={animalType}
          onSuccess={() => { setShowAdd(false); loadAnimals() }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, color: '#94a3b8', margin: '0 0 1px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
      <p style={{ fontSize: 12, color: '#334155', margin: 0, fontWeight: 500 }}>{value || '-'}</p>
    </div>
  )
}
