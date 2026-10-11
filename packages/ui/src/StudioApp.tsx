import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Asset,
  AssetSummary,
  BoundingBox,
  BrickColor,
  CellData,
} from '@lego-wargame-terrain-studio/api';
import { TerrainApiClient } from './generated/client.js';
import { TopHeaderBar } from './components/TopHeaderBar.js';
import { LeftToolboxSidebar, type ToolMode, type BrushSize } from './components/LeftToolboxSidebar.js';
import { CanvasViewport } from './components/CanvasViewport.js';
import { RightInspectorSidebar } from './components/RightInspectorSidebar.js';
import { DeleteAssetModal } from './components/DeleteAssetModal.js';

export interface StudioAppProps {
  apiClient?: TerrainApiClient;
}

export const StudioApp: React.FC<StudioAppProps> = ({ apiClient }) => {
  // Client instance fallback
  const client = useMemo(() => {
    if (apiClient) return apiClient;
    return new TerrainApiClient({
      async call(method, params) {
        const res = await fetch('/rpc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method,
            params: [params],
          }),
        });
        const json = await res.json();
        if (json.error) {
          throw new Error(json.error.message || 'RPC Error');
        }
        return json.result;
      },
    });
  }, [apiClient]);

  // Studio state
  const [availableAssets, setAvailableAssets] = useState<AssetSummary[]>([]);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const [colors, setColors] = useState<BrickColor[]>([]);
  const [toolMode, setToolMode] = useState<ToolMode>('Brush');
  const [brushSize, setBrushSize] = useState<BrushSize>('1x1');
  const [selectedColorId, setSelectedColorId] = useState<number>(15); // Default to Bright Green (ID 15)
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Active Bounding Box state
  const [boundingBox, setBoundingBox] = useState<BoundingBox>({
    x: 0,
    y: 0,
    width: 32,
    height: 32,
  });

  const colorsById = useMemo(() => {
    const map = new Map<number, BrickColor>();
    for (const c of colors) {
      map.set(c.id, c);
    }
    return map;
  }, [colors]);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const colorsRes = await client.listColors({});
        if (colorsRes?.colors) {
          setColors(colorsRes.colors);
          if (colorsRes.colors.length > 0) {
            setSelectedColorId(colorsRes.colors[0].id);
          }
        }

        const assetsRes = await client.listAssets({});
        if (assetsRes?.assets && assetsRes.assets.length > 0) {
          setAvailableAssets(assetsRes.assets);
          const first = await client.getAsset({ assetId: assetsRes.assets[0].id });
          setCurrentAsset(first.asset);
          setBoundingBox({
            x: 0,
            y: 0,
            width: first.asset.width,
            height: first.asset.height,
          });
        } else {
          // Bootstrap default asset if none exist
          const created = await client.createAsset({
            name: 'Modular Outpost',
            width: 32,
            height: 32,
          });
          setCurrentAsset(created.asset);
          setAvailableAssets([
            {
              id: created.asset.id,
              name: created.asset.name,
              width: created.asset.width,
              height: created.asset.height,
              paintedCellsCount: 0,
            },
          ]);
          setBoundingBox({ x: 0, y: 0, width: 32, height: 32 });
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, [client]);

  // Select asset handler
  const handleSelectAsset = async (assetId: string) => {
    try {
      const res = await client.getAsset({ assetId });
      setCurrentAsset(res.asset);
      setBoundingBox({
        x: 0,
        y: 0,
        width: res.asset.width,
        height: res.asset.height,
      });
    } catch (err) {
      console.error('Select asset error:', err);
    }
  };

  // Create new asset
  const handleNewAsset = async () => {
    const name = prompt('Enter new asset name:', 'New Asset');
    if (!name) return;
    try {
      const res = await client.createAsset({ name, width: 32, height: 32 });
      setCurrentAsset(res.asset);
      setBoundingBox({ x: 0, y: 0, width: 32, height: 32 });
      const assetsList = await client.listAssets({});
      setAvailableAssets(assetsList.assets);
    } catch (err) {
      console.error('New asset error:', err);
    }
  };

  // Dimensions update
  const handleDimensionsChange = async (width: number, height: number) => {
    if (!currentAsset) return;
    try {
      const res = await client.updateAsset({
        assetId: currentAsset.id,
        width,
        height,
      });
      setCurrentAsset(res.asset);

      // Clamp bounding box if needed
      setBoundingBox((prev) => ({
        x: Math.min(prev.x, Math.max(0, width - 1)),
        y: Math.min(prev.y, Math.max(0, height - 1)),
        width: Math.min(prev.width, width),
        height: Math.min(prev.height, height),
      }));

      const assetsList = await client.listAssets({});
      setAvailableAssets(assetsList.assets);
    } catch (err) {
      console.error('Update dimensions error:', err);
    }
  };

  // Delete confirm
  const handleConfirmDelete = async () => {
    if (!currentAsset) return;
    try {
      await client.deleteAsset({ assetId: currentAsset.id });
      setIsDeleteModalOpen(false);

      const assetsList = await client.listAssets({});
      if (assetsList.assets.length > 0) {
        setAvailableAssets(assetsList.assets);
        const next = await client.getAsset({ assetId: assetsList.assets[0].id });
        setCurrentAsset(next.asset);
        setBoundingBox({ x: 0, y: 0, width: next.asset.width, height: next.asset.height });
      } else {
        // Bootstrap new default asset
        const created = await client.createAsset({
          name: 'Modular Outpost',
          width: 32,
          height: 32,
        });
        setCurrentAsset(created.asset);
        setAvailableAssets([
          {
            id: created.asset.id,
            name: created.asset.name,
            width: created.asset.width,
            height: created.asset.height,
            paintedCellsCount: 0,
          },
        ]);
        setBoundingBox({ x: 0, y: 0, width: 32, height: 32 });
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Fit to Asset action
  const handleFitToAsset = () => {
    if (!currentAsset) return;
    setBoundingBox({
      x: 0,
      y: 0,
      width: currentAsset.width,
      height: currentAsset.height,
    });
  };

  // Paint handler (Optimistic UI + API dispatch)
  const handlePaint = useCallback(
    async (x: number, y: number, width: number, height: number, colorId: number | null) => {
      if (!currentAsset) return;

      // Optimistic local state update
      setCurrentAsset((prev) => {
        if (!prev) return prev;
        const cellMap = new Map<string, number>();
        for (const c of prev.cells) {
          cellMap.set(`${c.x},${c.y}`, c.colorId);
        }

        const minX = Math.max(0, x);
        const minY = Math.max(0, y);
        const maxX = Math.min(prev.width - 1, x + width - 1);
        const maxY = Math.min(prev.height - 1, y + height - 1);

        for (let cx = minX; cx <= maxX; cx++) {
          for (let cy = minY; cy <= maxY; cy++) {
            const key = `${cx},${cy}`;
            if (colorId === null) {
              cellMap.delete(key);
            } else {
              cellMap.set(key, colorId);
            }
          }
        }

        const newCells: CellData[] = [];
        for (const [key, cid] of cellMap.entries()) {
          const [cx, cy] = key.split(',').map(Number);
          newCells.push({ x: cx, y: cy, colorId: cid });
        }

        return {
          ...prev,
          paintedCellsCount: newCells.length,
          cells: newCells,
        };
      });

      // API call
      try {
        await client.paintArea({
          assetId: currentAsset.id,
          bbox: { x, y, width, height },
          colorId,
        });
      } catch (err) {
        console.error('Paint error:', err);
      }
    },
    [client, currentAsset]
  );

  if (!currentAsset) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading Brick Studio...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 font-sans text-zinc-100">
      {/* Top Header Bar */}
      <TopHeaderBar
        assetName={currentAsset.name}
        width={currentAsset.width}
        height={currentAsset.height}
        availableAssets={availableAssets}
        currentAssetId={currentAsset.id}
        showGrid={showGrid}
        onSelectAsset={handleSelectAsset}
        onNewAsset={handleNewAsset}
        onDeleteClick={() => setIsDeleteModalOpen(true)}
        onDimensionsChange={handleDimensionsChange}
        onToggleGrid={() => setShowGrid(!showGrid)}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbox */}
        <LeftToolboxSidebar
          toolMode={toolMode}
          brushSize={brushSize}
          selectedColorId={selectedColorId}
          colors={colors}
          onSelectToolMode={setToolMode}
          onSelectBrushSize={setBrushSize}
          onSelectColor={setSelectedColorId}
        />

        {/* Central Canvas Viewport */}
        <CanvasViewport
          boundingBox={boundingBox}
          cells={currentAsset.cells}
          colorsById={colorsById}
          showGrid={showGrid}
          toolMode={toolMode}
          brushSize={brushSize}
          selectedColorId={selectedColorId}
          onPaint={handlePaint}
        />

        {/* Right Inspector & Minimap */}
        <RightInspectorSidebar
          assetWidth={currentAsset.width}
          assetHeight={currentAsset.height}
          cells={currentAsset.cells}
          colorsById={colorsById}
          boundingBox={boundingBox}
          onBoundingBoxChange={setBoundingBox}
          onFitToAsset={handleFitToAsset}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteAssetModal
        isOpen={isDeleteModalOpen}
        assetName={currentAsset.name}
        width={currentAsset.width}
        height={currentAsset.height}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
