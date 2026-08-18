import React from 'react';
import { X, Trash2, Calendar, Building2 } from 'lucide-react';
import type { DossierData } from '../types';

interface HistoryListProps {
  isOpen: boolean;
  onClose: () => void;
  dossiers: DossierData[];
  onSelectDossier: (dossier: DossierData) => void;
  onDeleteDossier: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  isOpen,
  onClose,
  dossiers,
  onSelectDossier,
  onDeleteDossier,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-ink-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-ink-900 border-l border-ink-800 h-full p-6 shadow-2xl flex flex-col justify-between animate-slideLeft">

        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b border-ink-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-ink-500" />
              <h3 className="font-display font-semibold text-ink-50">Dossiers Guardados ({dossiers.length})</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-ink-400 hover:text-ink-50 border border-ink-800 hover:border-ink-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* List of Dossiers */}
          <div className="overflow-y-auto max-h-[calc(100vh-140px)] space-y-2.5 pr-1">
            {dossiers.length === 0 ? (
              <div className="text-center py-12 text-ink-500 text-xs">
                Aún no has generado ningún dossier. ¡Ingresa un dominio para comenzar!
              </div>
            ) : (
              dossiers.map((d) => (
                <div
                  key={d.id}
                  className="bg-ink-950 border border-ink-800 hover:border-gold-700/50 rounded-md p-3.5 transition group cursor-pointer"
                  onClick={() => {
                    onSelectDossier(d);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-ink-100 group-hover:text-gold-300 transition">
                        {d.companyName}
                      </h4>
                      <p className="text-[11px] text-ink-500 flex items-center gap-1 mt-0.5">
                        <span>{d.websiteUrl}</span> · <span>{d.targetPersona}</span>
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDossier(d.id);
                      }}
                      className="text-ink-600 hover:text-red-400 p-1 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-ink-900 text-[10px]">
                    <span className="text-ink-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-ink-400 border border-ink-700 px-2 py-0.5 rounded font-semibold">
                      {d.status}
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
