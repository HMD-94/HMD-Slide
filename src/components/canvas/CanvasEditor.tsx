import React, { useRef, useState, useEffect } from 'react';
import { Slide, SlideElement, EditorSettings } from '../../types/slides';
import { RenderElement } from './RenderElement';
import { RotateCw, Copy, Scissors, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface CanvasEditorProps {
  slide: Slide;
  aspectRatio: '16:9' | '4:3';
  selectedElementIds: string[];
  settings: EditorSettings;
  zoom: number; // 1 = 100%
  onSelectElement: (id: string, multiSelect?: boolean) => void;
  onClearSelection: () => void;
  onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
  onUpdateElements: (updates: { id: string; changes: Partial<SlideElement> }[]) => void;
  onDoubleClickElement: (el: SlideElement) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onDragOrResizeEnd?: () => void;
  previewAnimation?: { elementId: string; animType: string } | null;
  onAddImageFromDataUrl: (dataUrl: string) => void;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  slide,
  aspectRatio,
  selectedElementIds,
  settings,
  zoom,
  onSelectElement,
  onClearSelection,
  onUpdateElement,
  onUpdateElements,
  onDoubleClickElement,
  onDeleteSelected,
  onDuplicateSelected,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onDragOrResizeEnd,
  previewAnimation,
  onAddImageFromDataUrl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  // Slide logical dimensions
  const slideWidth = 1000;
  const slideHeight = aspectRatio === '4:3' ? 750 : 562.5;

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [initialElementsPos, setInitialElementsPos] = useState<
    { id: string; x: number; y: number; width: number; height: number }[]
  >([]);

  // Resize state
  const [isResizing, setIsResizing] = useState<string | null>(null); // handle: 'tl'|'tr'|'br'|'bl'|'tm'|'bm'|'ml'|'mr'
  const [initialResizeState, setInitialResizeState] = useState<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    mouseX: number;
    mouseY: number;
  } | null>(null);

  // Rotate state
  const [isRotating, setIsRotating] = useState(false);
  const [rotateStartAngle, setRotateStartAngle] = useState(0);

  // Box selection state
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Alignment guide indicators
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});

  // Context Menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Editing in-place text ID
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // File drag & drop over canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onAddImageFromDataUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Canvas background style
  const getBackgroundStyle = (): React.CSSProperties => {
    const bg = slide.background;
    if (bg.type === 'gradient' && bg.gradient) {
      return {
        backgroundImage: `linear-gradient(${bg.gradient.from}, ${bg.gradient.to})`,
      };
    }
    if (bg.type === 'image' && bg.imageUrl) {
      return {
        backgroundImage: `url(${bg.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {
      backgroundColor: bg.color || '#0f172a',
    };
  };

  // Mouse Down on background (Box select or Clear)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (e.target === slideRef.current || (e.target as HTMLElement).id === 'slide-bg-catcher') {
      onClearSelection();
      setEditingTextId(null);
      setContextMenu(null);

      // Start box selection
      if (slideRef.current) {
        const rect = slideRef.current.getBoundingClientRect();
        const startX = (e.clientX - rect.left) / zoom;
        const startY = (e.clientY - rect.top) / zoom;
        setSelectionBox({ startX, startY, currentX: startX, currentY: startY });
      }
    }
  };

  // Mouse Down on element (Start Drag)
  const handleElementMouseDown = (e: React.MouseEvent, el: SlideElement) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setContextMenu(null);

    const isAlreadySelected = selectedElementIds.includes(el.id);
    const isMultiKey = e.shiftKey || e.metaKey || e.ctrlKey;

    if (!isAlreadySelected) {
      onSelectElement(el.id, isMultiKey);
    }

    if (el.locked) return;

    // Record initial positions
    const idsToDrag = isAlreadySelected ? selectedElementIds : [el.id];
    const initialPos = slide.elements
      .filter((item) => idsToDrag.includes(item.id))
      .map((item) => ({
        id: item.id,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
      }));

    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setInitialElementsPos(initialPos);
  };

  // Mouse Down on resize handle
  const handleResizeHandleMouseDown = (e: React.MouseEvent, handle: string, el: SlideElement) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(handle);
    setInitialResizeState({
      id: el.id,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      mouseX: e.clientX,
      mouseY: e.clientY,
    });
  };

  // Mouse Down on rotate handle
  const handleRotateHandleMouseDown = (e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);
    if (slideRef.current) {
      const rect = slideRef.current.getBoundingClientRect();
      const elCenterX = rect.left + (el.x + el.width / 2) * zoom;
      const elCenterY = rect.top + (el.y + el.height / 2) * zoom;
      const angle = Math.atan2(e.clientY - elCenterY, e.clientX - elCenterX) * (180 / Math.PI);
      setRotateStartAngle(angle - (el.rotation || 0));
    }
  };

  // Global Mouse Move & Up
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Dragging Elements
      if (isDragging && dragStartPos && initialElementsPos.length > 0) {
        let deltaX = (e.clientX - dragStartPos.x) / zoom;
        let deltaY = (e.clientY - dragStartPos.y) / zoom;

        // Snap to grid
        if (settings.snapToGrid && settings.gridSize > 1) {
          const first = initialElementsPos[0];
          const newX = Math.round((first.x + deltaX) / settings.gridSize) * settings.gridSize;
          const newY = Math.round((first.y + deltaY) / settings.gridSize) * settings.gridSize;
          deltaX = newX - first.x;
          deltaY = newY - first.y;
        }

        // Snap to guides (slide center X and Y)
        let activeGuideX: number | undefined;
        let activeGuideY: number | undefined;

        if (settings.snapToGuides && initialElementsPos.length === 1) {
          const first = initialElementsPos[0];
          const testCenterX = first.x + deltaX + first.width / 2;
          const testCenterY = first.y + deltaY + first.height / 2;
          const slideCenterX = slideWidth / 2;
          const slideCenterY = slideHeight / 2;

          if (Math.abs(testCenterX - slideCenterX) < 6) {
            deltaX = slideCenterX - first.width / 2 - first.x;
            activeGuideX = slideCenterX;
          }
          if (Math.abs(testCenterY - slideCenterY) < 6) {
            deltaY = slideCenterY - first.height / 2 - first.y;
            activeGuideY = slideCenterY;
          }
        }
        setGuides({ x: activeGuideX, y: activeGuideY });

        const updates = initialElementsPos.map((pos) => ({
          id: pos.id,
          changes: {
            x: Math.round(pos.x + deltaX),
            y: Math.round(pos.y + deltaY),
          },
        }));

        onUpdateElements(updates);
      }

      // 2. Resizing Element
      if (isResizing && initialResizeState) {
        const deltaX = (e.clientX - initialResizeState.mouseX) / zoom;
        const deltaY = (e.clientY - initialResizeState.mouseY) / zoom;

        let { x, y, width, height } = initialResizeState;

        if (isResizing.includes('r')) width += deltaX;
        if (isResizing.includes('l')) {
          width -= deltaX;
          x += deltaX;
        }
        if (isResizing.includes('b')) height += deltaY;
        if (isResizing.includes('t')) {
          height -= deltaY;
          y += deltaY;
        }

        width = Math.max(width, 20);
        height = Math.max(height, 20);

        onUpdateElement(initialResizeState.id, {
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
        });
      }

      // 3. Rotating Element
      if (isRotating && selectedElementIds.length === 1 && slideRef.current) {
        const el = slide.elements.find((item) => item.id === selectedElementIds[0]);
        if (el) {
          const rect = slideRef.current.getBoundingClientRect();
          const elCenterX = rect.left + (el.x + el.width / 2) * zoom;
          const elCenterY = rect.top + (el.y + el.height / 2) * zoom;
          const currentAngle =
            Math.atan2(e.clientY - elCenterY, e.clientX - elCenterX) * (180 / Math.PI);
          let newRotation = Math.round(currentAngle - rotateStartAngle);

          // Snap to 0, 90, 180, 270 if close
          const snapThreshold = 4;
          [0, 90, 180, 270, 360].forEach((snapAngle) => {
            if (Math.abs(newRotation - snapAngle) < snapThreshold) {
              newRotation = snapAngle % 360;
            }
          });

          onUpdateElement(el.id, { rotation: newRotation });
        }
      }

      // 4. Box Selection
      if (selectionBox && slideRef.current) {
        const rect = slideRef.current.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) / zoom;
        const currentY = (e.clientY - rect.top) / zoom;
        setSelectionBox({ ...selectionBox, currentX, currentY });

        const minX = Math.min(selectionBox.startX, currentX);
        const maxX = Math.max(selectionBox.startX, currentX);
        const minY = Math.min(selectionBox.startY, currentY);
        const maxY = Math.max(selectionBox.startY, currentY);

        const intersectingIds = slide.elements
          .filter((el) => {
            const elRight = el.x + el.width;
            const elBottom = el.y + el.height;
            return el.x < maxX && elRight > minX && el.y < maxY && elBottom > minY;
          })
          .map((el) => el.id);

        intersectingIds.forEach((id) => onSelectElement(id, true));
      }
    };

    const handleMouseUp = () => {
      const wasManipulating = isDragging || !!isResizing || isRotating;
      setIsDragging(false);
      setDragStartPos(null);
      setIsResizing(null);
      setInitialResizeState(null);
      setIsRotating(false);
      setSelectionBox(null);
      setGuides({});
      if (wasManipulating) {
        onDragOrResizeEnd?.();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    dragStartPos,
    initialElementsPos,
    isResizing,
    initialResizeState,
    isRotating,
    rotateStartAngle,
    selectionBox,
    zoom,
    settings,
    slide,
    selectedElementIds,
  ]);

  // Context Menu handler
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedElementIds.length > 0) {
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  const selectedElement =
    selectedElementIds.length === 1
      ? slide.elements.find((el) => el.id === selectedElementIds[0])
      : null;

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full w-full overflow-auto bg-slate-950 flex items-center justify-center p-8 relative select-none"
      onClick={() => setContextMenu(null)}
      onContextMenu={handleContextMenu}
    >
      {/* Slide Root Frame */}
      <div
        ref={slideRef}
        id="active-slide-canvas"
        onMouseDown={handleCanvasMouseDown}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative shadow-2xl transition-all"
        style={{
          width: `${slideWidth * zoom}px`,
          height: `${slideHeight * zoom}px`,
          minWidth: `${slideWidth * zoom}px`,
          minHeight: `${slideHeight * zoom}px`,
          ...getBackgroundStyle(),
        }}
      >
        {/* Invisible Click Catcher */}
        <div id="slide-bg-catcher" className="absolute inset-0 pointer-events-auto" />

        {/* Grid Overlay */}
        {settings.showGrid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
              backgroundSize: `${settings.gridSize * zoom}px ${settings.gridSize * zoom}px`,
            }}
          />
        )}

        {/* Dynamic Snap Alignment Guides */}
        {guides.x !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-px bg-cyan-400 z-50 pointer-events-none"
            style={{ left: `${guides.x * zoom}px`, boxShadow: '0 0 6px #06b6d4' }}
          />
        )}
        {guides.y !== undefined && (
          <div
            className="absolute left-0 right-0 h-px bg-cyan-400 z-50 pointer-events-none"
            style={{ top: `${guides.y * zoom}px`, boxShadow: '0 0 6px #06b6d4' }}
          />
        )}

        {/* Elements Layer */}
        {slide.elements
          .slice()
          .sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1))
          .map((el) => {
            if (el.hidden) return null;
            const isSelected = selectedElementIds.includes(el.id);
            const isEditingText = editingTextId === el.id;

            return (
              <div
                key={el.id}
                onMouseDown={(e) => handleElementMouseDown(e, el)}
                onDoubleClick={() => {
                  if (el.type === 'text') {
                    setEditingTextId(el.id);
                  } else {
                    onDoubleClickElement(el);
                  }
                }}
                className={`absolute group cursor-move ${
                  isSelected ? 'ring-2 ring-indigo-500' : 'hover:ring-1 hover:ring-indigo-400/50'
                } ${
                  previewAnimation?.elementId === el.id
                    ? `anim-preview-${previewAnimation.animType}`
                    : ''
                }`}
                style={{
                  left: `${el.x * zoom}px`,
                  top: `${el.y * zoom}px`,
                  width: `${el.width * zoom}px`,
                  height: `${el.height * zoom}px`,
                  transform: `rotate(${el.rotation || 0}deg)`,
                  transformOrigin: 'center center',
                  zIndex: el.zIndex || 1,
                  opacity: el.opacity !== undefined ? el.opacity : 1,
                }}
              >
                {/* Element Body */}
                <RenderElement
                  element={el}
                  isSelected={isSelected}
                  isEditingText={isEditingText}
                  onTextChange={(newText) => onUpdateElement(el.id, { content: newText })}
                  onDoubleClick={() => {
                    if (el.type === 'text') setEditingTextId(el.id);
                    else onDoubleClickElement(el);
                  }}
                  scale={zoom}
                />

                {/* Selection Handles (Single Selected Element) */}
                {isSelected && selectedElementIds.length === 1 && !el.locked && (
                  <>
                    {/* Rotate Handle */}
                    <div
                      onMouseDown={(e) => handleRotateHandleMouseDown(e, el)}
                      className="absolute -top-7 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border border-indigo-600 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md z-30 hover:scale-125 transition-transform"
                      title="Faire pivoter"
                    >
                      <RotateCw className="w-2.5 h-2.5 text-indigo-600" />
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-indigo-500" />

                    {/* 8 Resize Handles */}
                    {[
                      { id: 'tl', cursor: 'nwse-resize', style: '-top-1.5 -left-1.5' },
                      { id: 'tm', cursor: 'ns-resize', style: '-top-1.5 left-1/2 -translate-x-1/2' },
                      { id: 'tr', cursor: 'nesw-resize', style: '-top-1.5 -right-1.5' },
                      { id: 'mr', cursor: 'ew-resize', style: 'top-1/2 -translate-y-1/2 -right-1.5' },
                      { id: 'br', cursor: 'nwse-resize', style: '-bottom-1.5 -right-1.5' },
                      { id: 'bm', cursor: 'ns-resize', style: '-bottom-1.5 left-1/2 -translate-x-1/2' },
                      { id: 'bl', cursor: 'nesw-resize', style: '-bottom-1.5 -left-1.5' },
                      { id: 'ml', cursor: 'ew-resize', style: 'top-1/2 -translate-y-1/2 -left-1.5' },
                    ].map((handle) => (
                      <div
                        key={handle.id}
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, handle.id, el)}
                        className={`absolute w-3 h-3 bg-white border-2 border-indigo-600 rounded-sm z-30 shadow hover:scale-125 transition-transform ${handle.style}`}
                        style={{ cursor: handle.cursor }}
                      />
                    ))}
                  </>
                )}
              </div>
            );
          })}

        {/* Box Selection Visualizer */}
        {selectionBox && (
          <div
            className="absolute border border-indigo-400 bg-indigo-500/15 pointer-events-none z-50 rounded"
            style={{
              left: `${Math.min(selectionBox.startX, selectionBox.currentX) * zoom}px`,
              top: `${Math.min(selectionBox.startY, selectionBox.currentY) * zoom}px`,
              width: `${Math.abs(selectionBox.currentX - selectionBox.startX) * zoom}px`,
              height: `${Math.abs(selectionBox.currentY - selectionBox.startY) * zoom}px`,
            }}
          />
        )}
      </div>

      {/* Right Click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 w-52 text-xs text-slate-200"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onDuplicateSelected();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 hover:text-white flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 text-slate-400" /> Dupliquer
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Ctrl+D</span>
          </button>

          <button
            onClick={() => {
              onBringToFront?.();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
          >
            <ArrowUp className="w-3.5 h-3.5 text-indigo-400" /> Mettre au premier plan
          </button>

          <button
            onClick={() => {
              onBringForward();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
          >
            <ArrowUp className="w-3.5 h-3.5 text-slate-400" /> Avancer d’un plan
          </button>

          <button
            onClick={() => {
              onSendBackward();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
          >
            <ArrowDown className="w-3.5 h-3.5 text-slate-400" /> Reculer d’un plan
          </button>

          <button
            onClick={() => {
              onSendToBack?.();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
          >
            <ArrowDown className="w-3.5 h-3.5 text-indigo-400" /> Mettre à l’arrière-plan
          </button>

          <div className="h-px bg-slate-800 my-1" />

          <button
            onClick={() => {
              onDeleteSelected();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-red-600/30 text-red-400 hover:text-red-200 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5" /> Supprimer
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Suppr</span>
          </button>
        </div>
      )}
    </div>
  );
};
