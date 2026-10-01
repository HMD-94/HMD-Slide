import React, { useState, useEffect } from 'react';
import { Presentation } from '../../types/slides';
import { RenderElement } from '../canvas/RenderElement';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Pause,
  RotateCcw,
  X,
  FileText,
  Monitor,
} from 'lucide-react';

interface PresenterModeProps {
  presentation: Presentation;
  initialSlideIndex?: number;
  onClose: () => void;
}

export const PresenterMode: React.FC<PresenterModeProps> = ({
  presentation,
  initialSlideIndex = 0,
  onClose,
}) => {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(initialSlideIndex);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentSlide = presentation.slides[currentSlideIdx] || presentation.slides[0];
  const nextSlide =
    currentSlideIdx < presentation.slides.length - 1
      ? presentation.slides[currentSlideIdx + 1]
      : null;

  // Realtime clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Presentation stopwatch
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const next = () => {
    if (currentSlideIdx < presentation.slides.length - 1) {
      setCurrentSlideIdx(currentSlideIdx + 1);
    }
  };

  const prev = () => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx(currentSlideIdx - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIdx, presentation.slides.length]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-slate-100 select-none overflow-hidden">
      {/* Top Presenter Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm tracking-tight text-white font-['Cabinet_Grotesk']">
              Vue Présentateur
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">|</span>
          <span className="text-xs text-slate-300 font-semibold truncate max-w-sm">
            {presentation.title}
          </span>
        </div>

        {/* Stopwatch & Current Time */}
        <div className="flex items-center gap-6">
          {/* Current clock */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {/* Stopwatch */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            <span className="text-xs font-mono font-bold text-indigo-400">
              {formatTime(secondsElapsed)}
            </span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1 hover:text-white text-slate-400"
              title={isTimerRunning ? 'Mettre en pause' : 'Démarrer'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setSecondsElapsed(0);
                setIsTimerRunning(false);
              }}
              className="p-1 hover:text-white text-slate-400"
              title="Réinitialiser le chrono"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Quitter la vue présentateur"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Dual View Area */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left: Active Slide Preview */}
        <div className="flex-[3] flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Diapositive en cours ({currentSlideIdx + 1} / {presentation.slides.length})
            </span>
            <span className="text-xs text-slate-400 font-semibold truncate max-w-xs">
              {currentSlide.title}
            </span>
          </div>

          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-center overflow-hidden shadow-2xl relative">
            <div
              className="w-full aspect-video max-h-full rounded-xl overflow-hidden relative shadow-lg"
              style={{
                background:
                  currentSlide.background.type === 'gradient' && currentSlide.background.gradient
                    ? `linear-gradient(${currentSlide.background.gradient.from}, ${currentSlide.background.gradient.to})`
                    : currentSlide.background.color || '#0f172a',
              }}
            >
              {currentSlide.elements.map((el) => {
                if (el.hidden) return null;
                return (
                  <div
                    key={el.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${(el.x / 1000) * 100}%`,
                      top: `${(el.y / 562.5) * 100}%`,
                      width: `${(el.width / 1000) * 100}%`,
                      height: `${(el.height / 562.5) * 100}%`,
                      transform: `rotate(${el.rotation || 0}deg)`,
                      zIndex: el.zIndex || 1,
                      opacity: el.opacity !== undefined ? el.opacity : 1,
                    }}
                  >
                    <RenderElement element={el} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls Bar */}
          <div className="flex items-center justify-between mt-4 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
            <button
              onClick={prev}
              disabled={currentSlideIdx === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Précédente
            </button>

            <span className="text-xs font-mono font-bold text-slate-300">
              Diapositive {currentSlideIdx + 1} sur {presentation.slides.length}
            </span>

            <button
              onClick={next}
              disabled={currentSlideIdx === presentation.slides.length - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 rounded-lg text-xs font-semibold text-white transition-colors shadow-md shadow-indigo-600/30"
            >
              Suivante <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Next Slide Preview & Speaker Notes */}
        <div className="flex-[2] flex flex-col gap-4 min-w-0">
          {/* Next slide thumbnail */}
          <div className="flex-1 flex flex-col min-h-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Diapositive suivante
            </span>
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-center overflow-hidden">
              {nextSlide ? (
                <div
                  className="w-full aspect-video rounded-lg overflow-hidden relative shadow border border-slate-700/50"
                  style={{
                    background:
                      nextSlide.background.type === 'gradient' && nextSlide.background.gradient
                        ? `linear-gradient(${nextSlide.background.gradient.from}, ${nextSlide.background.gradient.to})`
                        : nextSlide.background.color || '#0f172a',
                  }}
                >
                  {nextSlide.elements.slice(0, 8).map((el) => (
                    <div
                      key={el.id}
                      className="absolute rounded-sm opacity-70"
                      style={{
                        left: `${(el.x / 1000) * 100}%`,
                        top: `${(el.y / 562.5) * 100}%`,
                        width: `${Math.max((el.width / 1000) * 100, 6)}%`,
                        height: `${Math.max((el.height / 562.5) * 100, 6)}%`,
                        backgroundColor:
                          el.type === 'text' ? el.color || '#ffffff' : el.fillColor || '#818cf8',
                      }}
                    />
                  ))}
                  <div className="absolute bottom-2 left-2 text-[10px] font-semibold text-white drop-shadow">
                    {nextSlide.title}
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-500">
                  Fin de la présentation atteinte.
                </div>
              )}
            </div>
          </div>

          {/* Speaker notes */}
          <div className="flex-[2] flex flex-col min-h-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Notes du présentateur
              </span>
            </div>
            <div className="flex-1 overflow-y-auto text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans p-1">
              {currentSlide.notes && currentSlide.notes.trim() ? (
                currentSlide.notes
              ) : (
                <span className="text-slate-500 italic">
                  Aucune note de conférence rédigée pour cette diapositive.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
