// client/src/pages/dairy/tabs/HealthTab.tsx
import { useEffect, useState } from 'react'
import { Plus, AlertTriangle, Shield, Stethoscope } from 'lucide-react'
import { useHealth } from '../../../hooks/useDairyData'
import Button from '../../../components/ui/Button'
import { Input, Select, TextArea } from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Badge from '../../../components/ui/Badge'
import Table from '../../../components/ui/Table'
import StatCard from '../../../components/ui/StatCard'
import { formatDate, formatCurrency } from '../../../lib/utils'
import { VACCINE_STATUSES } from '../../../lib/constant'
import type { VaccinationRecord, TreatmentRecord } from '../../../types/index'

interface Props { animalId: string }

export function HealthTab({ animalId }: Props) {
  const { data, vaccinations, treatments, loading, error, fetch, addVaccination, addTreatment } = useHealth(animalId)
  const [showVacc, setShowVacc] = useState(false)
  const [showTreat, setShowTreat] = useState(false)
  const [saving, setSaving] = useState(false)

  const [vaccForm, setVaccForm] = useState({
    vaccineName: '', date: '', nextDueDate: '',
    dosage: '', veterinarianName: '', cost: '', status: 'GIVEN', notes: '',
  })
  const [treatForm, setTreatForm] = useState({
    date: '', diagnosis: '', medicines: '',
    veterinarianName: '', cost: '', followUpDate: '', notes: '',
  })

  useEffect(() => { fetch() }, [fetch])

  const statusOpts = VACCINE_STATUSES.map((s) => ({ value: s.value, label: s.label }))

  const handleVaccSubmit = async () => {
    setSaving(true)
    try {
      await addVaccination({ ...vaccForm, cost: vaccForm.cost ? Number(vaccForm.cost) : undefined })
      setShowVacc(false)
      fetch()
    } catch { } finally { setSaving(false) }
  }

  const handleTreatSubmit = async () => {
    setSaving(true)
    try {
      await addTreatment({
        ...treatForm,
        cost: treatForm.cost ? Number(treatForm.cost) : undefined,
        medicines: treatForm.medicines ? treatForm.medicines.split(',').map((m) => m.trim()) : [],
      })
      setShowTreat(false)
      fetch()
    } catch { } finally { setSaving(false) }
  }

  const vaccColumns = [
    { key: 'vaccineName', header: 'Vaccine', render: (r: VaccinationRecord) => <span className="font-medium">{r.vaccineName}</span> },
    { key: 'date', header: 'Date Given', render: (r: VaccinationRecord) => formatDate(r.date) },
    { key: 'nextDueDate', header: 'Next Due', render: (r: VaccinationRecord) => formatDate(r.nextDueDate) },
    { key: 'status', header: 'Status', render: (r: VaccinationRecord) => <Badge variant={r.status}>{r.status}</Badge> },
   { key: 'cost', header: 'Cost', render: (r: VaccinationRecord) => r.cost != null ? formatCurrency(r.cost) : '—' },
    { key: 'veterinarianName', header: 'Vet', render: (r: VaccinationRecord) => r.veterinarianName ?? '—' },
  ]

  const treatColumns = [
    { key: 'date', header: 'Date', render: (r: TreatmentRecord) => formatDate(r.date) },
    { key: 'diagnosis', header: 'Diagnosis', render: (r: TreatmentRecord) => <span className="font-medium">{r.diagnosis}</span> },
    { key: 'medicines', header: 'Medicines', render: (r: TreatmentRecord) => r.medicines?.join(', ') ?? '—' },
    { key: 'cost', header: 'Cost', render: (r: TreatmentRecord) => formatCurrency(r.cost) },
    { key: 'followUpDate', header: 'Follow Up', render: (r: TreatmentRecord) => formatDate(r.followUpDate) },
  ]

  // Overdue & upcoming alerts
  const overdue = vaccinations.filter((v) => v.status === 'OVERDUE')
  const due = vaccinations.filter((v) => v.status === 'DUE')

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Vaccination Cost" value={formatCurrency(data.totalVaccinationCost)} icon={<Shield className="w-4 h-4" />} iconBg="bg-green-50" iconColor="text-green-600" />
          <StatCard label="Treatment Cost" value={formatCurrency(data.totalTreatmentCost)} icon={<Stethoscope className="w-4 h-4" />} iconBg="bg-red-50" iconColor="text-red-600" />
          <StatCard label="Total Health Cost" value={formatCurrency((data.totalVaccinationCost ?? 0) + (data.totalTreatmentCost ?? 0))} icon={<AlertTriangle className="w-4 h-4" />} iconBg="bg-orange-50" iconColor="text-orange-600" />
        </div>
      )}

      {/* Alerts */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-red-700 mb-1">⚠ Overdue Vaccinations</p>
          {overdue.map((v) => (
            <p key={v._id} className="text-sm text-red-700">
              {v.vaccineName} — was due {formatDate(v.nextDueDate)}
            </p>
          ))}
        </div>
      )}
      {due.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-yellow-700 mb-1">📅 Upcoming Vaccinations</p>
          {due.map((v) => (
            <p key={v._id} className="text-sm text-yellow-700">
              {v.vaccineName} — due {formatDate(v.nextDueDate)}
            </p>
          ))}
        </div>
      )}

      {/* Vaccinations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Vaccinations</p>
          <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => setShowVacc(true)}>Add</Button>
        </div>
        <Table columns={vaccColumns} data={vaccinations} keyExtractor={(r: any) => r._id} loading={loading} emptyState="No vaccination records." />
      </div>

      {/* Treatments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Treatments</p>
          <Button size="sm" variant="secondary" leftIcon={<Plus size={13} />} onClick={() => setShowTreat(true)}>Add</Button>
        </div>
        <Table columns ={treatColumns} data={treatments} keyExtractor={(r : any) => r._id} loading={loading} emptyState="No treatment records." />
      </div>

      {/* Vaccination Modal */}
      <Modal
        open={showVacc}
        onClose={() => setShowVacc(false)}
        title="Add Vaccination"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowVacc(false)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleVaccSubmit}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Vaccine Name *" value={vaccForm.vaccineName} onChange={(e) => setVaccForm({ ...vaccForm, vaccineName: e.target.value })} placeholder="e.g. FMD vaccine" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date Given *" type="date" value={vaccForm.date} onChange={(e) => setVaccForm({ ...vaccForm, date: e.target.value })} />
            <Input label="Next Due Date" type="date" value={vaccForm.nextDueDate} onChange={(e) => setVaccForm({ ...vaccForm, nextDueDate: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Dosage" value={vaccForm.dosage} onChange={(e) => setVaccForm({ ...vaccForm, dosage: e.target.value })} placeholder="e.g. 2ml" />
            <Input label="Cost (₹)" type="number" value={vaccForm.cost} onChange={(e) => setVaccForm({ ...vaccForm, cost: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Veterinarian" value={vaccForm.veterinarianName} onChange={(e) => setVaccForm({ ...vaccForm, veterinarianName: e.target.value })} />
            <Select label="Status" options={statusOpts} value={vaccForm.status} onChange={(e) => setVaccForm({ ...vaccForm, status: e.target.value })} />
          </div>
          <TextArea label="Notes" value={vaccForm.notes} onChange={(e :any) => setVaccForm({ ...vaccForm, notes: e.target.value })} />
        </div>
      </Modal>

      {/* Treatment Modal */}
      <Modal
        open={showTreat}
        onClose={() => setShowTreat(false)}
        title="Add Treatment"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowTreat(false)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleTreatSubmit}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Date *" type="date" value={treatForm.date} onChange={(e) => setTreatForm({ ...treatForm, date: e.target.value })} />
          <Input label="Diagnosis *" value={treatForm.diagnosis} onChange={(e) => setTreatForm({ ...treatForm, diagnosis: e.target.value })} placeholder="e.g. Mastitis" />
          <Input label="Medicines (comma-separated)" value={treatForm.medicines} onChange={(e) => setTreatForm({ ...treatForm, medicines: e.target.value })} placeholder="e.g. Antibiotic, Paracetamol" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cost (₹)" type="number" value={treatForm.cost} onChange={(e) => setTreatForm({ ...treatForm, cost: e.target.value })} />
            <Input label="Veterinarian" value={treatForm.veterinarianName} onChange={(e) => setTreatForm({ ...treatForm, veterinarianName: e.target.value })} />
          </div>
          <Input label="Follow Up Date" type="date" value={treatForm.followUpDate} onChange={(e) => setTreatForm({ ...treatForm, followUpDate: e.target.value })} />
          <TextArea label="Notes" value={treatForm.notes} onChange={(e :any) => setTreatForm({ ...treatForm, notes: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}