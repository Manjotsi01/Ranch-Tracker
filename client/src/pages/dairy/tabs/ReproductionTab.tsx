// client/src/pages/dairy/tabs/ReproductionTab.tsx
import { useEffect, useState } from 'react'
import { Plus, Loader2, Baby, Syringe } from 'lucide-react'
import { useReproduction } from '../../../hooks/useDairyData'
import Button from '../../../components/ui/Button'
import { Input, Select, TextArea } from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Table from '../../../components/ui/Table'
import StatCard from '../../../components/ui/StatCard'
import { formatDate } from '../../../lib/utils'
import { AI_STATUSES } from '../../../lib/constant'
import type { AIRecord, CalvingRecord } from '../../../types/index'

interface Props { animalId: string }

export function ReproductionTab({ animalId }: Props) {
  const { data, aiRecords, calvingRecords, loading, fetch, addAI, addCalving } = useReproduction(animalId)
  const [showAI, setShowAI] = useState(false)
  const [showCalving, setShowCalving] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiForm, setAiForm] = useState({
    date: '', semenBullName: '', semenCode: '', technicianName: '',
    status: 'DONE', pregnancyCheckDate: '', notes: '',
  })
  const [calvForm, setCalvForm] = useState({
    date: '', calfGender: 'FEMALE', calfTagNo: '',
    calfWeight: '', complications: '', notes: '',
  })

  useEffect(() => { fetch() }, [fetch])

  const aiStatusOpts = AI_STATUSES.map((s) => ({ value: s.value, label: s.label }))
  const genderOpts = [{ value: 'FEMALE', label: 'Female' }, { value: 'MALE', label: 'Male' }]

  const handleAISubmit = async () => {
    setSaving(true)
    try {
      await addAI(aiForm)
      setShowAI(false)
      setAiForm({ date: '', semenBullName: '', semenCode: '', technicianName: '', status: 'DONE', pregnancyCheckDate: '', notes: '' })
      fetch()
    } catch { } finally { setSaving(false) }
  }

  const handleCalvingSubmit = async () => {
    setSaving(true)
    try {
      await addCalving({ ...calvForm, calfWeight: calvForm.calfWeight ? Number(calvForm.calfWeight) : undefined })
      setShowCalving(false)
      fetch()
    } catch { } finally { setSaving(false) }
  }

  const aiColumns = [
    { key: 'date', header: 'Date', render: (r: AIRecord) => formatDate(r.date) },
    { key: 'semenBullName', header: 'Bull / Semen', render: (r: AIRecord) => r.semenBullName ?? r.semenCode ?? '—' },
    { key: 'technicianName', header: 'Technician', render: (r: AIRecord) => r.technicianName ?? '—' },
    { key: 'status', header: 'Status', render: (r: AIRecord) => <Badge variant={r.status}>{r.status.replace('_', ' ')}</Badge> },
    { key: 'pregnancyCheckDate', header: 'PD Check', render: (r: AIRecord) => formatDate(r.pregnancyCheckDate ?? '') },
  ]

  const calvColumns = [
    { key: 'date', header: 'Date', render: (r: CalvingRecord) => formatDate(r.date) },
    { key: 'calfTagNo', header: 'Calf Tag', render: (r: CalvingRecord) => r.calfTagNo ?? '—' },
    { key: 'calfGender', header: 'Gender', render: (r: CalvingRecord) => <Badge variant="">{r.calfGender}</Badge> },
    { key: 'calfWeight', header: 'Weight', render: (r: CalvingRecord) => r.calfWeight ? `${r.calfWeight} kg` : '—' },
    { key: 'complications', header: 'Complications', render: (r: CalvingRecord) => r.complications ?? '—' },
  ]

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Pregnancy" value={data.currentPregnancyStatus.replace('_', ' ')} icon={<Baby size={20} />} />
          <StatCard label=  "Total Calvings" value={data.totalCalvings} icon={<Baby size={20} />} />
          <StatCard label="Last Calving" value={formatDate(data.lastCalvingDate ?? '')} icon={<Baby size={20} />} />
          <StatCard label="AI Attempts" value={data.totalAIAttempts} icon={<Syringe size={20} />} />
        </div>
      )}

      {data?.expectedDueDate && (
        <div className="bg-pink-50 border border-pink-200 rounded-xl px-4 py-3 text-sm text-pink-800 font-medium">
          🐣 Expected due date: <strong>{formatDate(data.expectedDueDate)}</strong>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Loader2 size={15} className="animate-spin" /> Loading…
        </div>
      )}

      {/* AI Records */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">AI Records</p>
          <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => setShowAI(true)}>Add AI</Button>
        </div>
        <Table
          columns={aiColumns}
          data={aiRecords}
          keyExtractor={(r:any) => r._id}
          emptyState="No AI records yet."
        />
      </div>

      {/* Calving Records */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Calving Records</p>
          <Button size="sm" variant="secondary" leftIcon={<Plus size={13} />} onClick={() => setShowCalving(true)}>Add Calving</Button>
        </div>
        <Table
          columns={calvColumns}
          data={calvingRecords}
          keyExtractor={(r: any) => r._id}
          emptyState="No calving records yet."
        />
      </div>

      {/* AI Modal */}
      <Modal
        open={showAI}
        onClose={() => setShowAI(false)}
        title="Add AI Record"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowAI(false)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleAISubmit}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Date *" type="date" value={aiForm.date} onChange={(e) => setAiForm({ ...aiForm, date: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Bull Name" value={aiForm.semenBullName} onChange={(e) => setAiForm({ ...aiForm, semenBullName: e.target.value })} placeholder="Bull name" />
            <Input label="Semen Code" value={aiForm.semenCode} onChange={(e) => setAiForm({ ...aiForm, semenCode: e.target.value })} placeholder="Code" />
          </div>
          <Input label="Technician" value={aiForm.technicianName} onChange={(e) => setAiForm({ ...aiForm, technicianName: e.target.value })} />
          <Select label="Status" options={aiStatusOpts} value={aiForm.status} onChange={(e) => setAiForm({ ...aiForm, status: e.target.value })} />
          <Input label="PD Check Date" type="date" value={aiForm.pregnancyCheckDate} onChange={(e) => setAiForm({ ...aiForm, pregnancyCheckDate: e.target.value })} />
          <TextArea label="Notes" value={aiForm.notes} onChange={(e) => setAiForm({ ...aiForm, notes: e.target.value })} />
        </div>
      </Modal>

      {/* Calving Modal */}
      <Modal
        open={showCalving}
        onClose={() => setShowCalving(false)}
        title="Add Calving Record"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowCalving(false)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleCalvingSubmit}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Calving Date *" type="date" value={calvForm.date} onChange={(e) => setCalvForm({ ...calvForm, date: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Calf Gender" options={genderOpts} value={calvForm.calfGender} onChange={(e) => setCalvForm({ ...calvForm, calfGender: e.target.value })} />
            <Input label="Calf Tag No" value={calvForm.calfTagNo} onChange={(e) => setCalvForm({ ...calvForm, calfTagNo: e.target.value })} placeholder="Tag" />
          </div>
          <Input label="Calf Weight (kg)" type="number" value={calvForm.calfWeight} onChange={(e) => setCalvForm({ ...calvForm, calfWeight: e.target.value })} />
          <Input label="Complications" value={calvForm.complications} onChange={(e) => setCalvForm({ ...calvForm, complications: e.target.value })} />
          <TextArea label="Notes" value={calvForm.notes} onChange={(e:any) => setCalvForm({ ...calvForm, notes: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}