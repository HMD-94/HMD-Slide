import React, { useState } from 'react';
import { SlideElement } from '../../types/slides';
import { X, Table, Plus, Trash2 } from 'lucide-react';

interface TableEditorModalProps {
  element: SlideElement;
  onSave: (updated: Partial<SlideElement>) => void;
  onClose: () => void;
}

export const TableEditorModal: React.FC<TableEditorModalProps> = ({
  element,
  onSave,
  onClose,
}) => {
  const [data, setData] = useState<string[][]>(
    element.tableData && element.tableData.length > 0
      ? JSON.parse(JSON.stringify(element.tableData))
      : [
          ['Col 1', 'Col 2', 'Col 3'],
          ['Donnée 1', 'Donnée 2', 'Donnée 3'],
          ['Donnée 4', 'Donnée 5', 'Donnée 6'],
        ]
  );
  const [headerRow, setHeaderRow] = useState(element.headerRow !== false);
  const [headerBg, setHeaderBg] = useState(element.headerBg || '#4f46e5');
  const [altRowBg, setAltRowBg] = useState(element.altRowBg || 'rgba(30, 41, 59, 0.4)');

  const numRows = data.length;
  const numCols = data[0]?.length || 1;

  const handleCellChange = (r: number, c: number, val: string) => {
    const next = data.map((row, rIdx) =>
      rIdx === r ? row.map((cell, cIdx) => (cIdx === c ? val : cell)) : [...row]
    );
    setData(next);
  };

  const addRow = () => {
    const newRow = Array(numCols).fill('');
    setData([...data, newRow]);
  };

  const removeRow = () => {
    if (numRows <= 1) return;
    setData(data.slice(0, -1));
  };

  const addColumn = () => {
    const next = data.map((row, rIdx) => [...row, rIdx === 0 ? `Col ${numCols + 1}` : '']);
    setData(next);
  };

  const removeColumn = () => {
    if (numCols <= 1) return;
    const next = data.map((row) => row.slice(0, -1));
    setData(next);
  };

  const handleApply = () => {
    onSave({
      tableData: data,
      tableRows: data.length,
      tableCols: data[0]?.length || 1,
      headerRow,
      headerBg,
      altRowBg,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Éditeur de Tableau</h3>
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
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Lignes : {numRows}</span>
              <button
                type="button"
                onClick={addRow}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Ligne
              </button>
              <button
                type="button"
                onClick={removeRow}
                disabled={numRows <= 1}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-white rounded flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Ligne
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Colonnes : {numCols}</span>
              <button
                type="button"
                onClick={addColumn}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Col
              </button>
              <button
                type="button"
                onClick={removeColumn}
                disabled={numCols <= 1}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-white rounded flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Col
              </button>
            </div>
          </div>

          {/* Grid Preview & Direct Edit */}
          <div className="border border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-x-auto overflow-y-auto">
            <table className="w-full border-collapse">
              <tbody>
                {data.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    style={{
                      background:
                        rIdx === 0 && headerRow
                          ? headerBg
                          : rIdx % 2 === 1
                          ? altRowBg
                          : 'transparent',
                    }}
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1 border border-slate-700/60">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                          className={`w-full px-2 py-1 bg-transparent text-xs text-white focus:outline-none focus:bg-slate-800/80 rounded ${
                            rIdx === 0 && headerRow ? 'font-bold' : ''
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Appearance */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={headerRow}
                  onChange={(e) => setHeaderRow(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                En-tête distincte
              </label>
            </div>
            {headerRow && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Fond en-tête :</span>
                <input
                  type="color"
                  value={headerBg}
                  onChange={(e) => setHeaderBg(e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Alternance rangées :</span>
              <input
                type="color"
                value="#1e293b"
                onChange={(e) => setAltRowBg(e.target.value)}
                className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
              />
            </div>
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
            Appliquer le tableau
          </button>
        </div>
      </div>
    </div>
  );
};
