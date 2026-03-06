export interface PopupProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info' | 'success';
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}
