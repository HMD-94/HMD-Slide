import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { COMMON_EMOJIS, POPULAR_ICONS } from '../../constants/shapes';

interface IconPickerModalProps {
  onSelectIcon: (iconName: string) => void;
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  onSelectIcon,
  onSelectEmoji,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'icons' | 'emojis'>('icons');
  const [search, setSearch] = useState('');

  const filteredIcons = POPULAR_ICONS.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('icons')}
              className={`text-sm font-bold pb-1 border-b-2 transition-colors ${
                activeTab === 'icons'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Icônes vectorielles
            </button>
            <button
              onClick={() => setActiveTab('emojis')}
              className={`text-sm font-bold pb-1 border-b-2 transition-colors ${
                activeTab === 'emojis'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Émojis
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        {activeTab === 'icons' && (
          <div className="px-6 pt-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher une icône (ex: Target, Rocket, Chart)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'icons' ? (
            <div className="grid grid-cols-6 gap-3">
              {filteredIcons.map((iconName) => {
                const iconsMap = LucideIcons as unknown as Record<string, React.ElementType>;
                const IconComp = iconsMap[iconName];
                if (!IconComp) return null;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onSelectIcon(iconName);
                      onClose();
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-600/10 text-slate-300 hover:text-white transition-all group"
                    title={iconName}
                  >
                    <IconComp className="w-6 h-6 mb-1 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-[10px] truncate max-w-full text-slate-500 group-hover:text-slate-300">
                      {iconName}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-2">
              {COMMON_EMOJIS.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelectEmoji(emoji);
                    onClose();
                  }}
                  className="w-11 h-11 text-2xl flex items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-600/20 hover:scale-110 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
