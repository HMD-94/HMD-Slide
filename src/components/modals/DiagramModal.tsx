import React from 'react';
import { SlideElement } from '../../types/slides';
import { X, GitCommit, ArrowRight, RefreshCw, Layers } from 'lucide-react';

interface DiagramModalProps {
  onInsertDiagram: (elements: SlideElement[]) => void;
  onClose: () => void;
}

export const DiagramModal: React.FC<DiagramModalProps> = ({
  onInsertDiagram,
  onClose,
}) => {
  const insertProcess3 = () => {
    const startX = 140;
    const y = 200;
    const boxW = 200;
    const boxH = 120;
    const gap = 80;
    const now = Date.now();

    const elements: SlideElement[] = [
      // Block 1
      {
        id: `diag-b1-${now}`,
        type: 'shape',
        name: 'Étape 1 - Cadrage',
        shapeType: 'rounded-rect',
        x: startX,
        y,
        width: boxW,
        height: boxH,
        rotation: 0,
        opacity: 0.95,
        zIndex: 10,
        fillColor: '#1e293b',
        strokeColor: '#6366f1',
        strokeWidth: 2,
        borderRadius: 14,
      },
      {
        id: `diag-t1-${now}`,
        type: 'text',
        name: 'Texte Étape 1',
        content: '01. Cadrage\n\nDéfinition des objectifs et analyse des besoins.',
        x: startX + 15,
        y: y + 25,
        width: boxW - 30,
        height: boxH - 50,
        rotation: 0,
        opacity: 1,
        zIndex: 11,
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 1.4,
      },
      // Arrow 1 -> 2
      {
        id: `diag-a1-${now}`,
        type: 'shape',
        name: 'Flèche 1-2',
        shapeType: 'arrow-right',
        x: startX + boxW + 15,
        y: y + boxH / 2 - 15,
        width: 50,
        height: 30,
        rotation: 0,
        opacity: 0.8,
        zIndex: 12,
        fillColor: '#818cf8',
      },
      // Block 2
      {
        id: `diag-b2-${now}`,
        type: 'shape',
        name: 'Étape 2 - Conception',
        shapeType: 'rounded-rect',
        x: startX + boxW + gap,
        y,
        width: boxW,
        height: boxH,
        rotation: 0,
        opacity: 0.95,
        zIndex: 10,
        fillColor: '#1e293b',
        strokeColor: '#06b6d4',
        strokeWidth: 2,
        borderRadius: 14,
      },
      {
        id: `diag-t2-${now}`,
        type: 'text',
        name: 'Texte Étape 2',
        content: '02. Conception\n\nCréation des maquettes et prototypes interactifs.',
        x: startX + boxW + gap + 15,
        y: y + 25,
        width: boxW - 30,
        height: boxH - 50,
        rotation: 0,
        opacity: 1,
        zIndex: 11,
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 1.4,
      },
      // Arrow 2 -> 3
      {
        id: `diag-a2-${now}`,
        type: 'shape',
        name: 'Flèche 2-3',
        shapeType: 'arrow-right',
        x: startX + 2 * (boxW + gap) - gap + 15,
        y: y + boxH / 2 - 15,
        width: 50,
        height: 30,
        rotation: 0,
        opacity: 0.8,
        zIndex: 12,
        fillColor: '#22d3ee',
      },
      // Block 3
      {
        id: `diag-b3-${now}`,
        type: 'shape',
        name: 'Étape 3 - Lancement',
        shapeType: 'rounded-rect',
        x: startX + 2 * (boxW + gap),
        y,
        width: boxW,
        height: boxH,
        rotation: 0,
        opacity: 0.95,
        zIndex: 10,
        fillColor: '#1e293b',
        strokeColor: '#10b981',
        strokeWidth: 2,
        borderRadius: 14,
      },
      {
        id: `diag-t3-${now}`,
        type: 'text',
        name: 'Texte Étape 3',
        content: '03. Déploiement\n\nExport autonome et diffusion auprès des équipes.',
        x: startX + 2 * (boxW + gap) + 15,
        y: y + 25,
        width: boxW - 30,
        height: boxH - 50,
        rotation: 0,
        opacity: 1,
        zIndex: 11,
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 1.4,
      },
    ];

    onInsertDiagram(elements);
    onClose();
  };

  const insertHierarchy = () => {
    const now = Date.now();
    const elements: SlideElement[] = [
      // Top node
      {
        id: `diag-h-top-${now}`,
        type: 'shape',
        name: 'Direction Générale',
        shapeType: 'rounded-rect',
        x: 390,
        y: 120,
        width: 220,
        height: 60,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        fillColor: '#4f46e5',
        strokeColor: '#818cf8',
        strokeWidth: 2,
        borderRadius: 12,
      },
      {
        id: `diag-h-top-txt-${now}`,
        type: 'text',
        name: 'Texte Direction',
        content: 'Direction / Stratégie',
        x: 400,
        y: 138,
        width: 200,
        height: 30,
        rotation: 0,
        opacity: 1,
        zIndex: 11,
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
      },
      // Child 1
      {
        id: `diag-h-c1-${now}`,
        type: 'shape',
        name: 'Produit & Design',
        shapeType: 'rounded-rect',
        x: 180,
        y: 280,
        width: 190,
        height: 60,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        fillColor: '#1e293b',
        strokeColor: '#06b6d4',
        strokeWidth: 2,
        borderRadius: 12,
      },
      {
        id: `diag-h-c1-txt-${now}`,
        type: 'text',
        name: 'Texte Produit',
        content: 'Produit & Design',
        x: 190,
        y: 298,
        width: 170,
        height: 30,
        rotation: 0,
        opacity: 1,
        zIndex: 11,
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
      },
      // Child 2
      {
        id: `diag-h-c2-${now}`,
        type: 'shape',
        name: 'Ingénierie Tech',
        shapeType: 'rounded-rect',
        x: 405,
        y: 280,
        width: 190,
        height: 60,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        fillColor: '#1e293b',
        strokeColor: '#10b981',
        strokeWidth: 2,
        borderRadius: 12,
      },
      {
        id: `diag-h-c2-txt-${now}`,
        type: 'text',
        name: 'Texte Tech',
        content: 'Ingénierie & R&D',
        x: 415,
        y: 298,
        width: 170,
        height: 30,
        rotation: 0,
        opacity: 1,
        zIndex: 11,
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
      },
      // Child 3
      {
        id: `diag-h-c3-${now}`,
        type: 'shape',
        name: 'Marketing & Ventes',
        shapeType: 'rounded-rect',
        x: 630,
        y: 280,
        width: 190,
        height: 60,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        fillColor: '#1e293b',
        strokeColor: '#f59e0b',
        strokeWidth: 2,
        borderRadius: 12,
      },
      {
        id: `diag-h-c3-txt-${now}`,
        type: 'text',
        name: 'Texte Ventes',
        content: 'Croissance & Ventes',
        x: 640,
        y: 298,
        width: 170,
        height: 30,
        rotation: 0,
        opacity: 1,
        zIndex: 11,
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
      },
    ];

    onInsertDiagram(elements);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Insérer un Diagramme</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={insertProcess3}
            className="flex flex-col items-center p-5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500 hover:bg-indigo-600/10 text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-3 text-indigo-400 group-hover:scale-105 transition-transform">
              <span className="w-6 h-6 rounded-md bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-xs">1</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="w-6 h-6 rounded-md bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-xs">2</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <span className="w-6 h-6 rounded-md bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-xs">3</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Processus Linéaire (3 étapes)</h4>
            <p className="text-xs text-slate-400 text-center">
              Blocs ordonnés reliés par des flèches directionnelles fluides.
            </p>
          </button>

          <button
            type="button"
            onClick={insertHierarchy}
            className="flex flex-col items-center p-5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500 hover:bg-indigo-600/10 text-left transition-all group"
          >
            <div className="flex flex-col items-center mb-3 group-hover:scale-105 transition-transform">
              <span className="w-12 h-5 rounded-md bg-indigo-600/40 border border-indigo-400 text-[10px] flex items-center justify-center mb-1 text-white">Niveau 1</span>
              <div className="w-px h-3 bg-slate-600"></div>
              <div className="flex gap-2">
                <span className="w-7 h-4 rounded bg-slate-800 border border-slate-600 text-[8px] flex items-center justify-center text-slate-300">A</span>
                <span className="w-7 h-4 rounded bg-slate-800 border border-slate-600 text-[8px] flex items-center justify-center text-slate-300">B</span>
                <span className="w-7 h-4 rounded bg-slate-800 border border-slate-600 text-[8px] flex items-center justify-center text-slate-300">C</span>
              </div>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Organigramme / Arbre</h4>
            <p className="text-xs text-slate-400 text-center">
              Structure hiérarchique avec tête directrice et départements.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
