// client/src/components/shared/ExportBtn.tsx
import { Download } from 'lucide-react';
import Button from '../ui/Button';

interface ExportBtnProps {
  onClick?: () => void;
  label?: string;
  loading?: boolean;
}

export default function ExportBtn({ onClick, label = 'Export', loading }: ExportBtnProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      icon={<Download size={13} />}
      loading={loading}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}