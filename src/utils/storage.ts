import { EditorSettings, Presentation } from '../types/slides';
import { DEFAULT_PRESENTATION } from '../constants/defaultPresentation';

const STORAGE_KEY_PRESENTATION = 'hmd_slides_project_v1';
const STORAGE_KEY_SETTINGS = 'hmd_slides_settings_v1';

export const DEFAULT_SETTINGS: EditorSettings = {
  showGrid: false,
  gridSize: 20,
  snapToGrid: true,
  snapToGuides: true,
  showRulers: false,
  darkMode: true,
  autoSaveInterval: 3,
};

export function loadSavedPresentation(): Presentation {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRESENTATION);
    if (!raw) {
      return DEFAULT_PRESENTATION;
    }
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
      return parsed as Presentation;
    }
  } catch (err) {
    console.error('Erreur chargement localStorage:', err);
  }
  return DEFAULT_PRESENTATION;
}

export function savePresentationToStorage(presentation: Presentation): boolean {
  try {
    const updated = {
      ...presentation,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_PRESENTATION, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Erreur sauvegarde localStorage:', err);
    return false;
  }
}

export function loadSavedSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Erreur chargement réglages:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettingsToStorage(settings: EditorSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Erreur sauvegarde réglages:', err);
  }
}

export function resetToDemoPresentation(): Presentation {
  try {
    localStorage.removeItem(STORAGE_KEY_PRESENTATION);
  } catch {
    // ignore
  }
  return JSON.parse(JSON.stringify(DEFAULT_PRESENTATION));
}
