import React, { useState } from 'react';
import { SlideElement, ShapeType } from '../../types/slides';
import { SHAPE_DEFINITIONS } from '../../constants/shapes';
import {
  MousePointer,
  Type,
  Square,
  Image as ImageIcon,
  Table,
  BarChart2,
  GitCommit,
  Smile,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Trash2,
  Copy,
  Layers,
  Palette,
  Undo2,
  Redo2,
} from 'lucide-react';
import { ColorPicker } from '../common/ColorPicker';

interface ToolbarProps {
  selectedElement: SlideElement | null;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onAddText: () => void;
  onAddShape: (shapeType: ShapeType) => void;
  onAddImageClick: () => void;
  onAddTable: () => void;
  onAddChart: () => void;
  onAddDiagram: () => void;
  onOpenIconPicker: () => void;
  onOpenThemeModal: () => void;
  onUpdateElement: (id: string, updates: Partial<SlideElement>) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedElement,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onAddText,
  onAddShape,
  onAddImageClick,
  onAddTable,
  onAddChart,
  onAddDiagram,
  onOpenIconPicker,
  onOpenThemeModal,
  onUpdateElement,
  onDeleteSelected,
  onDuplicateSelected,
  onBringForward,
  onSendBackward,
}) => {
  const [showShapeMenu, setShowShapeMenu] = useState(false);

  const shapesList = Object.values(SHAPE_DEFINITIONS);

  return (
    <div className="h-11 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between text-xs select-none backdrop-blur-md z-30">
      {/* Insertion Tools Group */}
      <div className="flex items-center gap-1 overflow-x-auto py-1">
        {/* Undo / Redo in Toolbar */}
        {onUndo && onRedo && (
          <div className="flex items-center gap-0.5 border-r border-slate-800 pr-1.5 mr-1 shrink-0">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Annuler (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Rétablir (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Pointer (Selection) */}
        <button
          className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1 font-semibold shrink-0"
          title="Outil Sélection (V)"
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sélection</span>
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1 shrink-0" />

        {/* Text */}
        <button
          onClick={onAddText}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors shrink-0"
          title="Ajouter une zone de texte"
        >
          <Type className="w-4 h-4 text-indigo-400" />
          <span className="hidden md:inline">Texte</span>
        </button>

        {/* Shapes Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowShapeMenu(!showShapeMenu)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 transition-colors"
            title="Insérer une forme géométrique"
          >
            <Square className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Formes</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showShapeMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowShapeMenu(false)} />
              <div className="absolute left-0 mt-2 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 w-72">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Formes géométriques & symboles
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {shapesList.map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => {
                        onAddShape(shape.id);
                        setShowShapeMenu(false);
                      }}
                      className="p-2 rounded-lg bg-slate-950 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500 flex flex-col items-center justify-center transition-all group"
                      title={shape.label}
                    >
                      <svg width="24" height="24" viewBox="0 0 40 40" className="overflow-visible">
                        <path
                          d={shape.renderSvg(40, 40, 6)}
                          fill="#6366f1"
                          className="group-hover:fill-cyan-400 transition-colors"
                        />
                      </svg>
                      <span className="text-[9px] text-slate-400 group-hover:text-white truncate max-w-full mt-1">
                        {shape.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Image */}
        <button
          onClick={onAddImageClick}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors shrink-0"
          title="Importer une image depuis l’ordinateur"
        >
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">Image</span>
        </button>

        {/* Table */}
        <button
          onClick={onAddTable}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors shrink-0"
          title="Insérer un tableau modifiable"
        >
          <Table className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">Tableau</span>
        </button>

        {/* Chart */}
        <button
          onClick={onAddChart}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors shrink-0"
          title="Insérer un graphique dynamique"
        >
          <BarChart2 className="w-4 h-4 text-purple-400" />
          <span className="hidden md:inline">Graphique</span>
        </button>

        {/* Diagram */}
        <button
          onClick={onAddDiagram}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors shrink-0"
          title="Insérer un diagramme ou organigramme"
        >
          <GitCommit className="w-4 h-4 text-pink-400" />
          <span className="hidden lg:inline">Diagramme</span>
        </button>

        {/* Icons & Emojis */}
        <button
          onClick={onOpenIconPicker}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors shrink-0"
          title="Insérer une icône ou un émoji"
        >
          <Smile className="w-4 h-4 text-yellow-400" />
          <span className="hidden lg:inline">Icône</span>
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1 shrink-0" />

        {/* Themes Button */}
        <button
          onClick={onOpenThemeModal}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors shrink-0"
          title="Modifier le thème visuel du diaporama"
        >
          <Palette className="w-4 h-4 text-indigo-400" />
          <span className="hidden xl:inline">Thèmes</span>
        </button>
      </div>

      {/* Selected Element Quick Formatting Bar */}
      {selectedElement && (
        <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1 rounded-lg border border-slate-700/80 animate-in fade-in duration-200 shrink-0 ml-2">
          {/* Text Controls & Direct Text Input */}
          {selectedElement.type === 'text' && (
            <>
              {/* Direct text input */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-indigo-500/50 rounded-md px-2 py-0.5">
                <span className="text-[10px] text-indigo-400 font-bold uppercase shrink-0">Texte :</span>
                <input
                  type="text"
                  value={selectedElement.content || ''}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, { content: e.target.value })
                  }
                  className="bg-transparent text-white text-xs w-32 sm:w-44 focus:outline-none placeholder-slate-500"
                  placeholder="Modifier le texte..."
                  title="Modifier le contenu du texte en direct"
                />
              </div>

              {/* Font Family */}
              <select
                value={selectedElement.fontFamily || 'inherit'}
                onChange={(e) =>
                  onUpdateElement(selectedElement.id, { fontFamily: e.target.value })
                }
                className="bg-slate-900 border border-slate-700 text-white text-xs rounded px-2 py-0.5 focus:outline-none hidden sm:inline-block"
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

              {/* Font Size */}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="8"
                  max="120"
                  value={selectedElement.fontSize || 16}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, {
                      fontSize: parseInt(e.target.value) || 16,
                    })
                  }
                  className="w-12 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-white"
                />
                <span className="text-[10px] text-slate-500 font-mono">px</span>
              </div>

              {/* Bold */}
              <button
                type="button"
                onClick={() =>
                  onUpdateElement(selectedElement.id, {
                    fontWeight: selectedElement.fontWeight === '700' ? '400' : '700',
                  })
                }
                className={`p-1 rounded ${
                  selectedElement.fontWeight === '700'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Gras"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() =>
                  onUpdateElement(selectedElement.id, {
                    fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic',
                  })
                }
                className={`p-1 rounded ${
                  selectedElement.fontStyle === 'italic'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Italique"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              {/* Underline */}
              <button
                type="button"
                onClick={() =>
                  onUpdateElement(selectedElement.id, {
                    underline: !selectedElement.underline,
                  })
                }
                className={`p-1 rounded ${
                  selectedElement.underline
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Souligné"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>

              {/* Color */}
              <ColorPicker
                color={selectedElement.color || '#ffffff'}
                onChange={(c) => onUpdateElement(selectedElement.id, { color: c })}
                showTransparent={false}
              />
            </>
          )}

          {/* Shape Color */}
          {selectedElement.type === 'shape' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Fond :</span>
              <ColorPicker
                color={selectedElement.fillColor || '#4f46e5'}
                onChange={(c) => onUpdateElement(selectedElement.id, { fillColor: c })}
              />
            </div>
          )}

          {/* Layer Ordering: Avancer / Reculer d'un plan */}
          <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1.5">
            <button
              type="button"
              onClick={onBringForward}
              className="p-1 rounded text-slate-300 hover:text-indigo-300 hover:bg-slate-800 flex items-center gap-1 transition-colors"
              title="Avancer d’un plan"
            >
              <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] hidden md:inline">Avancer</span>
            </button>
            <button
              type="button"
              onClick={onSendBackward}
              className="p-1 rounded text-slate-300 hover:text-indigo-300 hover:bg-slate-800 flex items-center gap-1 transition-colors"
              title="Reculer d’un plan"
            >
              <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] hidden md:inline">Reculer</span>
            </button>
          </div>

          {/* Actions: Duplicate, Delete */}
          <div className="w-px h-4 bg-slate-800 mx-1" />
          <button
            onClick={onDuplicateSelected}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Dupliquer (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDeleteSelected}
            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800"
            title="Supprimer (Suppr)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

