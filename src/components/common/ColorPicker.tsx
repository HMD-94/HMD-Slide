import React, { useState } from 'react';

interface ColorPickerProps {
  color?: string;
  onChange: (newColor: string) => void;
  label?: string;
  showTransparent?: boolean;
}

const PRESET_PALETTE = [
  '#000000', '#ffffff', '#64748b', '#0f172a',
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#ec4899', '#f43f5e', '#84cc16', '#14b8a6',
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color = '#4f46e5',
  onChange,
  label,
  showTransparent = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {label && <label className="text-xs text-slate-400 block mb-1 font-medium">{label}</label>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded border border-slate-600 cursor-pointer shadow-sm relative overflow-hidden transition-transform active:scale-95 flex items-center justify-center shrink-0"
          style={{
            backgroundColor: color === 'transparent' ? 'transparent' : color,
            backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : undefined,
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
          }}
          title="Choisir une couleur"
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
        />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 w-52">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {PRESET_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setIsOpen(false);
                  }}
                  className="w-8 h-8 rounded border border-slate-700 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="color"
                value={color.startsWith('#') && color.length === 7 ? color : '#4f46e5'}
                onChange={(e) => onChange(e.target.value)}
                className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
              />
              <span className="text-xs text-slate-400">Pipette libre</span>
              {showTransparent && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('transparent');
                    setIsOpen(false);
                  }}
                  className="ml-auto text-[11px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
                >
                  Aucun
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
