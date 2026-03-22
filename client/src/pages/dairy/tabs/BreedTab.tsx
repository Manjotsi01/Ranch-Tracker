// client/src/pages/dairy/tabs/BreedTab.tsx
import { formatDate, formatCurrency } from '../../../lib/utils'
import type { Animal } from '../../../types/index'

interface Props { animal: Animal; accent: string }

export function BreedTab({ animal, accent }: Props) {
  const sections = [
    {
      title: '🪪 Identity',
      rows: [
        { label: 'Animal ID / Tag', value: animal.tagNo },
        { label: 'Name',            value: animal.name ?? '—' },
        { label: 'Species',         value: animal.type },
        { label: 'Breed',           value: animal.breed },
        { label: 'Gender',          value: animal.gender },
        { label: 'Color / Marking', value: animal.color ?? '—' },
        { label: 'Current Status',  value: animal.status },
      ],
    },
    {
      title: '📅 Timeline',
      rows: [
        { label: 'Date of Birth',   value: formatDate(animal.dateOfBirth ?? '') },
        { label: 'Purchase Date',   value: formatDate(animal.purchaseDate ?? '') },
        { label: 'Purchase Cost',   value: animal.purchaseCost != null ? formatCurrency(animal.purchaseCost) : '—' },
        { label: 'Current Weight',  value: animal.currentWeight != null ? `${animal.currentWeight} kg` : '—' },
        { label: 'Registered On',   value: formatDate(animal.createdAt) },
      ],
    },
  ]

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Breed highlight card */}
      <div style={{
        background: `linear-gradient(135deg, ${accent}08 0%, ${accent}14 100%)`,
        border: `1.5px solid ${accent}25`,
        borderRadius: 14, padding: '18px 22px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 12, background: accent + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0,
        }}>
          🧬
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>
            Breed Classification
          </p>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{animal.breed}</p>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            {animal.type === 'COW' ? 'Bovine — Bos taurus' : 'Buffalo — Bubalus bubalis'} · {animal.gender}
          </p>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {sections.map((sec) => (
          <div key={sec.title} style={{
            background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 12px' }}>
              {sec.title}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sec.rows.map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bloodline */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 14px' }}>
          🌳 Bloodline & Genetics
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Dam */}
          <LineageCard
            title="Dam (Mother)"
            id={animal.bloodline?.damTag ?? animal.bloodline?.damId}
            icon="🐄"
            accent={accent}
          />
          {/* Sire */}
          <LineageCard
            title="Sire / Bull"
            id={animal.bloodline?.sireSemen ?? animal.bloodline?.bullName}
            icon="🐂"
            accent={accent}
          />
        </div>

        {animal.bloodline?.geneticNotes && (
          <div style={{ marginTop: 14, padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 4px' }}>
              Genetic Notes
            </p>
            <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.5 }}>
              {animal.bloodline.geneticNotes}
            </p>
          </div>
        )}
      </div>

      {/* Notes */}
      {animal.notes && (
        <div style={{
          marginTop: 16, background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a',
          padding: '14px 18px',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 6px' }}>
            📝 Notes
          </p>
          <p style={{ fontSize: 13, color: '#78350f', margin: 0, lineHeight: 1.6 }}>{animal.notes}</p>
        </div>
      )}
    </div>
  )
}

function LineageCard({ title, id, icon, accent }: { title: string; id?: string; icon: string; accent: string }) {
  return (
    <div style={{
      border: `1px dashed ${accent}30`, borderRadius: 10, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.7, margin: '0 0 2px' }}>
          {title}
        </p>
        <p style={{ fontSize: 13, fontWeight: 600, color: id ? '#334155' : '#cbd5e1', margin: 0 }}>
          {id ?? 'Not recorded'}
        </p>
      </div>
    </div>
  )
}