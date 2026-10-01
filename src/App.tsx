import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Presentation,
  Slide,
  SlideElement,
  SlideLayout,
  ShapeType,
  EditorSettings,
} from './types/slides';
import {
  loadSavedPresentation,
  savePresentationToStorage,
  loadSavedSettings,
  saveSettingsToStorage,
  resetToDemoPresentation,
} from './utils/storage';
import { importProjectFromFile } from './utils/exportProject';
import { getThemeById } from './constants/themes';

import { Header } from './components/layout/Header';
import { Toolbar } from './components/layout/Toolbar';
import { SlideThumbnails } from './components/layout/SlideThumbnails';
import { CanvasEditor } from './components/canvas/CanvasEditor';
import { PropertiesPanel } from './components/layout/PropertiesPanel';
import { NotesDrawer } from './components/layout/NotesDrawer';

import { PresentationMode } from './components/presentation/PresentationMode';
import { PresenterMode } from './components/presentation/PresenterMode';

import { ChartEditorModal } from './components/modals/ChartEditorModal';
import { TableEditorModal } from './components/modals/TableEditorModal';
import { IconPickerModal } from './components/modals/IconPickerModal';
import { DiagramModal } from './components/modals/DiagramModal';
import { ThemeModal } from './components/modals/ThemeModal';
import { ExportModal } from './components/modals/ExportModal';
import { SettingsModal } from './components/modals/SettingsModal';

export default function App() {
  // Main presentation state
  const [presentation, setPresentation] = useState<Presentation>(loadSavedPresentation);
  const [activeSlideId, setActiveSlideId] = useState<string>(() => {
    const saved = loadSavedPresentation();
    return saved.slides[0]?.id || 'slide-1';
  });
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState<number>(0.9);
  const [settings, setSettings] = useState<EditorSettings>(loadSavedSettings);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Undo / Redo history
  const [history, setHistory] = useState<Presentation[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Clipboard
  const [clipboard, setClipboard] = useState<SlideElement[]>([]);

  // Presentation playback states
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [isPresenterMode, setIsPresenterMode] = useState<boolean>(false);
  const [presentationStartSlideIdx, setPresentationStartSlideIdx] = useState<number>(0);

  // Modals state
  const [modalType, setModalType] = useState<
    'chart' | 'table' | 'icon' | 'diagram' | 'theme' | 'export' | 'settings' | null
  >(null);
  const [editingElement, setEditingElement] = useState<SlideElement | null>(null);

  // Hidden File Inputs
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // Active slide lookup
  const activeSlide =
    presentation.slides.find((s) => s.id === activeSlideId) || presentation.slides[0];

  // Save to history helper
  const pushHistory = useCallback(
    (newPresentation: Presentation) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        if (next.length > 30) next.shift();
        return [...next, newPresentation];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Update presentation and trigger history + auto-save
  const updatePresentation = useCallback(
    (updater: (prev: Presentation) => Presentation, saveToHistory: boolean = true) => {
      setPresentation((prev) => {
        const next = updater(prev);
        if (saveToHistory) {
          pushHistory(next);
        }
        setIsSaved(false);
        return next;
      });
    },
    [pushHistory]
  );

  // Auto-save debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      savePresentationToStorage(presentation);
      setIsSaved(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, [presentation]);

  // Undo & Redo Handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex((i) => i - 1);
      setPresentation(prev);
      setIsSaved(false);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex((i) => i + 1);
      setPresentation(next);
      setIsSaved(false);
    }
  }, [history, historyIndex]);

  // Keyboard Shortcuts Global Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input/textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === 'F5') {
        e.preventDefault();
        const startIdx = e.shiftKey
          ? presentation.slides.findIndex((s) => s.id === activeSlideId)
          : 0;
        setPresentationStartSlideIdx(Math.max(0, startIdx));
        setIsPresentationMode(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !isInput) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) handleRedo();
          else handleUndo();
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          handleRedo();
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          savePresentationToStorage(presentation);
          setIsSaved(true);
        } else if (e.key === 'o' || e.key === 'O') {
          e.preventDefault();
          projectFileInputRef.current?.click();
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          handleNewPresentation();
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          handleDuplicateSelected();
        } else if (e.key === 'c' || e.key === 'C') {
          handleCopySelected();
        } else if (e.key === 'v' || e.key === 'V') {
          handlePaste();
        } else if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          if (activeSlide) {
            setSelectedElementIds(activeSlide.elements.map((el) => el.id));
          }
        }
      } else if (!isInput && (e.key === 'Delete' || e.key === 'Backspace')) {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          handleDeleteSelected();
        }
      } else if (e.key === 'Escape') {
        setSelectedElementIds([]);
        setModalType(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeSlideId,
    activeSlide,
    presentation,
    selectedElementIds,
    handleUndo,
    handleRedo,
    clipboard,
  ]);

  // ==================== SLIDE MANAGEMENT ====================
  const handleSelectSlide = (id: string) => {
    setActiveSlideId(id);
    setSelectedElementIds([]);
  };

  const handleAddSlide = (layout: SlideLayout = 'title-content') => {
    const newSlideId = `slide-${Date.now()}`;
    const newSlide: Slide = {
      id: newSlideId,
      title: `Nouvelle diapositive ${presentation.slides.length + 1}`,
      layout,
      notes: '',
      transition: { type: 'fade', duration: 0.5 },
      background: {
        type: 'solid',
        color: '#0f172a',
      },
      elements: [
        {
          id: `title-${Date.now()}`,
          type: 'text',
          name: 'Titre de la diapositive',
          content: 'Titre de la Diapositive',
          x: 100,
          y: 70,
          width: 800,
          height: 60,
          rotation: 0,
          opacity: 1,
          zIndex: 1,
          fontSize: 36,
          fontWeight: '800',
          fontFamily: 'Cabinet Grotesk, sans-serif',
          color: '#ffffff',
          textAlign: 'left',
        },
        {
          id: `body-${Date.now() + 1}`,
          type: 'text',
          name: 'Contenu principal',
          content:
            '• Cliquez pour ajouter des points clés ou des descriptions\n• Utilisez la barre d’outils pour insérer des formes, images et tableaux\n• Personnalisez les polices et couleurs dans le panneau de droite',
          x: 100,
          y: 160,
          width: 800,
          height: 300,
          rotation: 0,
          opacity: 0.9,
          zIndex: 2,
          fontSize: 18,
          fontWeight: '400',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          color: '#cbd5e1',
          lineHeight: 1.8,
        },
      ],
    };

    updatePresentation((prev) => {
      const currentIdx = prev.slides.findIndex((s) => s.id === activeSlideId);
      const nextSlides = [...prev.slides];
      nextSlides.splice(currentIdx + 1, 0, newSlide);
      return { ...prev, slides: nextSlides };
    });
    setActiveSlideId(newSlideId);
    setSelectedElementIds([]);
  };

  const handleDuplicateSlide = (id: string) => {
    const slideToDup = presentation.slides.find((s) => s.id === id);
    if (!slideToDup) return;

    const dupSlide: Slide = {
      ...JSON.parse(JSON.stringify(slideToDup)),
      id: `slide-${Date.now()}`,
      title: `${slideToDup.title} (Copie)`,
    };

    updatePresentation((prev) => {
      const idx = prev.slides.findIndex((s) => s.id === id);
      const nextSlides = [...prev.slides];
      nextSlides.splice(idx + 1, 0, dupSlide);
      return { ...prev, slides: nextSlides };
    });
    setActiveSlideId(dupSlide.id);
  };

  const handleDeleteSlide = (id: string) => {
    if (presentation.slides.length <= 1) return;
    updatePresentation((prev) => {
      const filtered = prev.slides.filter((s) => s.id !== id);
      return { ...prev, slides: filtered };
    });
    const remaining = presentation.slides.filter((s) => s.id !== id);
    if (remaining.length > 0) {
      setActiveSlideId(remaining[0].id);
    }
  };

  const handleMoveSlide = (id: string, direction: 'up' | 'down') => {
    const idx = presentation.slides.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= presentation.slides.length) return;

    updatePresentation((prev) => {
      const nextSlides = [...prev.slides];
      const temp = nextSlides[idx];
      nextSlides[idx] = nextSlides[targetIdx];
      nextSlides[targetIdx] = temp;
      return { ...prev, slides: nextSlides };
    });
  };

  const handleToggleHideSlide = (id: string) => {
    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s)),
    }));
  };

  const handleChangeLayout = (id: string, layout: SlideLayout) => {
    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => (s.id === id ? { ...s, layout } : s)),
    }));
  };

  const handleChangeBackground = (id: string, color: string) => {
    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === id ? { ...s, background: { ...s.background, color, type: 'solid' } } : s
      ),
    }));
  };

  // ==================== ELEMENT MANAGEMENT ====================
  const handleSelectElement = (id: string, multiSelect: boolean = false) => {
    if (multiSelect) {
      setSelectedElementIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setSelectedElementIds([id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedElementIds([]);
  };

  const handleUpdateElement = (id: string, updates: Partial<SlideElement>) => {
    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === activeSlideId
          ? {
              ...s,
              elements: s.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
            }
          : s
      ),
    }));
  };

  const handleUpdateElements = (updates: { id: string; changes: Partial<SlideElement> }[]) => {
    const changeMap = new Map(updates.map((u) => [u.id, u.changes]));
    updatePresentation(
      (prev) => ({
        ...prev,
        slides: prev.slides.map((s) =>
          s.id === activeSlideId
            ? {
                ...s,
                elements: s.elements.map((el) => {
                  const ch = changeMap.get(el.id);
                  return ch ? { ...el, ...ch } : el;
                }),
              }
            : s
        ),
      }),
      false
    );
  };

  const handleDeleteSelected = () => {
    if (selectedElementIds.length === 0) return;
    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === activeSlideId
          ? {
              ...s,
              elements: s.elements.filter((el) => !selectedElementIds.includes(el.id)),
            }
          : s
      ),
    }));
    setSelectedElementIds([]);
  };

  const handleDuplicateSelected = () => {
    if (selectedElementIds.length === 0 || !activeSlide) return;
    const selectedElements = activeSlide.elements.filter((el) =>
      selectedElementIds.includes(el.id)
    );

    const duplicated = selectedElements.map((el, idx) => ({
      ...JSON.parse(JSON.stringify(el)),
      id: `el-${Date.now()}-${idx}`,
      name: `${el.name} (Copie)`,
      x: el.x + 25,
      y: el.y + 25,
      zIndex: (el.zIndex || 1) + 1,
    }));

    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === activeSlideId
          ? {
              ...s,
              elements: [...s.elements, ...duplicated],
            }
          : s
      ),
    }));

    setSelectedElementIds(duplicated.map((d) => d.id));
  };

  const handleCopySelected = () => {
    if (!activeSlide || selectedElementIds.length === 0) return;
    const items = activeSlide.elements.filter((el) => selectedElementIds.includes(el.id));
    setClipboard(JSON.parse(JSON.stringify(items)));
  };

  const handlePaste = () => {
    if (!clipboard || clipboard.length === 0 || !activeSlide) return;
    const pasted = clipboard.map((el, idx) => ({
      ...JSON.parse(JSON.stringify(el)),
      id: `el-${Date.now()}-${idx}`,
      x: el.x + 30,
      y: el.y + 30,
      zIndex: (el.zIndex || 1) + 1,
    }));

    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === activeSlideId
          ? {
              ...s,
              elements: [...s.elements, ...pasted],
            }
          : s
      ),
    }));

    setSelectedElementIds(pasted.map((p) => p.id));
  };

  const handleBringForward = () => {
    if (selectedElementIds.length !== 1 || !activeSlide) return;
    const id = selectedElementIds[0];
    const el = activeSlide.elements.find((item) => item.id === id);
    if (el) {
      handleUpdateElement(id, { zIndex: (el.zIndex || 1) + 1 });
    }
  };

  const handleSendBackward = () => {
    if (selectedElementIds.length !== 1 || !activeSlide) return;
    const id = selectedElementIds[0];
    const el = activeSlide.elements.find((item) => item.id === id);
    if (el) {
      handleUpdateElement(id, { zIndex: Math.max(1, (el.zIndex || 1) - 1) });
    }
  };

  const handleReorderElement = (id: string, direction: 'up' | 'down') => {
    if (!activeSlide) return;
    const el = activeSlide.elements.find((item) => item.id === id);
    if (!el) return;
    const currentZ = el.zIndex || 1;
    const newZ = direction === 'up' ? currentZ + 1 : Math.max(1, currentZ - 1);
    handleUpdateElement(id, { zIndex: newZ });
  };

  // ==================== INSERTION TOOLS ====================
  const handleAddText = () => {
    const newEl: SlideElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      name: 'Zone de texte',
      content: 'Nouveau texte',
      x: 350,
      y: 220,
      width: 300,
      height: 60,
      rotation: 0,
      opacity: 1,
      zIndex: (activeSlide?.elements.length || 0) + 1,
      fontSize: 22,
      fontWeight: '600',
      fontFamily: 'Cabinet Grotesk, sans-serif',
      color: '#ffffff',
      textAlign: 'left',
    };

    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === activeSlideId ? { ...s, elements: [...s.elements, newEl] } : s
      ),
    }));
    setSelectedElementIds([newEl.id]);
  };

  const handleAddShape = (shapeType: ShapeType) => {
    const newEl: SlideElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      name: `Forme ${shapeType}`,
      shapeType,
      x: 400,
      y: 200,
      width: 180,
      height: 140,
      rotation: 0,
      opacity: 1,
      zIndex: (activeSlide?.elements.length || 0) + 1,
      fillColor: '#4f46e5',
      strokeColor: '#818cf8',
      strokeWidth: 1.5,
      borderRadius: 16,
    };

    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === activeSlideId ? { ...s, elements: [...s.elements, newEl] } : s
      ),
    }));
    setSelectedElementIds([newEl.id]);
  };

  const handleAddImageFromDataUrl = (dataUrl: string) => {
    const newEl: SlideElement = {
      id: `img-${Date.now()}`,
      type: 'image',
      name: 'Image importée',
      src: dataUrl,
      x: 300,
      y: 150,
      width: 400,
      height: 260,
      rotation: 0,
      opacity: 1,
      zIndex: (activeSlide?.elements.length || 0) + 1,
      borderRadius: 14,
      strokeWidth: 1,
      strokeColor: 'rgba(255,255,255,0.15)',
    };

    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === activeSlideId ? { ...s, elements: [...s.elements, newEl] } : s
      ),
    }));
    setSelectedElementIds([newEl.id]);
  };

  const handleAddTable = () => {
    const newEl: SlideElement = {
      id: `tbl-${Date.now()}`,
      type: 'table',
      name: 'Tableau',
      x: 250,
      y: 160,
      width: 500,
      height: 240,
      rotation: 0,
      opacity: 1,
      zIndex: (activeSlide?.elements.length || 0) + 1,
      tableRows: 3,
      tableCols: 3,
      headerRow: true,
      headerBg: '#4f46e5',
      altRowBg: 'rgba(30, 41, 59, 0.4)',
      tableData: [
        ['Élément', 'Quantité', 'Statut'],
        ['Composant A', '140', 'Validé'],
        ['Composant B', '85', 'En cours'],
      ],
    };

    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === activeSlideId ? { ...s, elements: [...s.elements, newEl] } : s
      ),
    }));
    setSelectedElementIds([newEl.id]);
  };

  const handleAddChart = () => {
    const newEl: SlideElement = {
      id: `chart-${Date.now()}`,
      type: 'chart',
      name: 'Graphique Données',
      chartType: 'bar',
      chartTitle: 'Performance des Ventes (k€)',
      categories: ['Jan', 'Fév', 'Mar', 'Avr'],
      series: [
        { name: 'Réalisé', data: [45, 60, 85, 110], color: '#6366f1' },
        { name: 'Cible', data: [50, 70, 90, 120], color: '#06b6d4' },
      ],
      showLegend: true,
      showGrid: true,
      x: 250,
      y: 120,
      width: 500,
      height: 340,
      rotation: 0,
      opacity: 1,
      zIndex: (activeSlide?.elements.length || 0) + 1,
    };

    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === activeSlideId ? { ...s, elements: [...s.elements, newEl] } : s
      ),
    }));
    setSelectedElementIds([newEl.id]);
  };

  const handleInsertDiagram = (elements: SlideElement[]) => {
    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === activeSlideId ? { ...s, elements: [...s.elements, ...elements] } : s
      ),
    }));
    setSelectedElementIds(elements.map((e) => e.id));
  };

  const handleInsertIcon = (iconName: string) => {
    const newEl: SlideElement = {
      id: `icon-${Date.now()}`,
      type: 'icon',
      name: `Icône ${iconName}`,
      iconName,
      x: 450,
      y: 230,
      width: 80,
      height: 80,
      rotation: 0,
      opacity: 1,
      zIndex: (activeSlide?.elements.length || 0) + 1,
      color: '#6366f1',
    };

    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === activeSlideId ? { ...s, elements: [...s.elements, newEl] } : s
      ),
    }));
    setSelectedElementIds([newEl.id]);
  };

  const handleInsertEmoji = (emoji: string) => {
    const newEl: SlideElement = {
      id: `emoji-${Date.now()}`,
      type: 'text',
      name: `Émoji ${emoji}`,
      content: emoji,
      x: 460,
      y: 230,
      width: 80,
      height: 80,
      rotation: 0,
      opacity: 1,
      zIndex: (activeSlide?.elements.length || 0) + 1,
      fontSize: 48,
      textAlign: 'center',
    };

    updatePresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === activeSlideId ? { ...s, elements: [...s.elements, newEl] } : s
      ),
    }));
    setSelectedElementIds([newEl.id]);
  };

  // ==================== PROJECT ACTIONS ====================
  const handleNewPresentation = () => {
    if (window.confirm('Créer un nouveau diaporama vide ? Les modifications non enregistrées seront remplacées.')) {
      const newPres: Presentation = {
        id: `hmd-${Date.now()}`,
        title: 'Nouveau Diaporama',
        aspectRatio: '16:9',
        themeId: 'moderne',
        version: '2.0.0',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        slides: [
          {
            id: `slide-${Date.now()}`,
            title: 'Titre de présentation',
            layout: 'title',
            notes: '',
            transition: { type: 'fade', duration: 0.5 },
            background: { type: 'solid', color: '#0f172a' },
            elements: [
              {
                id: `title-${Date.now()}`,
                type: 'text',
                name: 'Titre principal',
                content: 'Titre de la Présentation',
                x: 100,
                y: 180,
                width: 800,
                height: 80,
                rotation: 0,
                opacity: 1,
                zIndex: 1,
                fontSize: 48,
                fontWeight: '800',
                fontFamily: 'Cabinet Grotesk, sans-serif',
                color: '#ffffff',
                textAlign: 'center',
              },
              {
                id: `sub-${Date.now()}`,
                type: 'text',
                name: 'Sous-titre',
                content: 'Sous-titre ou nom de l’auteur',
                x: 150,
                y: 280,
                width: 700,
                height: 40,
                rotation: 0,
                opacity: 0.8,
                zIndex: 2,
                fontSize: 20,
                fontWeight: '400',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                color: '#94a3b8',
                textAlign: 'center',
              },
            ],
          },
        ],
      };
      setPresentation(newPres);
      setActiveSlideId(newPres.slides[0].id);
      setSelectedElementIds([]);
      setHistory([]);
      setHistoryIndex(-1);
      savePresentationToStorage(newPres);
    }
  };

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importProjectFromFile(file)
        .then((imported) => {
          setPresentation(imported);
          setActiveSlideId(imported.slides[0]?.id || 'slide-1');
          setSelectedElementIds([]);
          setHistory([]);
          setHistoryIndex(-1);
          savePresentationToStorage(imported);
        })
        .catch((err) => {
          alert(`Erreur d’importation : ${err.message}`);
        });
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleAddImageFromDataUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetDemo = () => {
    const demo = resetToDemoPresentation();
    setPresentation(demo);
    setActiveSlideId(demo.slides[0].id);
    setSelectedElementIds([]);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const selectedElement =
    selectedElementIds.length === 1 && activeSlide
      ? activeSlide.elements.find((el) => el.id === selectedElementIds[0]) || null
      : null;

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Hidden file inputs */}
      <input
        ref={projectFileInputRef}
        type="file"
        accept=".hmdslides,.json"
        className="hidden"
        onChange={handleOpenFile}
      />
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Top Header */}
      <Header
        presentation={presentation}
        settings={settings}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        isSaved={isSaved}
        zoom={zoom}
        onUpdateTitle={(title) => updatePresentation((p) => ({ ...p, title }))}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomChange={(newZoom) => setZoom(newZoom)}
        onNewPresentation={handleNewPresentation}
        onOpenFilePicker={() => projectFileInputRef.current?.click()}
        onSaveManual={() => {
          savePresentationToStorage(presentation);
          setIsSaved(true);
        }}
        onExportModalOpen={() => setModalType('export')}
        onThemeModalOpen={() => setModalType('theme')}
        onSettingsModalOpen={() => setModalType('settings')}
        onStartPresentation={(fromCurrent) => {
          const startIdx = fromCurrent
            ? presentation.slides.findIndex((s) => s.id === activeSlideId)
            : 0;
          setPresentationStartSlideIdx(Math.max(0, startIdx));
          setIsPresentationMode(true);
        }}
        onStartPresenterMode={() => {
          const startIdx = presentation.slides.findIndex((s) => s.id === activeSlideId);
          setPresentationStartSlideIdx(Math.max(0, startIdx));
          setIsPresenterMode(true);
        }}
        onAddSlide={() => handleAddSlide()}
        onDuplicateSlide={() => handleDuplicateSlide(activeSlideId)}
        onDeleteSlide={() => handleDeleteSlide(activeSlideId)}
        onToggleGrid={() => {
          const next = { ...settings, showGrid: !settings.showGrid };
          setSettings(next);
          saveSettingsToStorage(next);
        }}
        onInsertTool={(tool) => {
          if (tool === 'texte') handleAddText();
          else if (tool === 'forme') handleAddShape('rect');
          else if (tool === 'image') imageFileInputRef.current?.click();
          else if (tool === 'tableau') handleAddTable();
          else if (tool === 'graphique') handleAddChart();
          else if (tool === 'diagramme') setModalType('diagram');
          else if (tool === 'icônes') setModalType('icon');
        }}
      />

      {/* Secondary Toolbar */}
      <Toolbar
        selectedElement={selectedElement}
        onAddText={handleAddText}
        onAddShape={handleAddShape}
        onAddImageClick={() => imageFileInputRef.current?.click()}
        onAddTable={handleAddTable}
        onAddChart={handleAddChart}
        onAddDiagram={() => setModalType('diagram')}
        onOpenIconPicker={() => setModalType('icon')}
        onOpenThemeModal={() => setModalType('theme')}
        onUpdateElement={handleUpdateElement}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicateSelected}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
      />

      {/* Main 3-Column Studio Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Slide Thumbnails */}
        <SlideThumbnails
          slides={presentation.slides}
          activeSlideId={activeSlideId}
          onSelectSlide={handleSelectSlide}
          onAddSlide={handleAddSlide}
          onDuplicateSlide={handleDuplicateSlide}
          onDeleteSlide={handleDeleteSlide}
          onMoveSlide={handleMoveSlide}
          onToggleHideSlide={handleToggleHideSlide}
          onChangeLayout={handleChangeLayout}
          onChangeBackground={handleChangeBackground}
        />

        {/* Center: Canvas Editor & Bottom Notes Drawer */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
          <CanvasEditor
            slide={activeSlide}
            aspectRatio={presentation.aspectRatio}
            selectedElementIds={selectedElementIds}
            settings={settings}
            zoom={zoom}
            onSelectElement={handleSelectElement}
            onClearSelection={handleClearSelection}
            onUpdateElement={handleUpdateElement}
            onUpdateElements={handleUpdateElements}
            onDoubleClickElement={(el) => {
              if (el.type === 'chart') {
                setEditingElement(el);
                setModalType('chart');
              } else if (el.type === 'table') {
                setEditingElement(el);
                setModalType('table');
              }
            }}
            onDeleteSelected={handleDeleteSelected}
            onDuplicateSelected={handleDuplicateSelected}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            onAddImageFromDataUrl={handleAddImageFromDataUrl}
          />

          {/* Presenter Notes Collapsible Bar */}
          <NotesDrawer
            notes={activeSlide.notes || ''}
            onUpdateNotes={(newNotes) => {
              updatePresentation((prev) => ({
                ...prev,
                slides: prev.slides.map((s) =>
                  s.id === activeSlideId ? { ...s, notes: newNotes } : s
                ),
              }));
            }}
          />
        </main>

        {/* Right Column: Properties, Layers, Animations & Transitions Panel */}
        <PropertiesPanel
          activeSlide={activeSlide}
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
          onUpdateSlide={(updates) => {
            updatePresentation((prev) => ({
              ...prev,
              slides: prev.slides.map((s) =>
                s.id === activeSlideId ? { ...s, ...updates } : s
              ),
            }));
          }}
          onSelectElement={(id) => handleSelectElement(id, false)}
          onOpenChartEditor={(el) => {
            setEditingElement(el);
            setModalType('chart');
          }}
          onOpenTableEditor={(el) => {
            setEditingElement(el);
            setModalType('table');
          }}
          onApplyTransitionToAll={(transition) => {
            updatePresentation((prev) => ({
              ...prev,
              slides: prev.slides.map((s) => ({ ...s, transition })),
            }));
          }}
          onReorderElement={handleReorderElement}
        />
      </div>

      {/* ==================== PRESENTATION OVERLAYS ==================== */}
      {isPresentationMode && (
        <PresentationMode
          presentation={presentation}
          initialSlideIndex={presentationStartSlideIdx}
          onClose={() => setIsPresentationMode(false)}
        />
      )}

      {isPresenterMode && (
        <PresenterMode
          presentation={presentation}
          initialSlideIndex={presentationStartSlideIdx}
          onClose={() => setIsPresenterMode(false)}
        />
      )}

      {/* ==================== MODALS ==================== */}
      {modalType === 'chart' && editingElement && (
        <ChartEditorModal
          element={editingElement}
          onSave={(updates) => handleUpdateElement(editingElement.id, updates)}
          onClose={() => {
            setEditingElement(null);
            setModalType(null);
          }}
        />
      )}

      {modalType === 'table' && editingElement && (
        <TableEditorModal
          element={editingElement}
          onSave={(updates) => handleUpdateElement(editingElement.id, updates)}
          onClose={() => {
            setEditingElement(null);
            setModalType(null);
          }}
        />
      )}

      {modalType === 'icon' && (
        <IconPickerModal
          onSelectIcon={handleInsertIcon}
          onSelectEmoji={handleInsertEmoji}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === 'diagram' && (
        <DiagramModal
          onInsertDiagram={handleInsertDiagram}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === 'theme' && (
        <ThemeModal
          currentThemeId={presentation.themeId}
          onSelectTheme={(themeId, customTheme) => {
            const theme = getThemeById(themeId, customTheme);
            updatePresentation((prev) => ({
              ...prev,
              themeId,
              customTheme,
              slides: prev.slides.map((s) => ({
                ...s,
                background: {
                  ...s.background,
                  color: theme.bgColor,
                  gradient: theme.bgGradient,
                },
              })),
            }));
          }}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === 'export' && (
        <ExportModal
          presentation={presentation}
          currentSlideId={activeSlideId}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === 'settings' && (
        <SettingsModal
          settings={settings}
          aspectRatio={presentation.aspectRatio}
          onChangeSettings={(newSettings) => {
            setSettings(newSettings);
            saveSettingsToStorage(newSettings);
          }}
          onChangeAspectRatio={(ratio) => {
            updatePresentation((prev) => ({ ...prev, aspectRatio: ratio }));
          }}
          onResetDemo={handleResetDemo}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
}
