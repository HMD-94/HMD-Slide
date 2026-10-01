import React, { useState } from 'react';
import { ChartSeries, ChartType, SlideElement } from '../../types/slides';
import { X, Plus, Trash2, BarChart2, PieChart, TrendingUp } from 'lucide-react';

interface ChartEditorModalProps {
  element: SlideElement;
  onSave: (updated: Partial<SlideElement>) => void;
  onClose: () => void;
}

export const ChartEditorModal: React.FC<ChartEditorModalProps> = ({
  element,
  onSave,
  onClose,
}) => {
  const [chartType, setChartType] = useState<ChartType>(element.chartType || 'bar');
  const [chartTitle, setChartTitle] = useState(element.chartTitle || 'Nouveau graphique');
  const [categoriesText, setCategoriesText] = useState(
    (element.categories || ['T1', 'T2', 'T3', 'T4']).join(', ')
  );
  const [series, setSeries] = useState<ChartSeries[]>(
    element.series && element.series.length > 0
      ? JSON.parse(JSON.stringify(element.series))
      : [
          { name: 'Série 1', data: [120, 190, 260, 310], color: '#6366f1' },
          { name: 'Série 2', data: [80, 140, 200, 280], color: '#06b6d4' },
        ]
  );
  const [showLegend, setShowLegend] = useState(element.showLegend !== false);
  const [showGrid, setShowGrid] = useState(element.showGrid !== false);

  const parsedCategories = categoriesText
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  const handleSeriesDataChange = (idx: number, rawVal: string) => {
    const nums = rawVal
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .map((n) => (isNaN(n) ? 0 : n));
    const next = [...series];
    next[idx].data = nums;
    setSeries(next);
  };

  const handleSeriesNameChange = (idx: number, name: string) => {
    const next = [...series];
    next[idx].name = name;
    setSeries(next);
  };

  const handleSeriesColorChange = (idx: number, color: string) => {
    const next = [...series];
    next[idx].color = color;
    setSeries(next);
  };

  const addSeries = () => {
    const colors = ['#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];
    const nextColor = colors[series.length % colors.length];
    setSeries([
      ...series,
      {
        name: `Série ${series.length + 1}`,
        data: parsedCategories.map(() => 50),
        color: nextColor,
      },
    ]);
  };

  const removeSeries = (idx: number) => {
    if (series.length <= 1) return;
    setSeries(series.filter((_, i) => i !== idx));
  };

  const handleApply = () => {
    onSave({
      chartType,
      chartTitle,
      categories: parsedCategories.length > 0 ? parsedCategories : ['Cat 1', 'Cat 2'],
      series,
      showLegend,
      showGrid,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Éditeur de Graphique</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Chart Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Type de graphique
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'bar', label: 'Colonnes (Barres)', icon: BarChart2 },
                { id: 'bar-horizontal', label: 'Barres horiz.', icon: BarChart2 },
                { id: 'line', label: 'Courbes / Lignes', icon: TrendingUp },
                { id: 'pie', label: 'Secteurs (Camembert)', icon: PieChart },
              ].map((t) => {
                const Icon = t.icon;
                const active = chartType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setChartType(t.id as ChartType)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
                      active
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Categories */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Titre du graphique
              </label>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Catégories (séparées par une virgule)
              </label>
              <input
                type="text"
                value={categoriesText}
                onChange={(e) => setCategoriesText(e.target.value)}
                placeholder="T1, T2, T3, T4"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Series Data Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Séries de Données
              </label>
              <button
                type="button"
                onClick={addSeries}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une série
              </button>
            </div>

            <div className="space-y-3">
              {series.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl"
                >
                  <input
                    type="color"
                    value={s.color}
                    onChange={(e) => handleSeriesColorChange(idx, e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                    title="Couleur de la série"
                  />
                  <input
                    type="text"
                    value={s.name}
                    onChange={(e) => handleSeriesNameChange(idx, e.target.value)}
                    className="w-32 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                    placeholder="Nom de la série"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={s.data.join(', ')}
                      onChange={(e) => handleSeriesDataChange(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 font-mono"
                      placeholder="Ex: 10, 25, 40, 55"
                    />
                  </div>
                  {series.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSeries(idx)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded"
                      title="Supprimer la série"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              Afficher la légende
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              Afficher la grille
            </label>
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
            Appliquer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};
