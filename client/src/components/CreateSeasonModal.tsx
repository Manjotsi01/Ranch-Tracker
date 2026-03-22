// client/src/pages/agriculture/components/CreateSeasonModal.tsx
import { useState } from 'react';
import { useSeasons } from '../hooks/Useseasons';
import type { CropSeason } from '../types/index';
import { AREA_UNITS } from '../lib/constant';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import AlertPanel from '../components/shared/AlertPanel';

interface Props {
  cropId: string;
  cropName: string;
  onClose: () => void;
  onCreated: (season: CropSeason) => void;
}

export default function CreateSeasonModal({ cropId, cropName, onClose, onCreated }: Props) {
  const { createSeason, loading, error } = useSeasons();
  const [form, setForm] = useState({
    label: '',
    startDate: '',
    endDate: '',
    variety: '',
    areaSown: '',
    areaUnit: 'acres',
    budget: '',
    notes: '',
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.label || !form.startDate || !form.endDate || !form.areaSown) return;
    const created = await createSeason({
      cropId,
      label: form.label,
      startDate: form.startDate,
      endDate: form.endDate,
      variety: form.variety || undefined,
      areaSown: parseFloat(form.areaSown),
      areaUnit: form.areaUnit,
      budget: form.budget ? parseFloat(form.budget) : 0,
      notes: form.notes || undefined,
      status: 'PLANNED',
    });
    if (created) onCreated(created);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`New Season — ${cropName}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={loading} onClick={handleSubmit}>Create Season</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <AlertPanel
          alerts={[
            {
              id: "season-error",
              type: "danger",
              message: error,
              createdAt: new Date().toISOString(),
              module: "agriculture",
            }
          ]}
        />}

        <Input
          label="Season Label *"
          placeholder="e.g. Rabi 2025-26 or Nov 25 – Apr 26"
          value={form.label}
          onChange={(e) => set('label', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date *"
            type="date"
            value={form.startDate}
            onChange={(e) => set('startDate', e.target.value)}
          />
          <Input
            label="End Date *"
            type="date"
            value={form.endDate}
            onChange={(e) => set('endDate', e.target.value)}
          />
        </div>

        <Input
          label="Variety / Cultivar"
          placeholder="e.g. HD-2781, PB-1509"
          value={form.variety}
          onChange={(e) => set('variety', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Area Sown *"
            type="number"
            placeholder="0.0"
            value={form.areaSown}
            onChange={(e) => set('areaSown', e.target.value)}
          />
          <Select
            label="Area Unit"
            value={form.areaUnit}
            options={AREA_UNITS}
            onChange={(e) => set('areaUnit', e.target.value)}
          />
        </div>

        <Input
          label="Budget (₹)"
          type="number"
          placeholder="Estimated total budget"
          value={form.budget}
          onChange={(e) => set('budget', e.target.value)}
          prefix="₹"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-agri-300 tracking-wide">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Optional notes about this season…"
            rows={2}
            className="rounded-lg border border-agri-800/40 bg-surface-2 px-3 py-2 text-sm text-agri-100 placeholder:text-agri-700 outline-none focus:border-agri-500/60 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}