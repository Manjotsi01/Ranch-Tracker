// client/src/pages/dairy/AddAnimalForm.tsx

import { useState } from 'react'
import { Input, Select, TextArea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAnimals } from '../../hooks/useAnimals'
import { ANIMAL_STATUSES, ANIMAL_GENDERS, COW_BREEDS, BUFFALO_BREEDS } from '../../lib/constant'
import type { AnimalType } from '../../types/index'

interface Props {
  animalType: AnimalType
  onSuccess: () => void
  onCancel: () => void
  initialData?: Record<string, unknown>
}

export function AddAnimalForm({ animalType, onSuccess, onCancel, initialData }: Props) {
  const { createAnimal, loading, error } = useAnimals()

  const breeds = animalType === 'COW' ? COW_BREEDS : BUFFALO_BREEDS
  const breedOptions  = breeds.map((b) => ({ value: b, label: b }))
  const statusOptions = ANIMAL_STATUSES.map((s) => ({ value: s.value, label: s.label }))
  const genderOptions = ANIMAL_GENDERS.map((g) => ({ value: g.value, label: g.label }))

  const [form, setForm] = useState({
    tagNo:          String(initialData?.tagNo ?? initialData?.tagNumber ?? ''),
    name:           String(initialData?.name ?? ''),
    type:           animalType,
    gender:         String(initialData?.gender ?? 'FEMALE'),
    // FIX: default breed to first option so it's never empty — breed is required in schema
    breed:          String(initialData?.breed ?? breeds[0] ?? ''),
    dateOfBirth:    String(initialData?.dateOfBirth ?? ''),
    status:         String(initialData?.status ?? 'CALF'),
    purchaseDate:   String(initialData?.purchaseDate ?? ''),
    purchaseCost:   String(initialData?.purchaseCost ?? initialData?.purchasePrice ?? ''),
    currentWeight:  String(initialData?.currentWeight ?? initialData?.weight ?? ''),
    color:          String(initialData?.color ?? ''),
    damTag:         String((initialData?.bloodline as { damTag?: string })?.damTag ?? ''),
    sireSemen:      String((initialData?.bloodline as { sireSemen?: string })?.sireSemen ?? ''),
    geneticNotes:   String((initialData?.bloodline as { geneticNotes?: string })?.geneticNotes ?? ''),
    notes:          String(initialData?.notes ?? ''),
  })

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // FIX: validate required fields client-side before hitting the API
    if (!form.tagNo.trim()) {
      alert('Tag No is required')
      return
    }
    if (!form.breed) {
      alert('Breed is required')
      return
    }
    try {
      const payload = {
        // FIX: send both tagNo and tagNumber so the service accepts either
        tagNo:        form.tagNo,
        tagNumber:    form.tagNo,
        name:         form.name,
        type:         animalType,
        breed:        form.breed,
        // FIX: send FEMALE/MALE directly — no title-case conversion
        gender:       form.gender,
        status:       form.status,
        dateOfBirth:  form.dateOfBirth  || undefined,
        purchaseDate: form.purchaseDate || undefined,
        // FIX: send as purchaseCost (service maps to both fields)
        purchaseCost: form.purchaseCost ? parseFloat(form.purchaseCost) : undefined,
        currentWeight: form.currentWeight ? parseFloat(form.currentWeight) : undefined,
        color:        form.color || undefined,
        bloodline: {
          damTag:       form.damTag       || undefined,
          sireSemen:    form.sireSemen    || undefined,
          geneticNotes: form.geneticNotes || undefined,
        },
        notes: form.notes || undefined,
      }

      await createAnimal(payload)
      onSuccess()
    } catch (err) {
      // Error is already captured in useAnimals hook state
      console.error('Failed to create animal:', err)
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tag No *"
          value={form.tagNo}
          onChange={(e) => set('tagNo', e.target.value)}
          placeholder="e.g. COW-001"
          required
        />
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Lakshmi"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Breed *"
          options={breedOptions}
          value={form.breed}
          onChange={(e) => set('breed', e.target.value)}
          placeholder="Select breed"
        />
        <Select
          label="Gender"
          options={genderOptions}
          value={form.gender}
          onChange={(e) => set('gender', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => set('dateOfBirth', e.target.value)}
        />
        <Select
          label="Status"
          options={statusOptions}
          value={form.status}
          onChange={(e) => set('status', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Purchase Date"
          type="date"
          value={form.purchaseDate}
          onChange={(e) => set('purchaseDate', e.target.value)}
        />
        <Input
          label="Purchase Cost (₹)"
          type="number"
          value={form.purchaseCost}
          onChange={(e) => set('purchaseCost', e.target.value)}
          placeholder="0"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Weight (kg)"
          type="number"
          value={form.currentWeight}
          onChange={(e) => set('currentWeight', e.target.value)}
          placeholder="kg"
        />
        <Input
          label="Color / Marking"
          value={form.color}
          onChange={(e) => set('color', e.target.value)}
          placeholder="e.g. Black & White"
        />
      </div>

      {/* Bloodline */}
      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Bloodline</p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Dam Tag (Mother)"
            value={form.damTag}
            onChange={(e) => set('damTag', e.target.value)}
            placeholder="Mother's tag"
          />
          <Input
            label="Sire / Semen Code"
            value={form.sireSemen}
            onChange={(e) => set('sireSemen', e.target.value)}
            placeholder="Bull/semen code"
          />
        </div>
        <div className="mt-3">
          <TextArea
            label="Genetic Notes"
            value={form.geneticNotes}
            onChange={(e) => set('geneticNotes', e.target.value)}
            placeholder="Any genetic notes…"
          />
        </div>
      </div>

      <TextArea
        label="Notes"
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
        placeholder="Additional notes…"
      />

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={loading}>Save Animal</Button>
      </div>
    </div>
  )
}