import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#10b981" />,
    error: <AlertCircle size={18} color="#ef4444" />,
    info: <Info size={18} color="#3b82f6" />
  };

  return (
    <div className="toast" role="alert">
      {icons[toast.type] || icons.success}
      <span>{toast.message}</span>
    </div>
  );
}
