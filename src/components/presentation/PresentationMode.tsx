import React, { useState, useEffect, useRef } from 'react';
import { Presentation, Slide } from '../../types/slides';
import { RenderElement } from '../canvas/RenderElement';
import { getSlideBackgroundCss } from '../../utils/background';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  FileText,
  Edit3,
  Trash2,
} from 'lucide-react';

interface PresentationModeProps {
  presentation: Presentation;
  initialSlideIndex?: number;
  onClose: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  presentation,
  initialSlideIndex = 0,
  onClose,
}) => {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(initialSlideIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [isPenActive, setIsPenActive] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Drawing canvas ref
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const slide = presentation.slides[currentSlideIdx] || presentation.slides[0];
  const slideWidth = 1000;
  const slideHeight = presentation.aspectRatio === '4:3' ? 750 : 562.5;

  // Scale calculation
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = Math.min((w - 40) / slideWidth, (h - 40) / slideHeight, 1.8);
      setScale(s);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [slideWidth, slideHeight]);

  // Fullscreen trigger
  useEffect(() => {
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const nextSlide = () => {
    if (currentSlideIdx < presentation.slides.length - 1) {
      clearDrawing();
      const nextIdx = currentSlideIdx + 1;
      setCurrentSlideIdx(nextIdx);
      if (nextIdx === presentation.slides.length - 1) {
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
        } catch {}
      }
    }
  };

  const prevSlide = () => {
    if (currentSlideIdx > 0) {
      clearDrawing();
      setCurrentSlideIdx(currentSlideIdx - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'l' || e.key === 'L') {
        setIsLaserActive((prev) => !prev);
        setIsPenActive(false);
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPenActive((prev) => !prev);
        setIsLaserActive(false);
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIdx, presentation.slides.length]);

  // Mouse tracking for laser
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLaserActive) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
    if (isPenActive && isDrawing && drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
      }
    }
  };

  // Pen tool handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPenActive && drawingCanvasRef.current) {
      setIsDrawing(true);
      const ctx = drawingCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    } else if (!isLaserActive && e.target === containerRef.current) {
      nextSlide();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }
  };

  // Background styling
  const getBackgroundStyle = (): React.CSSProperties => {
    return getSlideBackgroundCss(slide.background);
  };

  // Slide transition class
  const getTransitionStyle = (): string => {
    const t = slide.transition.type;
    if (t === 'fade') return 'transition-opacity duration-500';
    if (t === 'zoom') return 'transition-all duration-500';
    return '';
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center overflow-hidden select-none cursor-default"
    >
      {/* Slide Canvas */}
      <div
        className={`relative shadow-2xl overflow-hidden ${getTransitionStyle()}`}
        style={{
          width: `${slideWidth * scale}px`,
          height: `${slideHeight * scale}px`,
          minWidth: `${slideWidth * scale}px`,
          minHeight: `${slideHeight * scale}px`,
          ...getBackgroundStyle(),
        }}
      >
        {slide.elements
          .slice()
          .sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1))
          .map((el) => {
            if (el.hidden) return null;
            const hasAnim = el.animation?.type && el.animation.type !== 'none';
            const animClass = hasAnim ? `anim-preview-${el.animation!.type}` : '';
            const animStyle = hasAnim
              ? {
                  animationDuration: `${el.animation!.duration || 0.6}s`,
                  animationDelay: `${el.animation!.delay || 0}s`,
                }
              : {};

            return (
              <div
                key={`${currentSlideIdx}-${el.id}`}
                className="absolute pointer-events-none"
                style={{
                  left: `${el.x * scale}px`,
                  top: `${el.y * scale}px`,
                  width: `${el.width * scale}px`,
                  height: `${el.height * scale}px`,
                  transform: `rotate(${el.rotation || 0}deg)`,
                  zIndex: el.zIndex || 1,
                  opacity: el.opacity !== undefined ? el.opacity : 1,
                }}
              >
                <div
                  className={`w-full h-full ${animClass}`}
                  style={animStyle}
                >
                  <RenderElement element={el} scale={scale} />
                </div>
              </div>
            );
          })}
      </div>

      {/* Pen Drawing Layer */}
      <canvas
        ref={drawingCanvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className={`fixed inset-0 pointer-events-none ${
          isPenActive ? 'pointer-events-auto cursor-crosshair' : ''
        }`}
        style={{ zIndex: 9000 }}
      />

      {/* Laser Pointer Dot */}
      {isLaserActive && (
        <div
          className="fixed w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_#ef4444,0_0_30px_#ef4444] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-50 transition-transform duration-75"
          style={{ left: laserPos.x, top: laserPos.y }}
        />
      )}

      {/* Speaker Notes Overlay */}
      {showNotes && (
        <div className="fixed top-6 right-6 w-80 max-h-96 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 backdrop-blur-xl z-50 text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Notes de la diapositive
            </span>
            <button
              onClick={() => setShowNotes(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs leading-relaxed text-slate-300 max-h-72 overflow-y-auto whitespace-pre-wrap">
            {slide.notes || 'Aucune note enregistrée pour cette diapositive.'}
          </p>
        </div>
      )}

      {/* Floating Presentation Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/85 border border-slate-700/70 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl z-50 opacity-20 hover:opacity-100 transition-opacity">
        <button
          onClick={prevSlide}
          disabled={currentSlideIdx === 0}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent"
          title="Précédent (←)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-mono font-bold text-slate-200 px-2">
          {currentSlideIdx + 1} / {presentation.slides.length}
        </span>

        <button
          onClick={nextSlide}
          disabled={currentSlideIdx === presentation.slides.length - 1}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent"
          title="Suivant (→ / Espace)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1" />

        {/* Laser */}
        <button
          onClick={() => {
            setIsLaserActive(!isLaserActive);
            setIsPenActive(false);
          }}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            isLaserActive
              ? 'bg-red-500/30 text-red-300 border border-red-500/50'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Pointeur laser (L)"
        >
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Laser</span>
        </button>

        {/* Pen */}
        <button
          onClick={() => {
            setIsPenActive(!isPenActive);
            setIsLaserActive(false);
          }}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            isPenActive
              ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Stylet d'annotation (P)"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Stylet</span>
        </button>

        {/* Clear Pen */}
        {isPenActive && (
          <button
            onClick={clearDrawing}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            title="Effacer les traits"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Notes */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          className={`p-1.5 rounded-full hover:bg-slate-800 ${
            showNotes ? 'text-indigo-400' : 'text-slate-300'
          }`}
          title="Notes (N)"
        >
          <FileText className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1" />

        {/* Fullscreen toggle */}
        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              containerRef.current?.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }}
          className="p-1.5 rounded-full text-slate-300 hover:bg-slate-800"
          title="Plein écran (F)"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Exit */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-red-500/20"
          title="Quitter la présentation (Échap)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
