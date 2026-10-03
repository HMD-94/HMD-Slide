import React, { useState } from 'react';
import {
  Slide,
  SlideElement,
  AnimationType,
  AnimationTrigger,
  TransitionType,
} from '../../types/slides';
import {
  Sliders,
  Layers,
  Sparkles,
  Film,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  Table,
  BarChart2,
  Image as ImageIcon,
  Type,
  Wallpaper,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Plus,
  Minus,
  Layout,
  Upload,
} from 'lucide-react';
import { ColorPicker } from '../common/ColorPicker';
import { getSlideBackgroundCss } from '../../utils/background';
import { GRADIENT_PRESETS } from '../../constants/wallpapers';

interface PropertiesPanelProps {
  activeSlide: Slide;
  selectedElement: SlideElement | null;
  onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
  onUpdateSlide: (updates: Partial<Slide>) => void;
  onSelectElement: (id: string) => void;
  onOpenChartEditor: (el: SlideElement) => void;
  onOpenTableEditor: (el: SlideElement) => void;
  onApplyTransitionToAll: (transition: Slide['transition']) => void;
  onReorderElement: (id: string, direction: 'up' | 'down') => void;
  onBringToFront?: (id: string) => void;
  onSendToBack?: (id: string) => void;
  onPreviewAnimation?: (id: string, animType: AnimationType) => void;
  onOpenBackgroundModal?: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  activeSlide,
  selectedElement,
  onUpdateElement,
  onUpdateSlide,
  onSelectElement,
  onOpenChartEditor,
  onOpenTableEditor,
  onApplyTransitionToAll,
  onReorderElement,
  onBringToFront,
  onSendToBack,
  onPreviewAnimation,
  onOpenBackgroundModal,
}) => {
  const [activeTab, setActiveTab] = useState<'props' | 'layers' | 'anim' | 'trans'>('props');

  return (
    <aside className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col h-full select-none shrink-0 z-20 text-xs text-slate-200">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 p-1 bg-slate-950/60">
        {[
          { id: 'props', label: 'Propriétés', icon: Sliders },
          { id: 'layers', label: 'Calques', icon: Layers },
          { id: 'anim', label: 'Anim', icon: Sparkles },
          { id: 'trans', label: 'Transit.', icon: Film },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-1.5 flex flex-col items-center gap-1 rounded-md transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ==================== ONGLET PROPRIÉTÉS ==================== */}
        {activeTab === 'props' && (
          <>
            {selectedElement ? (
              <div className="space-y-4">
                {/* Identification */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Élément sélectionné
                  </label>
                  <input
                    type="text"
                    value={selectedElement.name}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, { name: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white font-medium"
                  />
                </div>

                {/* Saisie directe du texte pour modification immédiate */}
                {selectedElement.type === 'text' && (
                  <>
                    <div className="p-3 bg-indigo-950/40 border-2 border-indigo-500/60 rounded-xl space-y-2 shadow-inner">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5 text-indigo-400" />
                          Zone de texte (Modifier)
                        </label>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 bg-indigo-600/40 text-indigo-200 rounded font-bold">
                          En direct
                        </span>
                      </div>
                      <textarea
                        value={selectedElement.content || ''}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, { content: e.target.value })
                        }
                        rows={3}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-y leading-relaxed font-sans placeholder-slate-500"
                        placeholder="Tapez le texte ici..."
                      />
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Tapez ici pour modifier le texte en direct sur la diapositive.
                      </p>
                    </div>

                    {/* Section Typographie & Taille du texte (Agrandir / Rapetisser) */}
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                          Taille de Police (Agrandir / Rapetisser)
                        </label>
                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5">
                          <input
                            type="number"
                            min="8"
                            max="260"
                            value={selectedElement.fontSize || 24}
                            onChange={(e) => {
                              const sz = parseInt(e.target.value) || 24;
                              onUpdateElement(selectedElement.id, {
                                fontSize: sz,
                                height: Math.max(selectedElement.height, Math.round(sz * 1.35)),
                              });
                            }}
                            className="w-9 bg-transparent font-mono text-cyan-300 font-bold text-xs text-right focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-400 font-mono">px</span>
                        </div>
                      </div>

                      {/* Font Size A- / Slider / A+ buttons */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const current = selectedElement.fontSize || 24;
                              const next = Math.max(8, current - (current > 32 ? 6 : current > 20 ? 4 : 2));
                              onUpdateElement(selectedElement.id, {
                                fontSize: next,
                                height: Math.max(selectedElement.height, Math.round(next * 1.35)),
                              });
                            }}
                            className="flex-1 py-1.5 bg-slate-900 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 rounded-lg text-xs font-bold text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-1 active:scale-95"
                            title="Rapetisser le texte (A-)"
                          >
                            <Minus className="w-3.5 h-3.5 text-slate-400" />
                            <span>Rapetisser (A-)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const current = selectedElement.fontSize || 24;
                              const next = Math.min(260, current + (current >= 32 ? 6 : current >= 20 ? 4 : 2));
                              onUpdateElement(selectedElement.id, {
                                fontSize: next,
                                height: Math.max(selectedElement.height, Math.round(next * 1.35)),
                              });
                            }}
                            className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-md shadow-indigo-600/30 active:scale-95"
                            title="Agrandir le texte (A+)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agrandir (A+)</span>
                          </button>
                        </div>

                        {/* Slider */}
                        <input
                          type="range"
                          min="8"
                          max="160"
                          step="1"
                          value={selectedElement.fontSize || 24}
                          onChange={(e) => {
                            const sz = parseInt(e.target.value) || 24;
                            onUpdateElement(selectedElement.id, {
                              fontSize: sz,
                              height: Math.max(selectedElement.height, Math.round(sz * 1.35)),
                            });
                          }}
                          className="w-full accent-indigo-500"
                        />

                        {/* Quick Size Preset Chips */}
                        <div className="flex items-center gap-1 pt-1 overflow-x-auto pb-1">
                          {[12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() =>
                                onUpdateElement(selectedElement.id, {
                                  fontSize: sz,
                                  height: Math.max(selectedElement.height, Math.round(sz * 1.35)),
                                })
                              }
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors shrink-0 ${
                                (selectedElement.fontSize || 24) === sz
                                  ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font Family Selection */}
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Police</label>
                        <select
                          value={selectedElement.fontFamily || 'inherit'}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, { fontFamily: e.target.value })
                          }
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none"
                        >
                          <option value="Cabinet Grotesk, sans-serif">Cabinet Grotesk</option>
                          <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans</option>
                          <option value="Inter, sans-serif">Inter</option>
                          <option value="Montserrat, sans-serif">Montserrat</option>
                          <option value="Playfair Display, serif">Playfair Display</option>
                          <option value="Merriweather, serif">Merriweather</option>
                          <option value="Syne, sans-serif">Syne</option>
                          <option value="JetBrains Mono, monospace">JetBrains Mono</option>
                        </select>
                      </div>

                      {/* Styling: Bold, Italic, Underline & Alignment */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateElement(selectedElement.id, {
                                fontWeight: selectedElement.fontWeight === '700' ? '400' : '700',
                              })
                            }
                            className={`p-1.5 rounded ${
                              selectedElement.fontWeight === '700'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title="Gras"
                          >
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateElement(selectedElement.id, {
                                fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic',
                              })
                            }
                            className={`p-1.5 rounded ${
                              selectedElement.fontStyle === 'italic'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title="Italique"
                          >
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateElement(selectedElement.id, {
                                underline: !selectedElement.underline,
                              })
                            }
                            className={`p-1.5 rounded ${
                              selectedElement.underline
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title="Souligné"
                          >
                            <Underline className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'left' })}
                            className={`p-1.5 rounded ${
                              (selectedElement.textAlign || 'left') === 'left'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title="Aligner à gauche"
                          >
                            <AlignLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'center' })}
                            className={`p-1.5 rounded ${
                              selectedElement.textAlign === 'center'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title="Centrer"
                          >
                            <AlignCenter className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'right' })}
                            className={`p-1.5 rounded ${
                              selectedElement.textAlign === 'right'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title="Aligner à droite"
                          >
                            <AlignRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Color */}
                      <div className="pt-2 border-t border-slate-800/80">
                        <ColorPicker
                          label="Couleur du texte"
                          color={selectedElement.color || '#ffffff'}
                          onChange={(c) => onUpdateElement(selectedElement.id, { color: c })}
                          showTransparent={false}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Geometry (X, Y, W, H, Rotation) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Position & Dimensions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 border border-slate-800 rounded">
                      <span className="text-slate-500 font-mono text-[10px]">X</span>
                      <input
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            x: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-transparent text-right font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 border border-slate-800 rounded">
                      <span className="text-slate-500 font-mono text-[10px]">Y</span>
                      <input
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            y: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-transparent text-right font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 border border-slate-800 rounded">
                      <span className="text-slate-500 font-mono text-[10px]">L</span>
                      <input
                        type="number"
                        value={selectedElement.width}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            width: Math.max(10, parseInt(e.target.value) || 10),
                          })
                        }
                        className="w-full bg-transparent text-right font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 border border-slate-800 rounded">
                      <span className="text-slate-500 font-mono text-[10px]">H</span>
                      <input
                        type="number"
                        value={selectedElement.height}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            height: Math.max(10, parseInt(e.target.value) || 10),
                          })
                        }
                        className="w-full bg-transparent text-right font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Rotation */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Rotation</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={selectedElement.rotation || 0}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            rotation: parseInt(e.target.value),
                          })
                        }
                        className="w-24 accent-indigo-500"
                      />
                      <span className="font-mono text-[10px] w-8 text-right">
                        {selectedElement.rotation || 0}°
                      </span>
                    </div>
                  </div>

                  {/* Opacity */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400">Opacité</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={selectedElement.opacity !== undefined ? selectedElement.opacity : 1}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            opacity: parseFloat(e.target.value),
                          })
                        }
                        className="w-24 accent-indigo-500"
                      />
                      <span className="font-mono text-[10px] w-8 text-right">
                        {Math.round(
                          (selectedElement.opacity !== undefined ? selectedElement.opacity : 1) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </div>

                  {/* Layer Ordering / Plan */}
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Disposition du plan
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onReorderElement(selectedElement.id, 'up')}
                        className="px-2 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded text-xs text-indigo-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        title="Avancer d'un cran"
                      >
                        <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Avancer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onReorderElement(selectedElement.id, 'down')}
                        className="px-2 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded text-xs text-indigo-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        title="Reculer d'un cran"
                      >
                        <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Reculer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onBringToFront?.(selectedElement.id)}
                        className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-slate-300 flex items-center justify-center gap-1 transition-colors"
                        title="Placer tout au-dessus"
                      >
                        <span>Premier plan</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onSendToBack?.(selectedElement.id)}
                        className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-slate-300 flex items-center justify-center gap-1 transition-colors"
                        title="Placer tout en-dessous"
                      >
                        <span>Arrière-plan</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Specific: Shape styling */}
                {selectedElement.type === 'shape' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Style de la Forme
                    </label>

                    <ColorPicker
                      label="Couleur de remplissage"
                      color={selectedElement.fillColor || '#4f46e5'}
                      onChange={(c) => onUpdateElement(selectedElement.id, { fillColor: c })}
                    />

                    {/* Stroke */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <ColorPicker
                        label="Contour"
                        color={selectedElement.strokeColor || '#ffffff'}
                        onChange={(c) => onUpdateElement(selectedElement.id, { strokeColor: c })}
                      />
                      <div>
                        <label className="text-xs text-slate-400 block mb-1 font-medium">
                          Épaisseur
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={selectedElement.strokeWidth || 0}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              strokeWidth: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Border radius */}
                    {selectedElement.shapeType === 'rounded-rect' && (
                      <div>
                        <label className="text-xs text-slate-400 block mb-1 font-medium">
                          Rayon d’arrondi
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={selectedElement.borderRadius || 16}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              borderRadius: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Specific: Chart launcher */}
                {selectedElement.type === 'chart' && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Données du Graphique
                    </label>
                    <button
                      type="button"
                      onClick={() => onOpenChartEditor(selectedElement)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-600/20"
                    >
                      <BarChart2 className="w-4 h-4" /> Éditer les séries & valeurs
                    </button>
                  </div>
                )}

                {/* Specific: Table launcher */}
                {selectedElement.type === 'table' && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Données du Tableau
                    </label>
                    <button
                      type="button"
                      onClick={() => onOpenTableEditor(selectedElement)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-600/20"
                    >
                      <Table className="w-4 h-4" /> Configurer le tableau
                    </button>
                  </div>
                )}

                {/* Specific: Image filters */}
                {selectedElement.type === 'image' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Filtres d’Image
                    </label>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Luminosité</span>
                        <span>{selectedElement.brightness || 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={selectedElement.brightness || 100}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            brightness: parseInt(e.target.value),
                          })
                        }
                        className="w-full accent-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Contraste</span>
                        <span>{selectedElement.contrast || 100}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={selectedElement.contrast || 100}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            contrast: parseInt(e.target.value),
                          })
                        }
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                    Diapositive active
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">
                    {activeSlide.elements.length} élément{activeSlide.elements.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Section Arrière-plan & Fonds d'écran */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Wallpaper className="w-4 h-4 text-cyan-400" />
                      Fond d’écran & Arrière-plan
                    </span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {activeSlide.background.type}
                    </span>
                  </div>

                  {/* Visual Background Thumbnail */}
                  <div
                    className="w-full aspect-video rounded-lg shadow-inner border border-white/10 relative overflow-hidden flex items-end p-2"
                    style={getSlideBackgroundCss(activeSlide.background)}
                  >
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-slate-200">
                      Aperçu actuel
                    </span>
                  </div>

                  {/* Main Launcher Button for Background Modal */}
                  {onOpenBackgroundModal && (
                    <button
                      type="button"
                      onClick={onOpenBackgroundModal}
                      className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fonds d'écran & Dégradés...</span>
                    </button>
                  )}

                  {/* Quick Color Picker */}
                  <div className="pt-2 border-t border-slate-800">
                    <ColorPicker
                      label="Couleur unie"
                      color={activeSlide.background.color || '#0f172a'}
                      onChange={(color) =>
                        onUpdateSlide({
                          background: {
                            type: 'solid',
                            color,
                          },
                        })
                      }
                      showTransparent={false}
                    />
                  </div>

                  {/* Quick Gradient Models */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      Dégradés rapides
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {GRADIENT_PRESETS.slice(0, 8).map((gp) => (
                        <button
                          key={gp.id}
                          type="button"
                          onClick={() =>
                            onUpdateSlide({
                              background: {
                                type: 'gradient',
                                color: gp.to,
                                gradient: {
                                  from: gp.from,
                                  to: gp.to,
                                  direction: `${gp.angle}deg`,
                                  angle: gp.angle,
                                },
                              },
                            })
                          }
                          className="aspect-square rounded-lg border border-white/10 hover:border-cyan-400 hover:scale-105 transition-all shadow-sm"
                          style={{
                            backgroundImage: `linear-gradient(${gp.angle}deg, ${gp.from}, ${gp.to})`,
                          }}
                          title={gp.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section Mise en page (Layout) */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Layout className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Mise en page</span>
                  </div>
                  <select
                    value={activeSlide.layout}
                    onChange={(e) => onUpdateSlide({ layout: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="title">Titre & Sous-titre</option>
                    <option value="title-content">Titre & Contenu</option>
                    <option value="two-column">Deux Colonnes</option>
                    <option value="comparison">Comparaison</option>
                    <option value="quote">Citation / Emphase</option>
                    <option value="section-header">En-tête de section</option>
                    <option value="blank">Page Vierge</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}

        {/* ==================== ONGLET CALQUES ==================== */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ordre des calques
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {activeSlide.elements.length} objets
              </span>
            </div>

            {/* Quick Layer Controls for selected element */}
            {selectedElement && (
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Action sur « {selectedElement.name} » :
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onBringToFront?.(selectedElement.id)}
                    className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded text-[11px] text-white flex items-center justify-center gap-1 transition-colors"
                    title="Mettre tout en haut de la pile"
                  >
                    <span>Premier plan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSendToBack?.(selectedElement.id)}
                    className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded text-[11px] text-white flex items-center justify-center gap-1 transition-colors"
                    title="Mettre tout en bas de la pile"
                  >
                    <span>Arrière-plan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onReorderElement(selectedElement.id, 'up')}
                    className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded text-[11px] text-indigo-300 flex items-center justify-center gap-1 transition-colors"
                    title="Avancer d’un cran"
                  >
                    <ArrowUp className="w-3 h-3" />
                    <span>Avancer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onReorderElement(selectedElement.id, 'down')}
                    className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded text-[11px] text-indigo-300 flex items-center justify-center gap-1 transition-colors"
                    title="Reculer d’un cran"
                  >
                    <ArrowDown className="w-3 h-3" />
                    <span>Reculer</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {activeSlide.elements
                .slice()
                .sort((a, b) => (b.zIndex || 1) - (a.zIndex || 1))
                .map((el) => {
                  const isSelected = selectedElement?.id === el.id;
                  return (
                    <div
                      key={el.id}
                      onClick={() => onSelectElement(el.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate max-w-[120px]">
                        <span className="text-[10px] font-mono text-slate-500">
                          {el.zIndex || 1}
                        </span>
                        <span className="truncate">{el.name || el.type}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Up / Down */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorderElement(el.id, 'up');
                          }}
                          className="p-1 hover:text-white text-slate-400"
                          title="Monter"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorderElement(el.id, 'down');
                          }}
                          className="p-1 hover:text-white text-slate-400"
                          title="Descendre"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>

                        {/* Lock */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateElement(el.id, { locked: !el.locked });
                          }}
                          className="p-1 hover:text-white text-slate-400"
                          title={el.locked ? 'Déverrouiller' : 'Verrouiller'}
                        >
                          {el.locked ? (
                            <Lock className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Unlock className="w-3 h-3" />
                          )}
                        </button>

                        {/* Visibility */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateElement(el.id, { hidden: !el.hidden });
                          }}
                          className="p-1 hover:text-white text-slate-400"
                          title={el.hidden ? 'Afficher' : 'Masquer'}
                        >
                          {el.hidden ? (
                            <EyeOff className="w-3 h-3 text-red-400" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ==================== ONGLET ANIMATIONS ==================== */}
        {activeTab === 'anim' && (
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Animations de l’objet
            </span>

            {selectedElement ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Effet d’entrée</label>
                  <select
                    value={selectedElement.animation?.type || 'none'}
                    onChange={(e) => {
                      const newType = e.target.value as AnimationType;
                      onUpdateElement(selectedElement.id, {
                        animation: {
                          type: newType,
                          trigger: selectedElement.animation?.trigger || 'after-previous',
                          duration: selectedElement.animation?.duration || 0.6,
                          delay: selectedElement.animation?.delay || 0.1,
                          order: selectedElement.animation?.order || 1,
                        },
                      });
                      if (newType !== 'none') {
                        onPreviewAnimation?.(selectedElement.id, newType);
                      }
                    }}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                  >
                    <option value="none">Aucune animation</option>
                    <option value="fade-in">Fondu (Fade In)</option>
                    <option value="slide-up">Glissement vers le haut</option>
                    <option value="slide-down">Glissement vers le bas</option>
                    <option value="slide-left">Glissement depuis la droite</option>
                    <option value="slide-right">Glissement depuis la gauche</option>
                    <option value="zoom-in">Zoom Avant (Pop)</option>
                    <option value="bounce-in">Rebondissement</option>
                  </select>
                </div>

                {selectedElement.animation?.type !== 'none' && (
                  <>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Déclencheur</label>
                      <select
                        value={selectedElement.animation?.trigger || 'after-previous'}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            animation: {
                              ...selectedElement.animation!,
                              trigger: e.target.value as AnimationTrigger,
                            },
                          })
                        }
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                      >
                        <option value="click">Au clic / touche Espace</option>
                        <option value="after-previous">Après le précédent</option>
                        <option value="with-previous">Avec le précédent</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Durée (s)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="5"
                          value={selectedElement.animation?.duration || 0.6}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              animation: {
                                ...selectedElement.animation!,
                                duration: parseFloat(e.target.value) || 0.6,
                              },
                            })
                          }
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Délai (s)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={selectedElement.animation?.delay || 0}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              animation: {
                                ...selectedElement.animation!,
                                delay: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Bouton de prévisualisation directe de l'animation */}
                    <button
                      type="button"
                      onClick={() =>
                        onPreviewAnimation?.(
                          selectedElement.id,
                          selectedElement.animation?.type || 'fade-in'
                        )
                      }
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30 active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>Prévisualiser l’animation</span>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">
                Sélectionnez un objet pour configurer ses animations.
              </p>
            )}
          </div>
        )}

        {/* ==================== ONGLET TRANSITIONS ==================== */}
        {activeTab === 'trans' && (
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Transition de la diapositive
            </span>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Type de transition</label>
              <select
                value={activeSlide.transition.type}
                onChange={(e) =>
                  onUpdateSlide({
                    transition: {
                      ...activeSlide.transition,
                      type: e.target.value as TransitionType,
                    },
                  })
                }
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
              >
                <option value="none">Aucune</option>
                <option value="fade">Fondu doux (Fade)</option>
                <option value="slide">Glissement latéral</option>
                <option value="push">Poussée verticale</option>
                <option value="zoom">Zoom dynamique</option>
                <option value="flip">Bascule 3D</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Durée : {activeSlide.transition.duration}s
              </label>
              <input
                type="range"
                min="0.2"
                max="2"
                step="0.1"
                value={activeSlide.transition.duration}
                onChange={(e) =>
                  onUpdateSlide({
                    transition: {
                      ...activeSlide.transition,
                      duration: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full accent-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={() => onApplyTransitionToAll(activeSlide.transition)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 hover:text-white font-medium transition-colors"
            >
              Appliquer à toutes les diapositives
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
