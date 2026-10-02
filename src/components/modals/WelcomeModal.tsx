import React, { useState, useEffect } from 'react';
import { Presentation, PresentationTheme } from '../../types/slides';
import { PRESENTATION_THEMES } from '../../constants/themes';
import {
  loadPresentationsFromFirebase,
  deletePresentationFromFirebase,
} from '../../services/firebase';
import {
  Sparkles,
  Plus,
  Cloud,
  Palette,
  FolderOpen,
  Trash2,
  Clock,
  Layers,
  ChevronRight,
  RefreshCw,
  X,
  FileText,
} from 'lucide-react';

interface WelcomeModalProps {
  currentPresentation: Presentation;
  onSelectPresentation: (presentation: Presentation) => void;
  onCreateBlank: () => void;
  onCreateWithTheme: (themeId: string) => void;
  onLoadDemo: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  currentPresentation,
  onSelectPresentation,
  onCreateBlank,
  onCreateWithTheme,
  onLoadDemo,
  onClose,
  isOpen,
}) => {
  const [cloudList, setCloudList] = useState<Presentation[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(true);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'cloud'>('create');

  const fetchCloudPresentations = async () => {
    setIsLoadingCloud(true);
    setCloudError(null);
    try {
      const list = await loadPresentationsFromFirebase();
      setCloudList(list);
    } catch (err: any) {
      setCloudError("Connexion au Cloud Firebase indisponible");
    } finally {
      setIsLoadingCloud(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCloudPresentations();
    }
  }, [isOpen]);

  const handleDeleteCloudItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Supprimer définitivement ce diaporama du Cloud Firebase ?')) {
      const ok = await deletePresentationFromFirebase(id);
      if (ok) {
        setCloudList((prev) => prev.filter((p) => p.id !== id));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight font-['Cabinet_Grotesk']">
                HMD Slides — Accueil & Démarrage
              </h2>
              <p className="text-xs text-slate-400">
                Créez un nouveau diaporama vierge, choisissez un thème ou ouvrez vos diapos Cloud
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab navigation */}
            <div className="flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-semibold mr-2">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'create'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Nouveau Diaporama
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cloud')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                  activeTab === 'cloud'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Mes Diapos Cloud ({cloudList.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'create' ? (
            <>
              {/* Option 1 : Nouveau diaporama avec RIEN dedans (Vierge absolu) */}
              <div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                  Démarrage Rapide
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Carte Vierge */}
                  <button
                    type="button"
                    onClick={onCreateBlank}
                    className="p-5 rounded-2xl border-2 border-indigo-500/40 bg-indigo-950/20 hover:bg-indigo-900/30 hover:border-indigo-400 transition-all text-left flex items-start gap-4 group shadow-lg shadow-indigo-950/30"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 shrink-0 group-hover:scale-105 transition-transform">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">
                          Nouveau diaporama vierge
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                          Vide
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Diapositive 100% vierge sans aucun élément pré-rempli. Parfait pour construire votre présentation de zéro.
                      </p>
                    </div>
                  </button>

                  {/* Carte Reprendre le projet en cours */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-950 transition-all text-left flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 group-hover:scale-105 transition-transform">
                      <FolderOpen className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-white block mb-1">
                        Continuer « {currentPresentation.title} »
                      </span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Poursuivez l'édition du diaporama actuellement ouvert ({currentPresentation.slides.length} diapositive{currentPresentation.slides.length > 1 ? 's' : ''}).
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Option 2 : Nouveau diaporama avec Thème */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nouveau diaporama avec un Thème
                  </span>
                  <span className="text-xs text-slate-500">8 thèmes prédéfinis</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESENTATION_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onCreateWithTheme(theme.id)}
                      className="flex flex-col rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500/80 bg-slate-950/60 hover:bg-slate-900 transition-all text-left group"
                    >
                      <div
                        className="h-20 p-2.5 flex flex-col justify-between"
                        style={{
                          background: theme.bgGradient
                            ? `linear-gradient(${theme.bgGradient.from}, ${theme.bgGradient.to})`
                            : theme.bgColor,
                          color: theme.textColor,
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: theme.secondaryColor }}
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: theme.accentColor }}
                          />
                        </div>
                        <span
                          className="text-xs font-bold truncate block"
                          style={{ fontFamily: theme.titleFont }}
                        >
                          {theme.name.split('(')[0]}
                        </span>
                      </div>
                      <div className="p-2 text-[11px] text-slate-400 flex items-center justify-between font-medium group-hover:text-white">
                        <span>Créer</span>
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 3 : Recharger la démo complète */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">
                    Besoin d'inspiration ?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Ouvrir la présentation de démonstration complète HMD Slides
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLoadDemo}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  Charger la démo (5 diapositives)
                </button>
              </div>
            </>
          ) : (
            /* Tab: Mes diaporamas Firebase Cloud */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-cyan-400" />
                    Diaporamas enregistrés dans le Cloud Firebase
                  </h3>
                  <p className="text-xs text-slate-400">
                    Accédez à vos présentations sauvegardées sur votre compte Firebase distant
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchCloudPresentations}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-xs"
                  title="Actualiser la liste"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCloud ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
              </div>

              {isLoadingCloud ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin text-indigo-400" />
                  <p className="text-xs">Chargement de vos présentations depuis Firebase...</p>
                </div>
              ) : cloudList.length === 0 ? (
                <div className="py-14 text-center border border-dashed border-slate-800 rounded-2xl p-6 bg-slate-950/40">
                  <Cloud className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-300 mb-1">
                    Aucun diaporama trouvé sur Firebase Cloud
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    Pour enregistrer une présentation sur le Cloud, utilisez le bouton « Sauvegarder Cloud » dans l'en-tête de l'application.
                  </p>
                  <button
                    type="button"
                    onClick={onCreateBlank}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Créer un nouveau diaporama maintenant
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {cloudList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectPresentation(item)}
                      className="p-4 rounded-xl border border-slate-800 hover:border-indigo-500 bg-slate-950/60 hover:bg-slate-900/80 cursor-pointer transition-all flex flex-col justify-between group relative"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                            {item.slides?.length || 1} diapo{item.slides?.length > 1 ? 's' : ''}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCloudItem(e, item.id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800"
                            title="Supprimer du Cloud"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            {item.updatedAt
                              ? new Date(item.updatedAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Date inconnue'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                        <span>Ouvrir ce projet</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
