import React, { useState } from 'react';
import { ChevronUp, ChevronDown, FileText } from 'lucide-react';

interface NotesDrawerProps {
  notes: string;
  onUpdateNotes: (newNotes: string) => void;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  notes,
  onUpdateNotes,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900 border-t border-slate-800 transition-all duration-200 select-none z-10">
      {/* Header bar to toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-8 px-4 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2 font-medium">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>Notes du présentateur</span>
          {notes && notes.trim() && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span>{isOpen ? 'Masquer' : 'Afficher'}</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expandable Notes Area */}
      {isOpen && (
        <div className="p-3 bg-slate-950/80 border-t border-slate-800/60">
          <textarea
            value={notes}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder="Saisissez ici les notes privées pour cette diapositive. Elles ne seront visibles que par vous en mode présentateur..."
            rows={3}
            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
