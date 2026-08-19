import React from 'react';
import { X, Trash2, Calendar } from 'lucide-react';

export interface HistoryItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  status: string;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: HistoryItem[];
  emptyMessage: string;
  deleteLabel: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  title,
  items,
  emptyMessage,
  deleteLabel,
  onSelect,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 shadow-2xl flex flex-col justify-between animate-slideLeft">

        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <h3 className="font-display font-semibold text-slate-50">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-50 border border-slate-800 hover:border-slate-600 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-140px)] space-y-2.5 pr-1">
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                {emptyMessage}
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 hover:border-blue-600/50 rounded-md p-3.5 transition group cursor-pointer"
                  onClick={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-100 group-hover:text-blue-400 transition">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="text-slate-600 hover:text-red-400 p-1 transition cursor-pointer"
                      title={deleteLabel}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900 text-[10px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <span className="text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-semibold">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
