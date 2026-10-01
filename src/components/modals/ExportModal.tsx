import React from 'react';
import { Presentation } from '../../types/slides';
import {
  exportHtmlPresentationFile,
  exportHmdSlidesProject,
  exportJsonFile,
  exportCurrentSlideToPng,
  triggerPrintPdf,
} from '../../utils/exportProject';
import { X, Download, Globe, FileCode, Printer, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ExportModalProps {
  presentation: Presentation;
  currentSlideId: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  presentation,
  currentSlideId,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Centre d’Exportation & Téléchargement</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          {/* Main feature: Standalone HTML presentation */}
          <button
            type="button"
            onClick={() => {
              exportHtmlPresentationFile(presentation);
              onClose();
            }}
            className="w-full flex items-start gap-4 p-4 rounded-xl border border-indigo-500/40 bg-indigo-600/10 hover:bg-indigo-600/20 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-lg shadow-indigo-600/30">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-white">
                  Exporter en Présentation HTML Autonome
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/30 text-indigo-300 rounded">
                  Recommandé
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Génère un fichier <code>.html</code> unique contenant tout le diaporama, animations, transitions, contrôles plein écran et notes. S’ouvre directement dans n’importe quel navigateur (Chrome, Firefox, Safari, Edge) sans aucun serveur ni connexion !
              </p>
            </div>
          </button>

          {/* Proprietary .hmdslides project */}
          <button
            type="button"
            onClick={() => {
              exportHmdSlidesProject(presentation);
              onClose();
            }}
            className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-white block mb-0.5">
                Télécharger le projet (.hmdslides)
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Format propriétaire du logiciel sauvegardant fidèlement toutes vos diapositives, objets, animations, tableaux et thèmes. Peut être réouvert ultérieurement.
              </p>
            </div>
          </button>

          {/* Export to PNG */}
          <button
            type="button"
            onClick={() => {
              exportCurrentSlideToPng('active-slide-canvas', `${presentation.title}_diapo.png`);
              onClose();
            }}
            className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-white block mb-0.5">
                Exporter la diapositive actuelle en PNG
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Capture en haute résolution de la diapositive sélectionnée au format image pour l’intégrer dans vos documents ou réseaux.
              </p>
            </div>
          </button>

          {/* PDF / Print */}
          <button
            type="button"
            onClick={() => {
              onClose();
              setTimeout(() => triggerPrintPdf(), 300);
            }}
            className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-white block mb-0.5">
                Imprimer / Exporter en PDF
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Utilise le dialogue d’impression optimisé du navigateur pour enregistrer toutes les diapositives au format PDF.
              </p>
            </div>
          </button>

          {/* JSON raw */}
          <button
            type="button"
            onClick={() => {
              exportJsonFile(presentation);
              onClose();
            }}
            className="w-full flex items-start gap-4 p-3 rounded-xl border border-slate-800/60 bg-slate-950/30 hover:border-slate-700 text-left transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
              <FileCode className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-300 block">
                Exporter au format JSON brut
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
