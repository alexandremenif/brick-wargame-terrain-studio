import React, { useState } from 'react';
import type { AssetSummary } from '@lego-wargame-terrain-studio/api';

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
}) => {
  const [localWidth, setLocalWidth] = useState(String(width));
  const [localHeight, setLocalHeight] = useState(String(height));

  // Sync if prop changes externally
  React.useEffect(() => {
    setLocalWidth(String(width));
  }, [width]);

  React.useEffect(() => {
    setLocalHeight(String(height));
  }, [height]);

  const handleWidthBlur = () => {
    const val = parseInt(localWidth, 10);
    if (isNaN(val) || val < 1) {
      setLocalWidth('1');
      onDimensionsChange(1, height);
    } else {
      const clamped = Math.min(1000, val);
      setLocalWidth(String(clamped));
      onDimensionsChange(clamped, height);
    }
  };

  const handleHeightBlur = () => {
    const val = parseInt(localHeight, 10);
    if (isNaN(val) || val < 1) {
      setLocalHeight('1');
      onDimensionsChange(width, 1);
    } else {
      const clamped = Math.min(1000, val);
      setLocalHeight(String(clamped));
      onDimensionsChange(width, clamped);
    }
  };

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
          <select
            data-testid="asset-selector-dropdown"
            value={currentAssetId}
            onChange={(e) => onSelectAsset(e.target.value)}
            className="rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-200 outline-none hover:border-zinc-700 focus:border-zinc-600"
          >
            {availableAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </select>

          <span data-testid="header-asset-name" className="text-xs text-zinc-400 font-medium px-2 py-0.5 rounded bg-zinc-800/50">
            {assetName}
          </span>

          <button
            type="button"
            data-testid="header-new-asset-btn"
            onClick={onNewAsset}
            className="rounded border border-zinc-800 bg-zinc-800/80 px-2 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            + New
          </button>

          <button
            type="button"
            data-testid="header-delete-asset-btn"
            onClick={onDeleteClick}
            className="rounded border border-red-900/50 bg-red-950/20 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
          >
            🗑 Delete
          </button>
        </div>
      </div>

      {/* Right: Dimensions & Grid Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <label className="flex items-center gap-1.5">
            <span>W:</span>
            <input
              type="number"
              data-testid="header-width-input"
              value={localWidth}
              onChange={(e) => setLocalWidth(e.target.value)}
              onBlur={handleWidthBlur}
              className="w-14 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 text-right outline-none focus:border-zinc-700"
            />
          </label>
          <span>×</span>
          <label className="flex items-center gap-1.5">
            <span>H:</span>
            <input
              type="number"
              data-testid="header-height-input"
              value={localHeight}
              onChange={(e) => setLocalHeight(e.target.value)}
              onBlur={handleHeightBlur}
              className="w-14 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 text-right outline-none focus:border-zinc-700"
            />
          </label>
        </div>

        <div className="h-4 w-px bg-zinc-800" />

        <button
          type="button"
          data-testid="header-grid-toggle-btn"
          onClick={onToggleGrid}
          className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
            showGrid
              ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
              : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Grid: {showGrid ? 'On' : 'Off'}
        </button>
      </div>
    </header>
  );
};
