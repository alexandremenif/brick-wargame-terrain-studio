import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdropClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  closeOnBackdropClick = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    const handleClick = (e: MouseEvent) => {
      if (closeOnBackdropClick && e.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('click', handleClick);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('click', handleClick);
    };
  }, [onClose, closeOnBackdropClick]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      className="m-auto rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-2xl max-w-md w-full backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div>
        <h2 className="font-semibold text-base text-zinc-100">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
      </div>

      <div className="mt-4 text-xs text-zinc-300 leading-relaxed">{children}</div>

      {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
    </dialog>
  );
}
