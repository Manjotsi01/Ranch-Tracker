// client/src/components/shared/ConfirmDialog.tsx
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle, Info } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      description={body}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 py-2">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            danger ? 'bg-red-500/10' : 'bg-blue-500/10'
          }`}
        >
          {danger
            ? <AlertTriangle size={18} className="text-red-400" />
            : <Info size={18} className="text-blue-400" />
          }
        </div>
        {body && (
          <p className="text-sm text-[#6a8a7a] leading-relaxed pt-1">
            {body}
          </p>
        )}
      </div>
    </Modal>
  );
}