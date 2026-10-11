import React, { useState } from 'react';
import { TopHeaderBar } from './TopHeaderBar.js';
import { LeftToolboxSidebar, type ToolType } from './LeftToolboxSidebar.js';
import { RightInspectorSidebar, type BoundingBoxState } from './RightInspectorSidebar.js';
import { BottomStatusBar } from './BottomStatusBar.js';
import { CanvasViewport } from './CanvasViewport.js';
import { terrainEngineService } from '../core/service.js';

export function StudioApp() {
  const [gridVisible, setGridVisible] = useState(true);
  const [activeTool, setActiveTool] = useState<ToolType>('brush');
  const [brushSize, setBrushSize] = useState(4);
  const [selectedColorId, setSelectedColorId] = useState(37); // Bright Green
  const [bbox, setBbox] = useState<BoundingBoxState>({ x: 10, y: 20, width: 24, height: 32 });
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  const handleUndo = async () => {
    try {
      await terrainEngineService.undo({ tilemapId: 'main' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRedo = async () => {
    try {
      await terrainEngineService.redo({ tilemapId: 'main' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 font-sans">
      <TopHeaderBar
        gridVisible={gridVisible}
        onToggleGrid={() => setGridVisible(!gridVisible)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={false}
        canRedo={false}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftToolboxSidebar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          brushSize={brushSize}
          onSelectBrushSize={setBrushSize}
          selectedColorId={selectedColorId}
          onSelectColor={setSelectedColorId}
        />

        <CanvasViewport
          gridVisible={gridVisible}
          onCursorMove={(x, y) => setCursor({ x, y })}
        />

        <RightInspectorSidebar
          bbox={bbox}
          onChangeBBox={setBbox}
        />
      </div>

      <BottomStatusBar
        cursorX={cursor.x}
        cursorY={cursor.y}
        connected={true}
      />
    </div>
  );
}
