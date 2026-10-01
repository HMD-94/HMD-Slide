import React, { useState, useRef, useEffect } from 'react';
import {
  Presentation,
  EditorSettings,
} from '../../types/slides';
import {
  Play,
  MonitorPlay,
  Download,
  Settings2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Sparkles,
  FileText,
  Save,
  FolderOpen,
  Copy,
  Scissors,
  Clipboard,
  Trash2,
  Grid,
  Palette,
  HelpCircle,
  Check,
} from 'lucide-react';

interface HeaderProps {
  presentation: Presentation;
  settings: EditorSettings;
  canUndo: boolean;
  canRedo: boolean;
  isSaved: boolean;
  zoom: number;
  onUpdateTitle: (title: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomChange: (newZoom: number) => void;
  onNewPresentation: () => void;
  onOpenFilePicker: () => void;
  onSaveManual: () => void;
  onExportModalOpen: () => void;
  onThemeModalOpen: () => void;
  onSettingsModalOpen: () => void;
  onStartPresentation: (fromCurrent?: boolean) => void;
  onStartPresenterMode: () => void;
  onAddSlide: () => void;
  onDuplicateSlide: () => void;
  onDeleteSlide: () => void;
  onToggleGrid: () => void;
  onInsertTool: (tool: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  presentation,
  settings,
  canUndo,
  canRedo,
  isSaved,
  zoom,
  onUpdateTitle,
  onUndo,
  onRedo,
  onZoomChange,
  onNewPresentation,
  onOpenFilePicker,
  onSaveManual,
  onExportModalOpen,
  onThemeModalOpen,
  onSettingsModalOpen,
  onStartPresentation,
  onStartPresenterMode,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onToggleGrid,
  onInsertTool,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(presentation.title);
  const [showHelp, setShowHelp] = useState(false);
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleInput(presentation.title);
  }, [presentation.title]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    } else {
      setTitleInput(presentation.title);
    }
  };

  const toggleMenu = (name: string) => {
    setActiveMenu(activeMenu === name ? null : name);
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none relative z-40 text-slate-200">
      {/* Zone 1: Logo & Title & Menus */}
      <div className="flex items-center gap-4" ref={menuBarRef}>
        {/* Brand Lockup */}
        <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white font-['Cabinet_Grotesk']">
            HMD Slides
          </span>
        </div>

        {/* Project Title + Status */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTitleInput(presentation.title);
                  setIsEditingTitle(false);
                }
              }}
              className="px-2 py-0.5 bg-slate-950 border border-indigo-500 rounded text-xs font-semibold text-white focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-xs font-semibold text-slate-100 hover:text-white px-2 py-1 rounded hover:bg-slate-800/80 transition-colors truncate max-w-[200px]"
              title="Cliquez pour renommer"
            >
              {presentation.title}
            </button>
          )}

          {/* Save status badge */}
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/50">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSaved ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            {isSaved ? 'Enregistré' : 'Enregistrement...'}
          </span>
        </div>

        {/* Menu Bar Dropdowns */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-300 ml-2">
          {/* Menu Fichier */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('file')}
              className={`px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                activeMenu === 'file' ? 'bg-slate-800 text-white' : ''
              }`}
            >
              Fichier
            </button>
            {activeMenu === 'file' && (
              <div className="absolute left-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    onNewPresentation();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Nouveau diaporama
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+N</span>
                </button>
                <button
                  onClick={() => {
                    onOpenFilePicker();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen className="w-3.5 h-3.5" /> Ouvrir...
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+O</span>
                </button>
                <button
                  onClick={() => {
                    onSaveManual();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Save className="w-3.5 h-3.5" /> Enregistrer localement
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+S</span>
                </button>
                <div className="h-px bg-slate-800 my-1" />
                <button
                  onClick={() => {
                    onExportModalOpen();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 flex items-center gap-2 text-indigo-300 font-semibold"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" /> Exporter (HTML, .hmdslides, PDF)
                </button>
              </div>
            )}
          </div>

          {/* Menu Édition */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('edit')}
              className={`px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                activeMenu === 'edit' ? 'bg-slate-800 text-white' : ''
              }`}
            >
              Édition
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute left-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    onUndo();
                    setActiveMenu(null);
                  }}
                  disabled={!canUndo}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 disabled:opacity-30 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Undo2 className="w-3.5 h-3.5" /> Annuler
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+Z</span>
                </button>
                <button
                  onClick={() => {
                    onRedo();
                    setActiveMenu(null);
                  }}
                  disabled={!canRedo}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 disabled:opacity-30 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Redo2 className="w-3.5 h-3.5" /> Rétablir
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+Y</span>
                </button>
                <div className="h-px bg-slate-800 my-1" />
                <button
                  onClick={() => {
                    onThemeModalOpen();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 flex items-center gap-2"
                >
                  <Palette className="w-3.5 h-3.5 text-indigo-400" /> Thèmes & Styles
                </button>
              </div>
            )}
          </div>

          {/* Menu Insertion */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('insert')}
              className={`px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                activeMenu === 'insert' ? 'bg-slate-800 text-white' : ''
              }`}
            >
              Insertion
            </button>
            {activeMenu === 'insert' && (
              <div className="absolute left-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                {['Texte', 'Forme', 'Image', 'Tableau', 'Graphique', 'Diagramme', 'Icônes'].map((tool) => (
                  <button
                    key={tool}
                    onClick={() => {
                      onInsertTool(tool.toLowerCase());
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 flex items-center gap-2"
                  >
                    <span>{tool}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Menu Diapositive */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('slide')}
              className={`px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                activeMenu === 'slide' ? 'bg-slate-800 text-white' : ''
              }`}
            >
              Diapositive
            </button>
            {activeMenu === 'slide' && (
              <div className="absolute left-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    onAddSlide();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 flex items-center gap-2"
                >
                  Nouvelle diapositive
                </button>
                <button
                  onClick={() => {
                    onDuplicateSlide();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 flex items-center gap-2"
                >
                  Dupliquer la diapositive
                </button>
                <button
                  onClick={() => {
                    onDeleteSlide();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-red-600/30 text-red-400 flex items-center gap-2"
                >
                  Supprimer la diapositive
                </button>
              </div>
            )}
          </div>

          {/* Menu Affichage */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('view')}
              className={`px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                activeMenu === 'view' ? 'bg-slate-800 text-white' : ''
              }`}
            >
              Affichage
            </button>
            {activeMenu === 'view' && (
              <div className="absolute left-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    onToggleGrid();
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Grid className="w-3.5 h-3.5" /> Grille
                  </span>
                  {settings.showGrid && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
                <div className="h-px bg-slate-800 my-1" />
                <button
                  onClick={() => {
                    onZoomChange(0.75);
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30"
                >
                  Zoom 75%
                </button>
                <button
                  onClick={() => {
                    onZoomChange(1.0);
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30"
                >
                  Zoom 100% (Taille réelle)
                </button>
                <button
                  onClick={() => {
                    onZoomChange(1.25);
                    setActiveMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-600/30"
                >
                  Zoom 125%
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Zone 2: Undo, Redo, Zoom controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-950/60 p-1 rounded-lg border border-slate-800">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Annuler (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Rétablir (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => onZoomChange(Math.max(0.4, zoom - 0.1))}
            className="text-slate-400 hover:text-white pr-1"
            title="Zoom arrière"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-11 text-center font-semibold text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(1.8, zoom + 0.1))}
            className="text-slate-400 hover:text-white pl-1"
            title="Zoom avant"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Zone 3: Primary Actions (Presentation & Export) */}
      <div className="flex items-center gap-2">
        {/* Presenter Mode */}
        <button
          onClick={onStartPresenterMode}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
          title="Mode Présentateur avec chronomètre et notes secrètes"
        >
          <MonitorPlay className="w-4 h-4 text-indigo-400" />
          <span>Mode Présentateur</span>
        </button>

        {/* Fullscreen Presentation Mode (F5) */}
        <button
          onClick={() => onStartPresentation(false)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50"
          title="Lancer le diaporama en plein écran (F5)"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Présenter</span>
          <span className="text-[10px] font-mono opacity-70">F5</span>
        </button>

        {/* Export Modal Trigger */}
        <button
          onClick={onExportModalOpen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
          title="Exporter le projet (HTML autonome, .hmdslides, PDF, PNG)"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline">Exporter</span>
        </button>

        {/* Settings */}
        <button
          onClick={onSettingsModalOpen}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Paramètres du projet"
        >
          <Settings2 className="w-4 h-4" />
        </button>

        {/* Help */}
        <button
          onClick={() => setShowHelp(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Raccourcis clavier"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Shortcuts Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 text-sm">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" /> Raccourcis Clavier
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { key: 'F5', label: 'Démarrer la présentation' },
                { key: 'Ctrl + Z', label: 'Annuler la dernière action' },
                { key: 'Ctrl + Y', label: 'Rétablir' },
                { key: 'Ctrl + D', label: 'Dupliquer l’objet sélectionné' },
                { key: 'Ctrl + S', label: 'Sauvegarder immédiatement' },
                { key: 'Suppr / Retour', label: 'Supprimer l’élément' },
                { key: 'Flèches / Espace', label: 'Diapositive suivante / précédente' },
                { key: 'L (en présentation)', label: 'Activer / désactiver le pointeur laser' },
                { key: 'Échap', label: 'Quitter le mode présentation' },
              ].map((s, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">{s.label}</span>
                  <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-300 font-semibold">
                    {s.key}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
