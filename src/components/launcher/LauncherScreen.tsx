import React, { useState, useEffect } from 'react';
import { Presentation } from '../../types/slides';
import { PRESENTATION_THEMES } from '../../constants/themes';
import {
  loadPresentationsFromFirebase,
  deletePresentationFromFirebase,
} from '../../services/firebase';
import {
  Sparkles,
  Plus,
  Cloud,
  FolderOpen,
  Trash2,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
  FileText,
  Upload,
} from 'lucide-react';

interface LauncherScreenProps {
  currentPresentation: Presentation | null;
  onCreateBlank: () => void;
  onCreateWithTheme: (themeId: string) => void;
  onOpenPresentation: (presentation: Presentation) => void;
  onLoadDemo: () => void;
  onOpenFilePicker: () => void;
  onContinueCurrent: () => void;
}

export const LauncherScreen: React.FC<LauncherScreenProps> = ({
  currentPresentation,
  onCreateBlank,
  onCreateWithTheme,
  onOpenPresentation,
  onLoadDemo,
  onOpenFilePicker,
  onContinueCurrent,
}) => {
  const [cloudList, setCloudList] = useState<Presentation[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(true);

  const fetchCloudPresentations = async () => {
    setIsLoadingCloud(true);
    try {
      const list = await loadPresentationsFromFirebase();
      setCloudList(list);
    } catch {
      // ignore
    } finally {
      setIsLoadingCloud(false);
    }
  };

  useEffect(() => {
    fetchCloudPresentations();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Voulez-vous supprimer ce diaporama de votre compte Firebase Cloud ?')) {
      await deletePresentationFromFirebase(id);
      setCloudList((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-y-auto select-none font-sans">
      {/* Top Banner */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 sm:px-12 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight font-['Cabinet_Grotesk'] leading-tight">
              HMD Slides
            </h1>
            <p className="text-[11px] text-slate-400">Suite de création de présentations moderne</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenFilePicker}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ouvrir un fichier .hmdslides</span>
          </button>

          {currentPresentation && (
            <button
              type="button"
              onClick={onContinueCurrent}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Accéder à l'éditeur</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 space-y-10">
        {/* Section 1: Nouveau Diaporama (En premier le vierge avec rien dedans, puis les thèmes) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Créer une nouvelle présentation
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Commencez avec une page blanche totalement vierge ou choisissez l'un des 8 thèmes
              </p>
            </div>

            <button
              type="button"
              onClick={onLoadDemo}
              className="text-xs text-slate-400 hover:text-indigo-300 font-medium underline underline-offset-4"
            >
              Ouvrir la démo complète HMD Slides
            </button>
          </div>

          {/* Grid of Templates: First is Blank, then Themes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* 1. NOUVEAU DIAPORAMA VIERGE (1er élément, vide avec rien dedans) */}
            <button
              type="button"
              onClick={onCreateBlank}
              className="flex flex-col rounded-2xl border-2 border-indigo-500/70 bg-gradient-to-b from-indigo-950/40 to-slate-900/60 p-4 text-left transition-all hover:scale-[1.02] hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/20 group relative overflow-hidden ring-1 ring-indigo-500/30"
            >
              {/* Preview Thumbnail: Blank Page */}
              <div className="w-full aspect-video rounded-xl bg-slate-900 border-2 border-dashed border-indigo-400/60 flex flex-col items-center justify-center p-3 mb-3 group-hover:border-indigo-400 group-hover:bg-indigo-950/20 transition-all shadow-inner">
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 mb-1 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-indigo-300 font-semibold">Page vide</span>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                      Diaporama Vierge
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 font-bold rounded border border-emerald-500/30">
                      Rien dedans
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Une diapositive 100% blanche sans aucun texte pré-rempli.
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-indigo-500/20 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span>Créer vierge</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            {/* 2. LES THÈMES PRÉDÉFINIS */}
            {PRESENTATION_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => onCreateWithTheme(theme.id)}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg group relative overflow-hidden"
              >
                {/* Theme miniature preview */}
                <div
                  className="w-full aspect-video rounded-xl p-2.5 flex flex-col justify-between mb-3 shadow-md border border-white/10"
                  style={{
                    background: theme.bgGradient
                      ? `linear-gradient(${theme.bgGradient.from}, ${theme.bgGradient.to})`
                      : theme.bgColor,
                    color: theme.textColor,
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.secondaryColor }}
                    />
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>
                  <span
                    className="text-[11px] font-bold truncate"
                    style={{ fontFamily: theme.titleFont }}
                  >
                    Titre Modèle
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors block mb-1">
                      {theme.name.split('(')[0].trim()}
                    </span>
                    <span className="text-[10px] text-slate-400 block line-clamp-1">
                      {theme.name.includes('(') ? theme.name.split('(')[1].replace(')', '') : 'Style moderne'}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-white">
                    <span>Choisir</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Section 2: Mes Diaporamas Enregistrés (Firebase Cloud) */}
        <section className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                Mes Diaporamas Enregistrés dans le Cloud (Firebase)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Vos projets sauvegardés et synchronisés sur votre base de données en ligne
              </p>
            </div>

            <button
              type="button"
              onClick={fetchCloudPresentations}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Actualiser la liste Cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCloud ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>

          {isLoadingCloud ? (
            <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800">
              <RefreshCw className="w-7 h-7 mx-auto animate-spin text-cyan-400" />
              <p className="text-xs font-medium">Chargement de vos présentations depuis Firebase Cloud...</p>
            </div>
          ) : cloudList.length === 0 ? (
            <div className="py-14 text-center border-2 border-dashed border-slate-800/80 rounded-2xl p-8 bg-slate-900/30">
              <Cloud className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">
                Aucun diaporama enregistré sur Firebase pour l'instant
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                Lorsque vous créez un diaporama, cliquez sur « Sauvegarder Cloud » dans l'en-tête de l'éditeur pour le retrouver ici automatiquement depuis n'importe quel appareil.
              </p>
              <button
                type="button"
                onClick={onCreateBlank}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
              >
                Créer mon premier diaporama vierge
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cloudList.map((pres) => (
                <div
                  key={pres.id}
                  onClick={() => onOpenPresentation(pres)}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/60 cursor-pointer transition-all p-4 flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-cyan-950/30"
                >
                  <div>
                    {/* Header card with badge & delete */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/50 text-cyan-300 font-semibold">
                        {pres.slides?.length || 1} diapositive{pres.slides?.length > 1 ? 's' : ''}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, pres.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Supprimer du Cloud"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Miniature representation */}
                    <div className="w-full aspect-video rounded-xl bg-slate-950 border border-slate-800 p-3 mb-3 flex flex-col justify-between group-hover:border-slate-700 transition-colors relative overflow-hidden">
                      <div className="w-3/4 h-2.5 bg-slate-800 rounded mb-1" />
                      <div className="w-1/2 h-2 bg-slate-800/60 rounded" />
                      <div className="w-full flex items-center justify-end">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Cloud</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
                      {pres.title || 'Diaporama sans titre'}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>
                        {pres.updatedAt
                          ? new Date(pres.updatedAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Récemment'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                    <span>Ouvrir dans l'éditeur</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
