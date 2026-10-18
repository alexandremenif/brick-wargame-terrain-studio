import React from 'react';

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
    <wa-dialog
      data-testid="delete-asset-dialog"
      open={isOpen}
      label="Delete Asset?"
      onwa-after-hide={onCancel}
    >
      <div className="studio-modal-warning">
        <div className="studio-modal-warning-icon">
          <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <p id="delete-asset-desc" className="studio-modal-warning-text">
            Are you sure you want to delete{' '}
            <strong style={{ color: 'var(--wa-color-text-normal)' }}>"{assetName}"</strong> ({width}×{height} studs)?
            This action cannot be undone and will permanently remove all painted cells.
          </p>
        </div>
      </div>

      <wa-button
        slot="footer"
        data-testid="modal-cancel-btn"
        variant="neutral"
        size="small"
        onClick={onCancel}
      >
        Cancel
      </wa-button>
      <wa-button
        slot="footer"
        data-testid="modal-confirm-delete-btn"
        variant="danger"
        size="small"
        onClick={onConfirm}
      >
        Delete Asset
      </wa-button>
    </wa-dialog>
  );
};
