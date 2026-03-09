export type PopupVariant = 'danger' | 'info' | 'success';

export interface PopupState {
  title: string;
  message: string;
  variant: PopupVariant;
}

export interface PopupProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: PopupVariant;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}
