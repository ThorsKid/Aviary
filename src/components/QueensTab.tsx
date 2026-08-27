import React, { useState } from 'react';
import {
  Queen,
  Hive,
  QueenOrigin,
  QueenStatus,
  QUEEN_ORIGINS,
  QUEEN_STATUS_OPTIONS,
} from '../types';
import { today, uid } from '../storage/db';
import { StatusChip } from './StatusChip';
import { Modal } from './Modal';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Crown,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface QueensTabProps {
  queens: Queen[];
  hives: Hive[];
  isAdmin: boolean;
  onSaveQueen: (queen: Queen) => void;
  onDeleteQueen: (queenId: string) => void;
}

export const QueensTab: React.FC<QueensTabProps> = ({
  queens,
  hives,
  isAdmin,
  onSaveQueen,
  onDeleteQueen,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQueen, setEditingQueen] = useState<Queen | null>(null);

  const hiveLookup = React.useMemo(() => {
    const map: Record<string, Hive> = {};
    for (const h of hives) map[h.id] = h;
    return map;
  }, [hives]);

  // Form data state
  const [formData, setFormData] = useState({
    label: '',
    origin: 'raised' as QueenOrigin,
    breed: '',
    status: 'in-hive' as QueenStatus,
    hive_id: '',
    date_introduced: today(),
    notes: '',
  });

  const filteredQueens = queens.filter((q) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const hive = hiveLookup[q.hive_id];
    return (
      q.label.toLowerCase().includes(term) ||
      q.breed.toLowerCase().includes(term) ||
      q.origin.toLowerCase().includes(term) ||
      q.notes.toLowerCase().includes(term) ||
      (hive && hive.number.toLowerCase().includes(term))
    );
  });

  const inHiveQueens = filteredQueens.filter((q) => q.status === 'in-hive');
  const spareQueens = filteredQueens.filter((q) => q.status === 'spare');
  const pastQueens = filteredQueens.filter(
    (q) => q.status === 'sold' || q.status === 'dead'
  );

  const handleOpenAdd = () => {
    setEditingQueen(null);
    setFormData({
      label: '',
      origin: 'raised',
      breed: '',
      status: 'spare',
      hive_id: '',
      date_introduced: today(),
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: Queen) => {
    setEditingQueen(q);
    setFormData({
      label: q.label,
      origin: q.origin,
      breed: q.breed || '',
      status: q.status,
      hive_id: q.hive_id || '',
      date_introduced: q.date_introduced || today(),
      notes: q.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (q: Queen) => {
    if (window.confirm(`Delete queen record for "${q.label}"?`)) {
      onDeleteQueen(q.id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) return;

    const updated: Queen = {
      id: editingQueen ? editingQueen.id : uid(),
      label: formData.label.trim(),
      origin: formData.origin,
      breed: formData.breed.trim(),
      status: formData.status,
      hive_id: formData.status === 'in-hive' ? formData.hive_id : '',
      date_introduced: formData.date_introduced,
      notes: formData.notes.trim(),
    };

    onSaveQueen(updated);
    setIsModalOpen(false);
  };

  const renderQueenCard = (q: Queen) => {
    const hive = hiveLookup[q.hive_id];
    const getTone = (st: QueenStatus) => {
      switch (st) {
        case 'in-hive':
          return 'good';
        case 'spare':
          return 'neutral';
        case 'dead':
          return 'bad';
        case 'sold':
        default:
          return 'dim';
      }
    };

    return (
      <div
        key={q.id}
        className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
      >
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Crown
              className={`w-4 h-4 ${
                q.status === 'in-hive'
                  ? 'text-amber-500'
                  : q.status === 'spare'
                  ? 'text-sky-500'
                  : 'text-slate-400'
              }`}
            />
            <span className="font-semibold text-sm text-slate-900">
              {q.label}
            </span>
            <span className="text-xs font-mono text-slate-400">
              · {q.breed || 'Genetics unspecified'}
            </span>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleOpenEdit(q)}
                className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                title="Edit Queen"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(q)}
                className="p-1.5 rounded-md bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                title="Delete Queen"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Chips */}
        <div className="flex items-center gap-2 pt-3 flex-wrap">
          <StatusChip label={q.status} tone={getTone(q.status)} size="sm" />
          <StatusChip label={`Origin: ${q.origin}`} tone="dim" size="sm" />
          {q.status === 'in-hive' && hive && (
            <StatusChip label={`Colony: ${hive.number}`} tone="warn" size="sm" />
          )}
          {q.date_introduced && (
            <span className="text-[11px] font-mono text-slate-400">
              Introduced {q.date_introduced}
            </span>
          )}
        </div>

        {q.notes && (
          <p className="mt-2.5 text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
            &ldquo;{q.notes}&rdquo;
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            Queen Stock &amp; Bank
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1">
            {queens.length} queen records ({inHiveQueens.length} in production hives,{' '}
            {spareQueens.length} in spare bank)
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-sm font-mono uppercase tracking-wider transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add Queen
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search queens by label, breed, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none font-mono transition-colors"
          />
        </div>
      </div>

      {/* Group 1: In Hives */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase font-semibold text-indigo-600 tracking-wider">
          <Crown className="w-4 h-4" />
          <span>In Production Hives ({inHiveQueens.length})</span>
        </div>
        {inHiveQueens.length === 0 ? (
          <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-400 font-mono shadow-xs">
            No active queens assigned to hives.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inHiveQueens.map(renderQueenCard)}
          </div>
        )}
      </div>

      {/* Group 2: Spare Queen Bank */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase font-semibold text-sky-600 tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Spare / Bank Queens ({spareQueens.length})</span>
        </div>
        {spareQueens.length === 0 ? (
          <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-400 font-mono shadow-xs">
            No spare queens currently in the queen bank.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {spareQueens.map(renderQueenCard)}
          </div>
        )}
      </div>

      {/* Group 3: Sold or Deceased */}
      {pastQueens.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-semibold text-slate-500 tracking-wider">
            <span>Sold / Deceased Queen Records ({pastQueens.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-80">
            {pastQueens.map(renderQueenCard)}
          </div>
        </div>
      )}

      {/* Add / Edit Queen Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingQueen ? `Edit Queen ${editingQueen.label}` : 'Add New Queen to Stock'}
          subtitle="Record genetics, origin, colony assignment, and marking notes"
          maxWidth="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                Queen Label / Markings *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g. Yellow 2024 #1 (Clipped)"
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Origin
                </label>
                <select
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value as QueenOrigin })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none capitalize"
                >
                  {QUEEN_ORIGINS.map((orig) => (
                    <option key={orig} value={orig}>
                      {orig}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Breed / Genetics
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="e.g. Carniolan, Italian, Buckfast"
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as QueenStatus })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none capitalize"
                >
                  {QUEEN_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Date Introduced
                </label>
                <input
                  type="date"
                  value={formData.date_introduced}
                  onChange={(e) =>
                    setFormData({ ...formData, date_introduced: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none font-mono transition-colors"
                />
              </div>
            </div>

            {formData.status === 'in-hive' && (
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Assign To Hive Colony
                </label>
                <select
                  value={formData.hive_id}
                  onChange={(e) => setFormData({ ...formData, hive_id: e.target.value })}
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                >
                  <option value="">(None)</option>
                  {hives.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.number} ({h.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                Breeding / Performance Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Laying pattern characteristics, brood compactness, hygienic traits..."
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-mono uppercase tracking-wide transition-colors cursor-pointer"
              >
                Save Queen
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
