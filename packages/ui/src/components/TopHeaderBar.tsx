import React from 'react';
import type { AssetSummary } from '@lego-wargame-terrain-studio/domain';
import { Button, NumberInput, Select, Badge } from './design_system/index.js';

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
  return (
    <header className="flex h-12 w-full items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 text-zinc-100 select-none">
      {/* Left: Branding, Selector, Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-amber-500 shadow-sm" />
          <span className="font-semibold text-sm tracking-wide text-zinc-100">
            Brick Wargame Terrain Studio
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-800" />

        <div className="flex items-center gap-2">
          <Select
            data-testid="asset-selector-dropdown"
            value={currentAssetId}
            onChange={(e) => onSelectAsset(e.target.value)}
          >
            {availableAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </Select>

          <Badge variant="subtle" data-testid="header-asset-name">
            {assetName}
          </Badge>

          <Button
            data-testid="header-new-asset-btn"
            variant="secondary"
            size="xs"
            onClick={onNewAsset}
          >
            + New
          </Button>

          <Button
            data-testid="header-delete-asset-btn"
            variant="destructive"
            size="xs"
            onClick={onDeleteClick}
          >
            🗑 Delete
          </Button>
        </div>
      </div>

      {/* Right: Dimensions & Grid Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <label className="flex items-center gap-1.5">
            <span>W:</span>
            <NumberInput
              data-testid="header-width-input"
              value={width}
              min={1}
              max={1000}
              onCommit={(newW) => onDimensionsChange(newW, height)}
              className="w-14 text-right"
            />
          </label>
          <span>×</span>
          <label className="flex items-center gap-1.5">
            <span>H:</span>
            <NumberInput
              data-testid="header-height-input"
              value={height}
              min={1}
              max={1000}
              onCommit={(newH) => onDimensionsChange(width, newH)}
              className="w-14 text-right"
            />
          </label>
        </div>

        <div className="h-4 w-px bg-zinc-800" />

        <Button
          data-testid="header-grid-toggle-btn"
          variant="secondary"
          size="xs"
          isActive={showGrid}
          onClick={onToggleGrid}
        >
          Grid: {showGrid ? 'On' : 'Off'}
        </Button>

        <Button
          data-testid="header-export-print-btn"
          variant="secondary"
          size="xs"
          onClick={onExportPrint}
        >
          🖨️ Export for Printing
        </Button>
      </div>
    </header>
  );
};
