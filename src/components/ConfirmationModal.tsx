import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  details?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  details,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            {variant === 'danger' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            {variant === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {variant === 'primary' && <Info className="w-5 h-5 text-zinc-300" />}
            <h3 id="modal-title" className="text-sm font-semibold tracking-wide text-zinc-100">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close dialog"
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-zinc-300 leading-relaxed">{message}</p>
          {details && <div className="mt-2 text-xs">{details}</div>}
        </div>

        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-zinc-950/60 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-lg border border-zinc-700/80 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500'
                : variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-500 text-black font-semibold focus:ring-amber-500'
                : 'bg-zinc-100 hover:bg-white text-zinc-900 font-semibold focus:ring-zinc-400'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
