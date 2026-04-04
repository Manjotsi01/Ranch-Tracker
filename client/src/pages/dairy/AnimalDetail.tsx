// client/src/pages/dairy/AnimalDetail.tsx

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { formatDate, formatCurrency } from '../../lib/utils'
import { AddAnimalForm } from './AddAnimalForm'
import { BreedTab }        from './tabs/BreedTab'
import { MilkTab }         from './tabs/MilkTab'
import { FeedTab }         from './tabs/FeedingTab'
import { HealthTab }       from './tabs/HealthTab'
import { ReproductionTab } from './tabs/ReproductionTab'
import { ALL_STAGES, STATUS_DOT, STATUS_BG, STATUS_TEXT, STATUS_LABEL } from '../../lib/animalStatus'
import type { Animal, AnimalType } from '../../types/index'

const TABS = [
  { id: 'breed',  label: '🧬 Breed'        },
  { id: 'milk',   label: '🥛 Milk Yield'   },
  { id: 'feed',   label: '🌾 Feeding'       },
  { id: 'health', label: '💉 Health'        },
  { id: 'repro',  label: '🔄 Reproduction' },
]

export default function AnimalDetail() {
  const { type, id } = useParams<{ type: string; id: string }>()
  const navigate = useNavigate()

  const isCow    = type === 'cow'
  const accent   = isCow ? '#2563eb' : '#0f172a'
  const listPath = (type === 'cow' || type === 'buffalo') ? `/dairy/${type}` : '/dairy'

  const [animal, setAnimal]               = useState<Animal | null>(null)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [tab, setTab]                     = useState('breed')
  const [showEdit, setShowEdit]           = useState(false)
  const [showDelete, setShowDelete]       = useState(false)
  const [deleting, setDeleting]           = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const loadAnimal = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      // FIX: use the configured api instance so the auth interceptor fires
      const res = await api.get(`/dairy/animals/${id}`)
      setAnimal(res.data?.data ?? res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load animal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAnimal() }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!animal) return
    setChangingStatus(true)
    setShowStatusMenu(false)
    try {
      await api.put(`/dairy/animals/${id}`, { status: newStatus })
      setAnimal({ ...animal, status: newStatus as Animal['status'] })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update stage')
    } finally {
      setChangingStatus(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/dairy/animals/${id}`)
      navigate(listPath, { replace: true })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete')
      setDeleting(false)
      setShowDelete(false)
    }
  }

  if (type !== 'cow' && type !== 'buffalo') {
    return (
      <div style={{ padding: 32, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: 16, marginBottom: 12 }}>
          ⚠ Invalid URL — expected /dairy/cow/:id or /dairy/buffalo/:id
        </div>
        <button onClick={() => navigate('/dairy')} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>← Back to Dairy</button>
      </div>
    )
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#94a3b8', fontFamily: "'DM Sans', sans-serif" }}>
      Loading…
    </div>
  )

  if (error || !animal) return (
    <div style={{ padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
        {error ?? 'Animal not found'}
      </div>
      <button onClick={() => navigate(listPath)} style={{ marginTop: 12, fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
    </div>
  )

  const dot  = STATUS_DOT[animal.status]   ?? '#94a3b8'
  const sbg  = STATUS_BG[animal.status]    ?? '#f8fafc'
  const stxt = STATUS_TEXT[animal.status]  ?? '#475569'
  const slbl = STATUS_LABEL[animal.status] ?? animal.status

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: '#f8fafc' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ padding: '14px 24px 0' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12, color: '#94a3b8' }}>
            <button onClick={() => navigate('/dairy')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 12 }}>Dairy</button>
            <span>›</span>
            <button onClick={() => navigate(listPath)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 12 }}>
              {isCow ? 'Cows' : 'Buffaloes'}
            </button>
            <span>›</span>
            <span style={{ color: '#475569', fontWeight: 600 }}>{animal.name || animal.tagNo}</span>
          </div>

          {/* Identity row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, flexShrink: 0, background: accent + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, border: `2px solid ${accent}20` }}>
              {isCow ? '🐄' : '🐃'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>{animal.name || animal.tagNo}</h1>

                {/* Stage badge + dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    disabled={changingStatus}
                    style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: sbg, color: stxt, border: `1px solid ${dot}40`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot }} />
                    {changingStatus ? 'Updating…' : slbl}
                    <span style={{ fontSize: 9, marginLeft: 2 }}>▼</span>
                  </button>

                  {showStatusMenu && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 180, overflow: 'hidden' }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, padding: '10px 14px 6px', margin: 0 }}>Change Stage</p>
                      {ALL_STAGES.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => handleStatusChange(s.value)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 14px', border: 'none', background: animal.status === s.value ? '#f8fafc' : '#fff', cursor: 'pointer', fontSize: 13, color: '#334155', fontWeight: animal.status === s.value ? 700 : 400 }}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_DOT[s.value] ?? '#94a3b8', flexShrink: 0 }} />
                          {s.label}
                          {animal.status === s.value && <span style={{ marginLeft: 'auto', color: '#10b981' }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 5, flexWrap: 'wrap' }}>
                <MetaItem label="Tag"    value={animal.tagNo} />
                <MetaItem label="Breed"  value={animal.breed} />
                <MetaItem label="Gender" value={animal.gender} />
                <MetaItem label="DOB"    value={formatDate(animal.dateOfBirth ?? '')} />
                {animal.purchaseCost != null && <MetaItem label="Cost" value={formatCurrency(animal.purchaseCost)} />}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => setShowEdit(true)} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                ✏ Edit
              </button>
              <button onClick={() => setShowDelete(true)} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>
                🗑 Delete
              </button>
            </div>
          </div>

          {/* Tab nav */}
          <div style={{ display: 'flex', gap: 0, marginBottom: -1, overflowX: 'auto' }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                color: tab === t.id ? accent : '#64748b',
                borderBottom: tab === t.id ? `2.5px solid ${accent}` : '2.5px solid transparent',
                transition: 'all 0.15s',
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Error inline */}
      {error && (
        <div style={{ margin: '12px 24px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Tab content — click outside closes dropdown */}
      <div onClick={() => setShowStatusMenu(false)} style={{ padding: '20px 24px' }}>
        {tab === 'breed'  && <BreedTab animal={animal} accent={accent} />}
        {tab === 'milk'   && <MilkTab  animalId={id!} accent={accent} />}
        {tab === 'feed'   && <FeedTab  animalId={id!} accent={accent} />}
        {tab === 'health' && <HealthTab animalId={id!} />}
        {tab === 'repro'  && <ReproductionTab animalId={id!} />}
      </div>

      {/* Edit modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Animal" size="lg">
        <AddAnimalForm
          animalType={(animal.type as AnimalType) ?? (isCow ? 'COW' : 'BUFFALO')}
          initialData={animal as unknown as Record<string, unknown>}
          onSuccess={() => { setShowEdit(false); loadAnimal() }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>

      {/* Delete confirm — no window.confirm() */}
      <ConfirmDialog
        open={showDelete}
        title="Delete animal"
        body={`This will permanently delete ${animal.name || animal.tagNo} and all associated records. Consider changing the stage to Sold or Dead instead.`}
        confirmLabel={deleting ? 'Deleting…' : 'Yes, delete'}
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ fontSize: 12, color: '#64748b' }}>
      <span style={{ color: '#94a3b8', fontWeight: 500 }}>{label}: </span>
      <span style={{ fontWeight: 600, color: '#334155' }}>{value || '—'}</span>
    </span>
  )
}
