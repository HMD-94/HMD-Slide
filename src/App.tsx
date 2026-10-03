import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Presentation,
  Slide,
  SlideElement,
  SlideBackground,
  SlideLayout,
  ShapeType,
  EditorSettings,
  AnimationType,
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
import { savePresentationToFirebase } from './services/firebase';

import { Header } from './components/layout/Header';
import { Toolbar } from './components/layout/Toolbar';
import { SlideThumbnails } from './components/layout/SlideThumbnails';
import { CanvasEditor } from './components/canvas/CanvasEditor';
import { PropertiesPanel } from './components/layout/PropertiesPanel';
import { NotesDrawer } from './components/layout/NotesDrawer';

import { PresentationMode } from './components/presentation/PresentationMode';
import { PresenterMode } from './components/presentation/PresenterMode';

import { LauncherScreen } from './components/launcher/LauncherScreen';
import { ChartEditorModal } from './components/modals/ChartEditorModal';
import { TableEditorModal } from './components/modals/TableEditorModal';
import { IconPickerModal } from './components/modals/IconPickerModal';
import { DiagramModal } from './components/modals/DiagramModal';
import { ThemeModal } from './components/modals/ThemeModal';
import { BackgroundModal } from './components/modals/BackgroundModal';
import { ExportModal } from './components/modals/ExportModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { Check, AlertCircle, Sparkles, Cloud } from 'lucide-react';

export default function App() {
  // Main presentation state
  const initialPresentation = loadSavedPresentation();
  const [presentation, setPresentation] = useState<Presentation>(initialPresentation);
  const [activeSlideId, setActiveSlideId] = useState<string>(() => {
    return initialPresentation.slides[0]?.id || 'slide-1';
  });
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState<number>(0.9);
  const [settings, setSettings] = useState<EditorSettings>(loadSavedSettings);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Cloud Save State
  const [isCloudSaving, setIsCloudSaving] = useState<boolean>(false);
  const [cloudSaveSuccess, setCloudSaveSuccess] = useState<boolean>(false);

  // In-app Toast notifications (avoids window.alert inside iframe)
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success', durationMs = 3500) => {
      setToast({ message, type });
      setTimeout(() => {
        setToast((prev) => (prev?.message === message ? null : prev));
      }, durationMs);
    },
    []
  );

  // Animation preview state
  const [previewAnimation, setPreviewAnimation] = useState<{
    elementId: string;
    animType: string;
  } | null>(null);

  // Startup / Launcher Window: Shows on application launch
  const [isLauncherOpen, setIsLauncherOpen] = useState<boolean>(true);

  // Rock-solid Undo / Redo history stack
  const [historyPast, setHistoryPast] = useState<Presentation[]>([]);
  const [historyFuture, setHistoryFuture] = useState<Presentation[]>([]);

  // Clipboard
  const [clipboard, setClipboard] = useState<SlideElement[]>([]);

  // Presentation playback states
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [isPresenterMode, setIsPresenterMode] = useState<boolean>(false);
  const [presentationStartSlideIdx, setPresentationStartSlideIdx] = useState<number>(0);

  // Modals state
  const [modalType, setModalType] = useState<
    'chart' | 'table' | 'icon' | 'diagram' | 'theme' | 'export' | 'settings' | 'background' | null
  >(null);
  const [editingElement, setEditingElement] = useState<SlideElement | null>(null);

  // Hidden File Inputs
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);

  // Active slide lookup
  const activeSlide =
    presentation.slides.find((s) => s.id === activeSlideId) || presentation.slides[0];

  /**
   * Update presentation with optional history recording
   */
  const updatePresentation = useCallback(
    (updater: (prev: Presentation) => Presentation, recordHistory: boolean = true) => {
      setPresentation((current) => {
        const next = updater(current);
        if (recordHistory) {
          setHistoryPast((past) => [...past.slice(-30), JSON.parse(JSON.stringify(current))]);
          setHistoryFuture([]);
        }
        setIsSaved(false);
        return next;
      });
    },
    []
  );

  /**
   * Commit a drag or resize operation to history
   */
  const handleDragOrResizeEnd = useCallback(() => {
    setHistoryPast((past) => [...past.slice(-30), JSON.parse(JSON.stringify(presentation))]);
    setHistoryFuture([]);
    setIsSaved(false);
  }, [presentation]);

  // Auto-save debounce effect to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      savePresentationToStorage(presentation);
      setIsSaved(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [presentation]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, historyPast.length - 1);

    setHistoryFuture((future) => [JSON.parse(JSON.stringify(presentation)), ...future]);
    setHistoryPast(newPast);
    setPresentation(previous);
    if (!previous.slides.some((s) => s.id === activeSlideId)) {
      setActiveSlideId(previous.slides[0]?.id || 'slide-1');
    }
    const currentSlide = previous.slides.find((s) => s.id === activeSlideId) || previous.slides[0];
    if (currentSlide) {
      setSelectedElementIds((prev) =>
        prev.filter((id) => currentSlide.elements.some((el) => el.id === id))
      );
    }
    setIsSaved(false);
  }, [historyPast, presentation, activeSlideId]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);

    setHistoryPast((past) => [...past, JSON.parse(JSON.stringify(presentation))]);
    setHistoryFuture(newFuture);
    setPresentation(next);
    if (!next.slides.some((s) => s.id === activeSlideId)) {
      setActiveSlideId(next.slides[0]?.id || 'slide-1');
    }
    const currentSlide = next.slides.find((s) => s.id === activeSlideId) || next.slides[0];
    if (currentSlide) {
      setSelectedElementIds((prev) =>
        prev.filter((id) => currentSlide.elements.some((el) => el.id === id))
      );
    }
    setIsSaved(false);
  }, [historyFuture, presentation, activeSlideId]);

  // Save to Firebase Cloud
  const handleSaveToCloud = async () => {
    setIsCloudSaving(true);
    setCloudSaveSuccess(false);
    try {
      const ok = await savePresentationToFirebase(presentation);
      if (ok) {
        setCloudSaveSuccess(true);
        showToast("Diaporama enregistré dans le Cloud avec succès !", "success");
        setTimeout(() => setCloudSaveSuccess(false), 3500);
      } else {
        showToast("Erreur lors de la sauvegarde Cloud. Vérifiez votre connexion.", "error");
      }
    } catch (err: any) {
      showToast("Erreur lors de la sauvegarde Cloud: " + (err?.message || 'Erreur inconnue'), "error");
    } finally {
      setIsCloudSaving(false);
    }
  };

  // Preview animation trigger
  const handlePreviewAnimation = (elementId: string, animType: AnimationType) => {
    setPreviewAnimation({ elementId, animType });
    setTimeout(() => {
      setPreviewAnimation((prev) => (prev?.elementId === elementId ? null : prev));
    }, 950);
  };

  // Keyboard Shortcuts Global Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
          handleSaveToCloud();
        } else if (e.key === 'o' || e.key === 'O') {
          e.preventDefault();
          setIsLauncherOpen(true);
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          handleCreateBlank();
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
      } else if (!isInput && e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        // Alt + ArrowUp/ArrowDown to enlarge or shrink text
        const singleEl = activeSlide?.elements.find((el) => selectedElementIds.includes(el.id));
        if (singleEl && singleEl.type === 'text') {
          e.preventDefault();
          const cur = singleEl.fontSize || 24;
          const next =
            e.key === 'ArrowUp'
              ? Math.min(260, cur + (cur >= 32 ? 4 : 2))
              : Math.max(8, cur - (cur > 32 ? 4 : 2));
          handleUpdateElement(singleEl.id, {
            fontSize: next,
            height: Math.max(singleEl.height, Math.round(next * 1.35)),
          });
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

  const handleAddSlide = (layout: SlideLayout = 'blank') => {
    const newSlideId = `slide-${Date.now()}`;
    const newSlide: Slide = {
      id: newSlideId,
      title: `Diapositive ${presentation.slides.length + 1}`,
      layout,
      notes: '',
      transition: { type: 'fade', duration: 0.5 },
      background: {
        type: 'solid',
        color: '#0f172a',
      },
      elements: [],
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

  const handleApplyBackground = useCallback(
    (bg: SlideBackground, applyToAll: boolean) => {
      updatePresentation((prev) => ({
        ...prev,
        slides: prev.slides.map((s) =>
          applyToAll || s.id === activeSlideId ? { ...s, background: bg } : s
        ),
      }));
    },
    [activeSlideId, updatePresentation]
  );

  const handleBackgroundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          handleApplyBackground(
            {
              type: 'image',
              color: '#0f172a',
              imageUrl: dataUrl,
              imageFit: 'cover',
            },
            false
          );
        }
      };
      reader.readAsDataURL(file);
    }
    // reset file input
    if (e.target) e.target.value = '';
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

  // ==================== LAYER ORDERING (AVANCER / RECULER / PREMIER / DERNIER PLAN) ====================
  const handleReorderLayer = useCallback(
    (id: string, action: 'forward' | 'backward' | 'front' | 'back') => {
      if (!activeSlide) return;

      const elements = [...activeSlide.elements].sort(
        (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
      );
      const currentIndex = elements.findIndex((el) => el.id === id);
      if (currentIndex === -1) return;

      const [targetEl] = elements.splice(currentIndex, 1);

      if (action === 'forward') {
        const newIdx = Math.min(elements.length, currentIndex + 1);
        elements.splice(newIdx, 0, targetEl);
      } else if (action === 'backward') {
        const newIdx = Math.max(0, currentIndex - 1);
        elements.splice(newIdx, 0, targetEl);
      } else if (action === 'front') {
        elements.push(targetEl);
      } else if (action === 'back') {
        elements.unshift(targetEl);
      }

      // Reassign clean normalized zIndex
      const updatedElements = elements.map((el, idx) => ({
        ...el,
        zIndex: idx + 1,
      }));

      updatePresentation((prev) => ({
        ...prev,
        slides: prev.slides.map((s) =>
          s.id === activeSlideId ? { ...s, elements: updatedElements } : s
        ),
      }));
    },
    [activeSlide, activeSlideId, updatePresentation]
  );

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
      fontSize: 24,
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

  // ==================== PROJECT CREATION & WELCOME ACTIONS ====================

  /**
   * Option 1: Create a 100% blank presentation with nothing in it
   * (Requested: "en premier genre tu mes nouveau diapo avec rien dedant")
   */
  const handleCreateBlank = () => {
    const blankSlideId = `slide-${Date.now()}`;
    const blankPres: Presentation = {
      id: `hmd-blank-${Date.now()}`,
      title: 'Diaporama Vierge',
      aspectRatio: '16:9',
      themeId: 'moderne',
      version: '2.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slides: [
        {
          id: blankSlideId,
          title: 'Diapositive 1',
          layout: 'blank',
          notes: '',
          transition: { type: 'fade', duration: 0.5 },
          background: {
            type: 'solid',
            color: '#0f172a',
          },
          elements: [], // completely empty as requested!
        },
      ],
    };

    setPresentation(blankPres);
    setActiveSlideId(blankSlideId);
    setSelectedElementIds([]);
    setHistoryPast([]);
    setHistoryFuture([]);
    setIsLauncherOpen(false);
    savePresentationToStorage(blankPres);
  };

  /**
   * Option 2: Create with a chosen theme
   */
  const handleCreateWithTheme = (themeId: string) => {
    const theme = getThemeById(themeId);
    const slideId = `slide-${Date.now()}`;
    const newPres: Presentation = {
      id: `hmd-${Date.now()}`,
      title: `Diaporama ${theme.name.split('(')[0].trim()}`,
      aspectRatio: '16:9',
      themeId,
      version: '2.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slides: [
        {
          id: slideId,
          title: 'Titre',
          layout: 'title',
          notes: '',
          transition: { type: 'fade', duration: 0.5 },
          background: {
            type: theme.bgGradient ? 'gradient' : 'solid',
            color: theme.bgColor,
            gradient: theme.bgGradient,
          },
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
              fontFamily: theme.titleFont,
              color: theme.textColor,
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
              fontFamily: theme.bodyFont,
              color: theme.mutedTextColor,
              textAlign: 'center',
            },
          ],
        },
      ],
    };

    setPresentation(newPres);
    setActiveSlideId(slideId);
    setSelectedElementIds([]);
    setHistoryPast([]);
    setHistoryFuture([]);
    setIsLauncherOpen(false);
    savePresentationToStorage(newPres);
  };

  /**
   * Option 3: Select and open an existing presentation (e.g. from Firebase Cloud)
   */
  const handleSelectPresentation = (pres: Presentation) => {
    setPresentation(pres);
    setActiveSlideId(pres.slides[0]?.id || 'slide-1');
    setSelectedElementIds([]);
    setHistoryPast([]);
    setHistoryFuture([]);
    setIsLauncherOpen(false);
    savePresentationToStorage(pres);
  };

  /**
   * Load demo presentation
   */
  const handleLoadDemo = () => {
    const demo = resetToDemoPresentation();
    setPresentation(demo);
    setActiveSlideId(demo.slides[0].id);
    setSelectedElementIds([]);
    setHistoryPast([]);
    setHistoryFuture([]);
    setIsLauncherOpen(false);
  };

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importProjectFromFile(file)
        .then((imported) => {
          handleSelectPresentation(imported);
        })
        .catch((err) => {
          showToast(`Erreur d’importation : ${err.message}`, 'error');
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
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        isSaved={isSaved}
        isCloudSaving={isCloudSaving}
        cloudSaveSuccess={cloudSaveSuccess}
        zoom={zoom}
        onUpdateTitle={(title) => updatePresentation((p) => ({ ...p, title }))}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomChange={(newZoom) => setZoom(newZoom)}
        onNewPresentation={handleCreateBlank}
        onOpenFilePicker={() => projectFileInputRef.current?.click()}
        onSaveManual={() => {
          savePresentationToStorage(presentation);
          setIsSaved(true);
        }}
        onSaveToCloud={handleSaveToCloud}
        onOpenWelcomeModal={() => setIsLauncherOpen(true)}
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
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAddText={handleAddText}
        onAddShape={handleAddShape}
        onAddImageClick={() => imageFileInputRef.current?.click()}
        onAddTable={handleAddTable}
        onAddChart={handleAddChart}
        onAddDiagram={() => setModalType('diagram')}
        onOpenIconPicker={() => setModalType('icon')}
        onOpenThemeModal={() => setModalType('theme')}
        onOpenBackgroundModal={() => setModalType('background')}
        onUpdateElement={handleUpdateElement}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicateSelected}
        onBringForward={() => selectedElement && handleReorderLayer(selectedElement.id, 'forward')}
        onSendBackward={() => selectedElement && handleReorderLayer(selectedElement.id, 'backward')}
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
          onOpenBackgroundModal={() => setModalType('background')}
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
            onBringForward={() => selectedElement && handleReorderLayer(selectedElement.id, 'forward')}
            onSendBackward={() => selectedElement && handleReorderLayer(selectedElement.id, 'backward')}
            onBringToFront={() => selectedElement && handleReorderLayer(selectedElement.id, 'front')}
            onSendToBack={() => selectedElement && handleReorderLayer(selectedElement.id, 'back')}
            onDragOrResizeEnd={handleDragOrResizeEnd}
            previewAnimation={previewAnimation}
            onAddImageFromDataUrl={handleAddImageFromDataUrl}
            onOpenBackgroundModal={() => setModalType('background')}
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
          onReorderElement={(id, direction) =>
            handleReorderLayer(id, direction === 'up' ? 'forward' : 'backward')
          }
          onBringToFront={(id) => handleReorderLayer(id, 'front')}
          onSendToBack={(id) => handleReorderLayer(id, 'back')}
          onPreviewAnimation={handlePreviewAnimation}
          onOpenBackgroundModal={() => setModalType('background')}
        />
      </div>

      {/* ==================== PREMIÈRE FENÊTRE : ACCUEIL & DIAPORAMAS CLOUD ==================== */}
      {isLauncherOpen && (
        <LauncherScreen
          currentPresentation={presentation}
          onCreateBlank={handleCreateBlank}
          onCreateWithTheme={handleCreateWithTheme}
          onOpenPresentation={handleSelectPresentation}
          onLoadDemo={handleLoadDemo}
          onOpenFilePicker={() => projectFileInputRef.current?.click()}
          onContinueCurrent={() => setIsLauncherOpen(false)}
        />
      )}

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

      {/* ==================== OTHER MODALS ==================== */}
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
          onResetDemo={handleLoadDemo}
          onClose={() => setModalType(null)}
        />
      )}
      {modalType === 'background' && (
        <BackgroundModal
          currentBackground={activeSlide?.background || { type: 'solid', color: '#0f172a' }}
          onApplyBackground={(bg, applyToAll) => {
            handleApplyBackground(bg, applyToAll);
            setModalType(null);
          }}
          onClose={() => setModalType(null)}
        />
      )}

      {/* Hidden File Input for Background Image Import */}
      <input
        ref={backgroundFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBackgroundFileChange}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200 shadow-emerald-900/30'
              : toast.type === 'error'
              ? 'bg-rose-950/95 border-rose-500/60 text-rose-200 shadow-rose-900/30'
              : 'bg-indigo-950/95 border-indigo-500/60 text-indigo-200 shadow-indigo-900/30'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
