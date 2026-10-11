import React, { useEffect, useRef } from 'react';
import type { BrickColor } from '@lego-wargame-terrain-studio/api';

export interface DeleteAssetModalProps {
  isOpen: boolean;
  assetName: string;
  width: number;
  height: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteAssetModal: React.FC<DeleteAssetModalProps> = ({
  isOpen,
  assetName,
  width,
  height,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        cancelBtnRef.current?.focus();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Fallback for browsers without declarative closedby support (per modern web guidance)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onCancel();
    };

    const handleClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;

      if (!isDialogContent) {
        onCancel();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('click', handleClick);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('click', handleClick);
    };
  }, [onCancel]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      {...{ closedby: 'any' }}
      role="alertdialog"
      aria-labelledby="delete-asset-title"
      aria-describedby="delete-asset-desc"
      className="m-auto rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-2xl max-w-md w-full backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-950/60 text-red-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h2 id="delete-asset-title" className="text-lg font-semibold text-zinc-100">
            Delete Asset?
          </h2>
          <p id="delete-asset-desc" className="mt-2 text-sm text-zinc-400">
            Are you sure you want to delete <strong className="text-zinc-200">"{assetName}"</strong> ({width}×{height} studs)?
            This action cannot be undone and will permanently remove all painted cells.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          ref={cancelBtnRef}
          type="button"
          onClick={onCancel}
          data-testid="modal-cancel-btn"
          className="rounded bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          data-testid="modal-confirm-delete-btn"
          className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors"
        >
          Delete Asset
        </button>
      </div>
    </dialog>
  );
};
