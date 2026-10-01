import React, { useState } from 'react';
import { PresentationTheme } from '../../types/slides';
import { PRESENTATION_THEMES } from '../../constants/themes';
import { X, Palette, Check } from 'lucide-react';

interface ThemeModalProps {
  currentThemeId: string;
  onSelectTheme: (themeId: string, customTheme?: PresentationTheme) => void;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  currentThemeId,
  onSelectTheme,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState(currentThemeId);

  const handleApply = () => {
    onSelectTheme(selectedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Thèmes Visuels du Diaporama</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-400">
            Le thème sélectionné harmonise instantanément la palette de couleurs, l’arrière-plan, les polices de caractères et l’atmosphère générale de toutes vos diapositives.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PRESENTATION_THEMES.map((theme) => {
              const active = selectedId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedId(theme.id)}
                  className={`flex flex-col rounded-xl overflow-hidden border text-left transition-all relative ${
                    active
                      ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Preview Banner */}
                  <div
                    className="h-24 p-3 flex flex-col justify-between"
                    style={{
                      background: theme.bgGradient
                        ? `linear-gradient(${theme.bgGradient.from}, ${theme.bgGradient.to})`
                        : theme.bgColor,
                      color: theme.textColor,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.secondaryColor }}
                      />
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>
                    <div>
                      <span
                        className="text-sm font-bold block truncate"
                        style={{ fontFamily: theme.titleFont }}
                      >
                        Titre Élégant
                      </span>
                      <span
                        className="text-[10px] opacity-70 block truncate"
                        style={{ fontFamily: theme.bodyFont }}
                      >
                        Texte de présentation
                      </span>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="p-2.5 bg-slate-950 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">
                      {theme.name}
                    </span>
                    {active && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-600/30"
          >
            Appliquer le thème
          </button>
        </div>
      </div>
    </div>
  );
};
