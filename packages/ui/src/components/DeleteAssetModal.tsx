import React from 'react';
import { Modal, Button } from './design_system/index.js';

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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Delete Asset?"
      footer={
        <>
          <Button
            data-testid="modal-cancel-btn"
            variant="secondary"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            data-testid="modal-confirm-delete-btn"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
          >
            Delete Asset
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-950/60 text-red-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <p id="delete-asset-desc" className="text-xs text-zinc-400 leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-zinc-200">"{assetName}"</strong> ({width}×{height} studs)?
            This action cannot be undone and will permanently remove all painted cells.
          </p>
        </div>
      </div>
    </Modal>
  );
};
