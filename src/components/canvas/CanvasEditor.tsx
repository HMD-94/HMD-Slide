import React, { useRef, useState, useEffect } from 'react';
import { Slide, SlideElement, EditorSettings } from '../../types/slides';
import { RenderElement } from './RenderElement';
import { getSlideBackgroundCss } from '../../utils/background';
import {
  RotateCw,
  Copy,
  Scissors,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  Type,
  Wallpaper,
} from 'lucide-react';

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
  onOpenBackgroundModal?: () => void;
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
  onOpenBackgroundModal,
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
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize?: number;
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
    return getSlideBackgroundCss(slide.background);
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

  // Start resize from Mouse or Touch
  const startResize = (clientX: number, clientY: number, handle: string, el: SlideElement) => {
    setIsResizing(handle);
    setInitialResizeState({
      id: el.id,
      type: el.type,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      fontSize: el.fontSize || 24,
      mouseX: clientX,
      mouseY: clientY,
    });
  };

  const handleResizeHandleMouseDown = (e: React.MouseEvent, handle: string, el: SlideElement) => {
    e.stopPropagation();
    e.preventDefault();
    startResize(e.clientX, e.clientY, handle, el);
  };

  const handleResizeHandleTouchStart = (e: React.TouchEvent, handle: string, el: SlideElement) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      startResize(e.touches[0].clientX, e.touches[0].clientY, handle, el);
    }
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

  // Global Pointer (Mouse & Touch) Move & Up
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      // 1. Dragging Elements
      if (isDragging && dragStartPos && initialElementsPos.length > 0) {
        let deltaX = (clientX - dragStartPos.x) / zoom;
        let deltaY = (clientY - dragStartPos.y) / zoom;

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
        const deltaX = (clientX - initialResizeState.mouseX) / zoom;
        const deltaY = (clientY - initialResizeState.mouseY) / zoom;

        let { x, y, width, height } = initialResizeState;
        let newFontSize: number | undefined = undefined;

        if (initialResizeState.type === 'text') {
          // PROPORTIONAL TEXT SCALING:
          // When dragging any corner (br, bl, tr, tl), scale the box and the font size simultaneously
          const baseFont = initialResizeState.fontSize || 24;

          if (isResizing === 'br') {
            const scaleW = (initialResizeState.width + deltaX) / Math.max(20, initialResizeState.width);
            const scaleH = (initialResizeState.height + deltaY) / Math.max(20, initialResizeState.height);
            const scaleFactor = Math.max(0.15, Math.abs(deltaX) >= Math.abs(deltaY) ? scaleW : scaleH);
            width = Math.max(30, Math.round(initialResizeState.width * scaleFactor));
            height = Math.max(20, Math.round(initialResizeState.height * scaleFactor));
            newFontSize = Math.round(Math.max(8, Math.min(260, baseFont * scaleFactor)));
          } else if (isResizing === 'bl') {
            const scaleW = (initialResizeState.width - deltaX) / Math.max(20, initialResizeState.width);
            const scaleH = (initialResizeState.height + deltaY) / Math.max(20, initialResizeState.height);
            const scaleFactor = Math.max(0.15, Math.abs(deltaX) >= Math.abs(deltaY) ? scaleW : scaleH);
            const newW = Math.max(30, Math.round(initialResizeState.width * scaleFactor));
            x = initialResizeState.x + (initialResizeState.width - newW);
            width = newW;
            height = Math.max(20, Math.round(initialResizeState.height * scaleFactor));
            newFontSize = Math.round(Math.max(8, Math.min(260, baseFont * scaleFactor)));
          } else if (isResizing === 'tr') {
            const scaleW = (initialResizeState.width + deltaX) / Math.max(20, initialResizeState.width);
            const scaleH = (initialResizeState.height - deltaY) / Math.max(20, initialResizeState.height);
            const scaleFactor = Math.max(0.15, Math.abs(deltaX) >= Math.abs(deltaY) ? scaleW : scaleH);
            const newH = Math.max(20, Math.round(initialResizeState.height * scaleFactor));
            y = initialResizeState.y + (initialResizeState.height - newH);
            width = Math.max(30, Math.round(initialResizeState.width * scaleFactor));
            height = newH;
            newFontSize = Math.round(Math.max(8, Math.min(260, baseFont * scaleFactor)));
          } else if (isResizing === 'tl') {
            const scaleW = (initialResizeState.width - deltaX) / Math.max(20, initialResizeState.width);
            const scaleH = (initialResizeState.height - deltaY) / Math.max(20, initialResizeState.height);
            const scaleFactor = Math.max(0.15, Math.abs(deltaX) >= Math.abs(deltaY) ? scaleW : scaleH);
            const newW = Math.max(30, Math.round(initialResizeState.width * scaleFactor));
            const newH = Math.max(20, Math.round(initialResizeState.height * scaleFactor));
            x = initialResizeState.x + (initialResizeState.width - newW);
            y = initialResizeState.y + (initialResizeState.height - newH);
            width = newW;
            height = newH;
            newFontSize = Math.round(Math.max(8, Math.min(260, baseFont * scaleFactor)));
          } else if (isResizing === 'bm') {
            // Dragging bottom handle downwards or upwards
            height = Math.max(20, initialResizeState.height + deltaY);
            const scaleH = height / Math.max(20, initialResizeState.height);
            if (scaleH > 1.25 || scaleH < 0.8) {
              newFontSize = Math.round(Math.max(8, Math.min(260, baseFont * scaleH)));
            }
          } else if (isResizing === 'tm') {
            const newH = Math.max(20, initialResizeState.height - deltaY);
            y = initialResizeState.y + (initialResizeState.height - newH);
            height = newH;
            const scaleH = height / Math.max(20, initialResizeState.height);
            if (scaleH > 1.25 || scaleH < 0.8) {
              newFontSize = Math.round(Math.max(8, Math.min(260, baseFont * scaleH)));
            }
          } else if (isResizing === 'mr') {
            // Change box width
            width = Math.max(40, initialResizeState.width + deltaX);
          } else if (isResizing === 'ml') {
            const newW = Math.max(40, initialResizeState.width - deltaX);
            x = initialResizeState.x + (initialResizeState.width - newW);
            width = newW;
          }

          // Always ensure the height is sufficient for font size so it doesn't clip
          const effectiveFont = newFontSize !== undefined ? newFontSize : baseFont;
          height = Math.max(height, Math.round(effectiveFont * 1.3));
        } else {
          // Standard elements resizing
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
        }

        onUpdateElement(initialResizeState.id, {
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
          ...(newFontSize !== undefined ? { fontSize: newFontSize } : {}),
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
            Math.atan2(clientY - elCenterY, clientX - elCenterX) * (180 / Math.PI);
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
        const currentX = (clientX - rect.left) / zoom;
        const currentY = (clientY - rect.top) / zoom;
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

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
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
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
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
                {/* Element Body with Animation Preview */}
                <div
                  key={`preview-${previewAnimation?.elementId === el.id ? previewAnimation.animType : 'idle'}`}
                  className={`w-full h-full ${
                    previewAnimation?.elementId === el.id
                      ? `anim-preview-${previewAnimation.animType}`
                      : ''
                  }`}
                >
                  <RenderElement
                    element={el}
                    isSelected={isSelected}
                    isEditingText={isEditingText}
                    onTextChange={(newText) => onUpdateElement(el.id, { content: newText })}
                    onFinishEditing={() => setEditingTextId(null)}
                    onDoubleClick={() => {
                      if (el.type === 'text') setEditingTextId(el.id);
                      else onDoubleClickElement(el);
                    }}
                    scale={zoom}
                  />
                </div>

                {/* Selection Handles & Floating Text Bar (Single Selected Element) */}
                {isSelected && selectedElementIds.length === 1 && !el.locked && (
                  <>
                    {/* Floating Quick Text Size Bar right above or below text element */}
                    {el.type === 'text' && (
                      <div
                        className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md border border-indigo-500/80 px-2 py-1 rounded-xl shadow-2xl z-40 text-white animate-in fade-in zoom-in-95 pointer-events-auto shrink-0 select-none whitespace-nowrap"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        {/* A- (Rapetisser) */}
                        <button
                          type="button"
                          onClick={() => {
                            const cur = el.fontSize || 24;
                            const next = Math.max(8, cur - (cur > 32 ? 6 : cur > 20 ? 4 : 2));
                            onUpdateElement(el.id, {
                              fontSize: next,
                              height: Math.max(el.height, Math.round(next * 1.35)),
                            });
                          }}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-indigo-600 rounded-md text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1 active:scale-95 border border-slate-700 hover:border-indigo-400"
                          title="Rapetisser la police (A-)"
                        >
                          <Minus className="w-3 h-3 text-slate-400" />
                          <span>A-</span>
                        </button>

                        {/* Direct Size Input in pixels */}
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-950 border border-slate-700/80 rounded-md">
                          <input
                            type="number"
                            min="8"
                            max="260"
                            value={el.fontSize || 24}
                            onChange={(e) => {
                              const sz = parseInt(e.target.value) || 24;
                              onUpdateElement(el.id, {
                                fontSize: sz,
                                height: Math.max(el.height, Math.round(sz * 1.35)),
                              });
                            }}
                            className="w-10 bg-transparent text-center font-mono font-bold text-xs text-cyan-300 focus:outline-none"
                            title="Taille de la police en pixels"
                          />
                          <span className="text-[10px] text-slate-400 font-mono">px</span>
                        </div>

                        {/* A+ (Agrandir) */}
                        <button
                          type="button"
                          onClick={() => {
                            const cur = el.fontSize || 24;
                            const next = Math.min(260, cur + (cur >= 32 ? 6 : cur >= 20 ? 4 : 2));
                            onUpdateElement(el.id, {
                              fontSize: next,
                              height: Math.max(el.height, Math.round(next * 1.35)),
                            });
                          }}
                          className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 rounded-md text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1 active:scale-95 border border-indigo-400"
                          title="Agrandir la police (A+)"
                        >
                          <Plus className="w-3 h-3" />
                          <span>A+</span>
                        </button>

                        {/* Quick Size Chips */}
                        <div className="flex items-center gap-1 pl-1.5 border-l border-slate-700/80">
                          {[16, 24, 32, 48, 64].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() =>
                                onUpdateElement(el.id, {
                                  fontSize: sz,
                                  height: Math.max(el.height, Math.round(sz * 1.35)),
                                })
                              }
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                                (el.fontSize || 24) === sz
                                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}
                              title={`Taille ${sz}px`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rotate Handle */}
                    <div
                      onMouseDown={(e) => handleRotateHandleMouseDown(e, el)}
                      className="absolute -top-7 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border border-indigo-600 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md z-30 hover:scale-125 transition-transform"
                      title="Faire pivoter"
                    >
                      <RotateCw className="w-2.5 h-2.5 text-indigo-600" />
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-indigo-500" />

                    {/* 8 Resize Handles (with mouse and touch listeners) */}
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
                        onTouchStart={(e) => handleResizeHandleTouchStart(e, handle.id, el)}
                        className={`absolute w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm z-30 shadow hover:scale-125 active:scale-125 transition-transform ${handle.style}`}
                        style={{ cursor: handle.cursor }}
                        title={
                          el.type === 'text' && ['br', 'bl', 'tr', 'tl'].includes(handle.id)
                            ? 'Glisser pour agrandir ou rapetisser le texte'
                            : 'Redimensionner'
                        }
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

          {onOpenBackgroundModal && (
            <button
              onClick={() => {
                onOpenBackgroundModal();
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-cyan-600/30 hover:text-white flex items-center gap-2 text-cyan-300"
            >
              <Wallpaper className="w-3.5 h-3.5 text-cyan-400" />
              <span>Arrière-plan & Fonds d'écran...</span>
            </button>
          )}

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
