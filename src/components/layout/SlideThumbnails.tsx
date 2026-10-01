import React, { useState } from 'react';
import { Slide, SlideLayout } from '../../types/slides';
import {
  Plus,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Layout,
  PaintBucket,
  MoreVertical,
} from 'lucide-react';
import { ColorPicker } from '../common/ColorPicker';

interface SlideThumbnailsProps {
  slides: Slide[];
  activeSlideId: string;
  onSelectSlide: (id: string) => void;
  onAddSlide: (layout?: SlideLayout) => void;
  onDuplicateSlide: (id: string) => void;
  onDeleteSlide: (id: string) => void;
  onMoveSlide: (id: string, direction: 'up' | 'down') => void;
  onToggleHideSlide: (id: string) => void;
  onChangeLayout: (id: string, layout: SlideLayout) => void;
  onChangeBackground: (id: string, color: string) => void;
}

export const SlideThumbnails: React.FC<SlideThumbnailsProps> = ({
  slides,
  activeSlideId,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
  onToggleHideSlide,
  onChangeLayout,
  onChangeBackground,
}) => {
  const [menuOpenSlideId, setMenuOpenSlideId] = useState<string | null>(null);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

  const activeSlide = slides.find((s) => s.id === activeSlideId) || slides[0];

  const LAYOUT_OPTIONS: { id: SlideLayout; label: string; desc: string }[] = [
    { id: 'title', label: 'Titre & Sous-titre', desc: 'Diapositive d’ouverture' },
    { id: 'title-content', label: 'Titre & Contenu', desc: 'Texte ou visuels' },
    { id: 'two-column', label: 'Deux Colonnes', desc: 'Blocs côte à côte' },
    { id: 'comparison', label: 'Comparaison', desc: 'Avant / Après' },
    { id: 'quote', label: 'Citation / Emphase', desc: 'Grand texte percutant' },
    { id: 'section-header', label: 'En-tête de Section', desc: 'Transition de chapitre' },
    { id: 'blank', label: 'Page Vierge', desc: 'Libre totale' },
  ];

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none shrink-0 z-20">
      {/* Top Header of Left Sidebar */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Diapositives ({slides.length})
        </span>

        {/* Add Slide Button */}
        <button
          onClick={() => onAddSlide('title-content')}
          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors"
          title="Ajouter une diapositive"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ajouter</span>
        </button>
      </div>

      {/* Thumbnails Scroll List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {slides.map((slide, idx) => {
          const isActive = slide.id === activeSlideId;

          return (
            <div
              key={slide.id}
              onClick={() => onSelectSlide(slide.id)}
              className={`group relative rounded-xl border transition-all cursor-pointer overflow-hidden ${
                isActive
                  ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
              } ${slide.hidden ? 'opacity-40' : ''}`}
            >
              {/* Mini Slide Render Frame */}
              <div
                className="w-full aspect-video relative flex flex-col justify-between p-2 overflow-hidden"
                style={{
                  background:
                    slide.background.type === 'gradient' && slide.background.gradient
                      ? `linear-gradient(${slide.background.gradient.from}, ${slide.background.gradient.to})`
                      : slide.background.color || '#0f172a',
                }}
              >
                {/* Badge Number */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-slate-300 font-bold">
                    {idx + 1}
                  </span>

                  {slide.hidden && (
                    <span
                      title="Diapositive masquée"
                      className="text-amber-400 bg-black/60 px-1 rounded text-[10px]"
                    >
                      <EyeOff className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Mini Elements Silhouette Preview */}
                <div className="flex-1 relative my-1 overflow-hidden pointer-events-none">
                  {slide.elements.slice(0, 5).map((el) => (
                    <div
                      key={el.id}
                      className="absolute rounded-sm opacity-60"
                      style={{
                        left: `${(el.x / 1000) * 100}%`,
                        top: `${(el.y / 562.5) * 100}%`,
                        width: `${Math.max((el.width / 1000) * 100, 8)}%`,
                        height: `${Math.max((el.height / 562.5) * 100, 6)}%`,
                        backgroundColor:
                          el.type === 'text'
                            ? el.color || '#ffffff'
                            : el.fillColor || '#818cf8',
                      }}
                    />
                  ))}
                </div>

                {/* Slide Title preview */}
                <div className="text-[10px] font-semibold text-white/90 truncate drop-shadow">
                  {slide.title || `Diapositive ${idx + 1}`}
                </div>
              </div>

              {/* Hover Quick Actions Menu */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-slate-950/80 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveSlide(slide.id, 'up');
                  }}
                  disabled={idx === 0}
                  className="p-1 hover:text-white text-slate-400 disabled:opacity-20"
                  title="Monter"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveSlide(slide.id, 'down');
                  }}
                  disabled={idx === slides.length - 1}
                  className="p-1 hover:text-white text-slate-400 disabled:opacity-20"
                  title="Descendre"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSlide(slide.id);
                  }}
                  className="p-1 hover:text-white text-slate-400"
                  title="Dupliquer"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleHideSlide(slide.id);
                  }}
                  className="p-1 hover:text-white text-slate-400"
                  title={slide.hidden ? 'Afficher' : 'Masquer'}
                >
                  {slide.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                {slides.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSlide(slide.id);
                    }}
                    className="p-1 hover:text-red-400 text-slate-400"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Slide Customizer (Layout & Background) */}
      {activeSlide && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2 text-xs">
          {/* Change Layout */}
          <div className="relative">
            <button
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
            >
              <span className="flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mise en page</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {activeSlide.layout}
              </span>
            </button>

            {showLayoutMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLayoutMenu(false)}
                />
                <div className="absolute bottom-12 left-0 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Choisir une mise en page
                  </div>
                  {LAYOUT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onChangeLayout(activeSlide.id, opt.id);
                        setShowLayoutMenu(false);
                      }}
                      className={`w-full p-2 text-left rounded-lg transition-colors flex flex-col ${
                        activeSlide.layout === opt.id
                          ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="text-xs">{opt.label}</span>
                      <span className="text-[10px] text-slate-500">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Change Slide Background */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="flex items-center gap-1.5 text-slate-300">
              <PaintBucket className="w-3.5 h-3.5 text-cyan-400" />
              <span>Arrière-plan</span>
            </span>
            <ColorPicker
              color={activeSlide.background.color || '#0f172a'}
              onChange={(c) => onChangeBackground(activeSlide.id, c)}
              showTransparent={false}
            />
          </div>
        </div>
      )}
    </aside>
  );
};
