import React, { useState, useEffect } from 'react';
import type { AssetSummary } from '@lego-wargame-terrain-studio/domain';

export interface TopHeaderBarProps {
  assetName: string;
  width: number;
  height: number;
  availableAssets: AssetSummary[];
  currentAssetId: string;
  showGrid: boolean;
  onSelectAsset: (assetId: string) => void;
  onNewAsset: () => void;
  onDeleteClick: () => void;
  onDimensionsChange: (width: number, height: number) => void;
  onToggleGrid: () => void;
  onExportPrint?: () => void;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  assetName,
  width,
  height,
  availableAssets,
  currentAssetId,
  showGrid,
  onSelectAsset,
  onNewAsset,
  onDeleteClick,
  onDimensionsChange,
  onToggleGrid,
  onExportPrint,
}) => {
  const [localWidth, setLocalWidth] = useState<string>(String(width));
  const [localHeight, setLocalHeight] = useState<string>(String(height));

  useEffect(() => {
    setLocalWidth(String(width));
  }, [width]);

  useEffect(() => {
    setLocalHeight(String(height));
  }, [height]);

  const commitWidth = (valStr: string) => {
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 1000) {
      onDimensionsChange(parsed, height);
    } else {
      setLocalWidth(String(width));
    }
  };

  const commitHeight = (valStr: string) => {
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 1000) {
      onDimensionsChange(width, parsed);
    } else {
      setLocalHeight(String(height));
    }
  };

  return (
    <header className="studio-header wa-split" data-testid="studio-top-header">
      {/* Left: Branding, Selector, Actions */}
      <div className="wa-cluster">
        <div className="wa-cluster" style={{ gap: 'var(--wa-space-2xs)' }}>
          <div className="studio-brand-badge" />
          <span className="studio-brand-title">Brick Wargame Terrain Studio</span>
        </div>

        <div className="studio-header-divider" />

        <div className="wa-cluster" style={{ gap: 'var(--wa-space-xs)' }}>
          <wa-select
            data-testid="asset-selector-dropdown"
            className="studio-asset-select"
            size="small"
            value={currentAssetId}
            onwa-change={(e: any) => onSelectAsset(e.target.value)}
            onChange={(e: any) => onSelectAsset(e.target.value)}
          >
            {availableAssets.map((asset) => (
              <wa-option key={asset.id} value={asset.id}>
                {asset.name}
              </wa-option>
            ))}
          </wa-select>

          <wa-badge variant="neutral" appearance="accent" data-testid="header-asset-name">
            {assetName}
          </wa-badge>

          <wa-button
            data-testid="header-new-asset-btn"
            variant="neutral"
            size="small"
            onClick={onNewAsset}
          >
            + New
          </wa-button>

          <wa-button
            data-testid="header-delete-asset-btn"
            variant="danger"
            size="small"
            onClick={onDeleteClick}
          >
            🗑 Delete
          </wa-button>
        </div>
      </div>

      {/* Right: Dimensions, Grid, Export */}
      <div className="wa-cluster">
        <div className="wa-cluster studio-field-label" style={{ gap: 'var(--wa-space-2xs)' }}>
          <label className="wa-cluster" style={{ gap: 'var(--wa-space-3xs)' }}>
            <span>W:</span>
            <wa-input
              data-testid="header-width-input"
              type="number"
              size="small"
              min={1}
              max={1000}
              value={localWidth}
              className="studio-dimension-input"
              onwa-input={(e: any) => setLocalWidth(e.target.value)}
              onInput={(e: any) => setLocalWidth(e.target.value)}
              onBlur={(e: any) => commitWidth(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  commitWidth((e.target as any).value);
                } else if (e.key === 'Escape') {
                  setLocalWidth(String(width));
                }
              }}
            />
          </label>
          <span>×</span>
          <label className="wa-cluster" style={{ gap: 'var(--wa-space-3xs)' }}>
            <span>H:</span>
            <wa-input
              data-testid="header-height-input"
              type="number"
              size="small"
              min={1}
              max={1000}
              value={localHeight}
              className="studio-dimension-input"
              onwa-input={(e: any) => setLocalHeight(e.target.value)}
              onInput={(e: any) => setLocalHeight(e.target.value)}
              onBlur={(e: any) => commitHeight(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  commitHeight((e.target as any).value);
                } else if (e.key === 'Escape') {
                  setLocalHeight(String(height));
                }
              }}
            />
          </label>
        </div>

        <div className="studio-header-divider" />

        <wa-button
          data-testid="header-grid-toggle-btn"
          variant={showGrid ? 'brand' : 'neutral'}
          size="small"
          onClick={onToggleGrid}
        >
          Grid: {showGrid ? 'On' : 'Off'}
        </wa-button>

        <wa-button
          data-testid="header-export-print-btn"
          variant="neutral"
          size="small"
          onClick={onExportPrint}
        >
          🖨️ Export for Printing
        </wa-button>
      </div>
    </header>
  );
};
