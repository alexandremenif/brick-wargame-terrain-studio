import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { BoundingBoxStore } from './store/BoundingBoxStore.js';
import type { ViewportStorageService } from './storage/ViewportStorageService.js';
import { LocalStorageViewportStorage } from './storage/adapters.js';

export interface StudioAppProps {
  apiClient?: TerrainApiClient;
  storage?: ViewportStorageService;
}

export const StudioApp: React.FC<StudioAppProps> = ({ apiClient, storage }) => {
  // Viewport storage service reference
  const storageService = useMemo(() => storage || new LocalStorageViewportStorage(), [storage]);

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

  // Bounding box state synchronized with BoundingBoxStore
  const [boundingBox, setBoundingBoxState] = useState<BoundingBox>({
    x: 0,
    y: 0,
    width: 32,
    height: 32,
  });

  const bboxStoreRef = useRef<BoundingBoxStore | null>(null);

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

          const store = new BoundingBoxStore(
            first.asset.id,
            first.asset.width,
            first.asset.height,
            storageService
          );
          bboxStoreRef.current = store;
          setBoundingBoxState(store.getState());
          store.subscribe((next) => setBoundingBoxState(next));
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

          const store = new BoundingBoxStore(
            created.asset.id,
            created.asset.width,
            created.asset.height,
            storageService
          );
          bboxStoreRef.current = store;
          setBoundingBoxState(store.getState());
          store.subscribe((next) => setBoundingBoxState(next));
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, [client, storageService]);

  // Select asset handler
  const handleSelectAsset = async (assetId: string) => {
    try {
      const res = await client.getAsset({ assetId });
      setCurrentAsset(res.asset);

      if (bboxStoreRef.current) {
        bboxStoreRef.current.setAsset(res.asset.id, res.asset.width, res.asset.height);
        setBoundingBoxState(bboxStoreRef.current.getState());
      }
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

      if (bboxStoreRef.current) {
        bboxStoreRef.current.setAsset(res.asset.id, res.asset.width, res.asset.height);
        setBoundingBoxState(bboxStoreRef.current.getState());
      }

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

      if (bboxStoreRef.current) {
        bboxStoreRef.current.syncAssetDimensions(width, height);
      }

      const assetsList = await client.listAssets({});
      setAvailableAssets(assetsList.assets);
    } catch (err) {
      console.error('Update dimensions error:', err);
    }
  };

  // Delete confirm
  const handleConfirmDelete = async () => {
    if (!currentAsset) return;
    const deletedId = currentAsset.id;
    try {
      await client.deleteAsset({ assetId: deletedId });
      bboxStoreRef.current?.removeAsset(deletedId);
      storageService.removeBoundingBox(deletedId);
      setIsDeleteModalOpen(false);

      const assetsList = await client.listAssets({});
      if (assetsList.assets.length > 0) {
        setAvailableAssets(assetsList.assets);
        const next = await client.getAsset({ assetId: assetsList.assets[0].id });
        setCurrentAsset(next.asset);

        if (bboxStoreRef.current) {
          bboxStoreRef.current.setAsset(next.asset.id, next.asset.width, next.asset.height);
          setBoundingBoxState(bboxStoreRef.current.getState());
        }
      } else {
        // Bootstrap new default asset with unique ID
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

        if (bboxStoreRef.current) {
          bboxStoreRef.current.setAsset(created.asset.id, created.asset.width, created.asset.height);
          setBoundingBoxState(bboxStoreRef.current.getState());
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Bounding box action wrappers delegating to BoundingBoxStore
  const handleBoundingBoxChange = (partial: Partial<BoundingBox>) => {
    bboxStoreRef.current?.setBoundingBox(partial);
  };

  const handlePanBy = (deltaX: number, deltaY: number) => {
    bboxStoreRef.current?.panBy(deltaX, deltaY);
  };

  const handleCenterAt = (targetX: number, targetY: number) => {
    bboxStoreRef.current?.centerAt(targetX, targetY);
  };

  const handleZoom = (factor: number) => {
    bboxStoreRef.current?.zoom(factor);
  };

  const handleFitToAsset = () => {
    bboxStoreRef.current?.fitToAsset();
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
          onPanBy={handlePanBy}
          onZoom={handleZoom}
        />

        {/* Right Inspector & Minimap */}
        <RightInspectorSidebar
          assetWidth={currentAsset.width}
          assetHeight={currentAsset.height}
          cells={currentAsset.cells}
          colorsById={colorsById}
          boundingBox={boundingBox}
          onBoundingBoxChange={handleBoundingBoxChange}
          onFitToAsset={handleFitToAsset}
          onZoomIn={() => handleZoom(0.8)}
          onZoomOut={() => handleZoom(1.25)}
          onCenterAt={handleCenterAt}
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
