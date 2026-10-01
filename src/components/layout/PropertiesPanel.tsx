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
} from 'lucide-react';
import { ColorPicker } from '../common/ColorPicker';

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
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Sliders className="w-8 h-8 mx-auto text-slate-700" />
                <p className="text-xs">Sélectionnez un élément sur la diapositive pour afficher ses propriétés.</p>
              </div>
            )}
          </>
        )}

        {/* ==================== ONGLET CALQUES ==================== */}
        {activeTab === 'layers' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ordre des calques (Z-Index)
              </span>
              <span className="text-[10px] text-slate-500">
                {activeSlide.elements.length} objets
              </span>
            </div>

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
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, {
                        animation: {
                          type: e.target.value as AnimationType,
                          trigger: selectedElement.animation?.trigger || 'after-previous',
                          duration: selectedElement.animation?.duration || 0.6,
                          delay: selectedElement.animation?.delay || 0.1,
                          order: selectedElement.animation?.order || 1,
                        },
                      })
                    }
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
