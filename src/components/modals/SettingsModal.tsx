import React from 'react';
import { EditorSettings } from '../../types/slides';
import { X, Settings2, Grid, Ratio } from 'lucide-react';

interface SettingsModalProps {
  settings: EditorSettings;
  aspectRatio: '16:9' | '4:3';
  onChangeSettings: (newSettings: EditorSettings) => void;
  onChangeAspectRatio: (ratio: '16:9' | '4:3') => void;
  onResetDemo: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  aspectRatio,
  onChangeSettings,
  onChangeAspectRatio,
  onResetDemo,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Paramètres du Projet</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm">
          {/* Aspect Ratio */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <Ratio className="w-4 h-4 text-indigo-400" /> Format d’affichage (Ratio)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChangeAspectRatio('16:9')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  aspectRatio === '16:9'
                    ? 'border-indigo-500 bg-indigo-600/20 text-white font-bold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-sm">16:9 Écran large</div>
                <div className="text-[11px] text-slate-500">Standard moderne (1920 × 1080)</div>
              </button>
              <button
                type="button"
                onClick={() => onChangeAspectRatio('4:3')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  aspectRatio === '4:3'
                    ? 'border-indigo-500 bg-indigo-600/20 text-white font-bold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-sm">4:3 Classique</div>
                <div className="text-[11px] text-slate-500">Projecteurs traditionnels</div>
              </button>
            </div>
          </div>

          {/* Grid & Alignment Guides */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <Grid className="w-4 h-4 text-indigo-400" /> Grille & Magnétisme
            </label>
            <div className="space-y-3 bg-slate-950/60 p-4 border border-slate-800 rounded-xl">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-slate-300">Afficher la grille sur le canvas</span>
                <input
                  type="checkbox"
                  checked={settings.showGrid}
                  onChange={(e) =>
                    onChangeSettings({ ...settings, showGrid: e.target.checked })
                  }
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-slate-300">Magnétisme sur la grille (Snap)</span>
                <input
                  type="checkbox"
                  checked={settings.snapToGrid}
                  onChange={(e) =>
                    onChangeSettings({ ...settings, snapToGrid: e.target.checked })
                  }
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-slate-300">
                  Repères & guides d’alignement intelligents
                </span>
                <input
                  type="checkbox"
                  checked={settings.snapToGuides}
                  onChange={(e) =>
                    onChangeSettings({ ...settings, snapToGuides: e.target.checked })
                  }
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-300 block">
                Réinitialiser la démo
              </span>
              <span className="text-[11px] text-slate-500">
                Recharger la présentation d’exemple complète
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Voulez-vous réinitialiser le diaporama avec les 5 diapositives de démonstration ?')) {
                  onResetDemo();
                  onClose();
                }
              }}
              className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/60 border border-red-800 text-red-300 text-xs rounded-lg transition-colors font-semibold"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-600/30"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
