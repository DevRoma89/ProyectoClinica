import type { PopupProps } from './types';

const variantStyles = {
  danger: 'bg-red-600 hover:bg-red-500',
  info: 'bg-blue-600 hover:bg-blue-500',
  success: 'bg-green-600 hover:bg-green-500',
};

export default function Popup({
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  showCancel = true,
  variant = 'info',
  onConfirm,
  onCancel,
}: PopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          {showCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded-lg transition"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
