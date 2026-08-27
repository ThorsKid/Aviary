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
  Home,
  Tag,
  Dna,
  Clock,
  Box,
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
    is_holding: false,
    lineage: '',
    age: '',
    mated_nuc_number: '',
  });

  const filteredQueens = queens.filter((q) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const hive = hiveLookup[q.hive_id];
    return (
      q.label.toLowerCase().includes(term) ||
      (q.breed && q.breed.toLowerCase().includes(term)) ||
      (q.origin && q.origin.toLowerCase().includes(term)) ||
      (q.notes && q.notes.toLowerCase().includes(term)) ||
      (q.lineage && q.lineage.toLowerCase().includes(term)) ||
      (q.mated_nuc_number && q.mated_nuc_number.toLowerCase().includes(term)) ||
      (hive && hive.number.toLowerCase().includes(term))
    );
  });

  const holdingQueens = filteredQueens.filter((q) => q.is_holding || q.status === 'mated-holding');
  const inHiveQueens = filteredQueens.filter((q) => !q.is_holding && q.status === 'in-hive');
  const spareQueens = filteredQueens.filter((q) => !q.is_holding && q.status === 'spare');
  const pastQueens = filteredQueens.filter(
    (q) => !q.is_holding && (q.status === 'sold' || q.status === 'dead')
  );

  const handleOpenAdd = (defaultIsHolding = false) => {
    setEditingQueen(null);
    setFormData({
      label: '',
      origin: 'raised',
      breed: '',
      status: defaultIsHolding ? 'mated-holding' : 'spare',
      hive_id: '',
      date_introduced: today(),
      notes: '',
      is_holding: defaultIsHolding,
      lineage: '',
      age: 'Current Season (Mated)',
      mated_nuc_number: defaultIsHolding ? 'Mating Nuc #' : '',
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
      is_holding: Boolean(q.is_holding || q.status === 'mated-holding'),
      lineage: q.lineage || '',
      age: q.age || '',
      mated_nuc_number: q.mated_nuc_number || '',
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

    const isHolding = Boolean(formData.is_holding || formData.status === 'mated-holding');

    const updated: Queen = {
      id: editingQueen ? editingQueen.id : uid(),
      label: formData.label.trim(),
      origin: formData.origin,
      breed: formData.breed.trim(),
      status: isHolding ? 'mated-holding' : formData.status,
      hive_id: formData.status === 'in-hive' && !isHolding ? formData.hive_id : '',
      date_introduced: formData.date_introduced,
      notes: formData.notes.trim(),
      is_holding: isHolding,
      lineage: formData.lineage.trim(),
      age: formData.age.trim(),
      mated_nuc_number: formData.mated_nuc_number.trim(),
    };

    onSaveQueen(updated);
    setIsModalOpen(false);
  };

  const renderQueenCard = (q: Queen) => {
    const hive = hiveLookup[q.hive_id];
    const isHolding = Boolean(q.is_holding || q.status === 'mated-holding');

    const getTone = (st: QueenStatus) => {
      if (isHolding) return 'good';
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
        className={`p-4 rounded-xl bg-white border shadow-xs hover:border-slate-300 transition-colors ${
          isHolding
            ? 'border-indigo-200 ring-1 ring-indigo-100 bg-linear-to-b from-white to-indigo-50/20'
            : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Crown
              className={`w-4 h-4 ${
                isHolding
                  ? 'text-indigo-600'
                  : q.status === 'in-hive'
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
          {isHolding ? (
            <StatusChip label="Mated Holding Nuc" tone="good" size="sm" />
          ) : (
            <StatusChip label={q.status} tone={getTone(q.status)} size="sm" />
          )}
          <StatusChip label={`Origin: ${q.origin}`} tone="dim" size="sm" />
          {!isHolding && q.status === 'in-hive' && hive && (
            <StatusChip label={`Colony: ${hive.number}`} tone="warn" size="sm" />
          )}
          {q.date_introduced && (
            <span className="text-[11px] font-mono text-slate-400">
              Introduced {q.date_introduced}
            </span>
          )}
        </div>

        {/* Rearing / Holding Metadata Box */}
        {isHolding && (
          <div className="mt-3 p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs space-y-1.5 font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-indigo-950">
              {q.mated_nuc_number && (
                <div className="flex items-center gap-1">
                  <Box className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="text-slate-500 text-[10px]">NUC:</span>
                  <strong className="font-semibold text-indigo-900">{q.mated_nuc_number}</strong>
                </div>
              )}
              {q.age && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="text-slate-500 text-[10px]">AGE:</span>
                  <strong className="font-semibold text-indigo-900">{q.age}</strong>
                </div>
              )}
              {q.lineage && (
                <div className="flex items-center gap-1 sm:col-span-3">
                  <Dna className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="text-slate-500 text-[10px]">LINEAGE:</span>
                  <strong className="font-semibold text-indigo-900">{q.lineage}</strong>
                </div>
              )}
            </div>
          </div>
        )}

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
            Queen Stock &amp; Queen Rearing Bank
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1">
            {queens.length} registered queens · {holdingQueens.length} holding in mating nucs · {inHiveQueens.length} active in production hives
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAdd(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold py-2.5 px-3.5 rounded-lg shadow-sm font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              <Box className="w-4 h-4" />
              + Mated Holding Nuc
            </button>
            <button
              onClick={() => handleOpenAdd(false)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold py-2.5 px-3.5 rounded-lg shadow-sm font-mono uppercase tracking-wider transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Add Queen
            </button>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Total Queens
          </span>
          <span className="font-display text-xl font-bold text-slate-900 mt-2">
            {queens.length}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-indigo-200 shadow-xs flex flex-col justify-between bg-indigo-50/30">
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-700 font-semibold">
            Mated Queen Holding
          </span>
          <span className="font-display text-xl font-bold text-indigo-600 mt-2">
            {holdingQueens.length} nucs
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            In Active Colonies
          </span>
          <span className="font-display text-xl font-bold text-emerald-600 mt-2">
            {inHiveQueens.length} hives
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Spare Stock / Sold
          </span>
          <span className="font-display text-xl font-bold text-slate-600 mt-2">
            {spareQueens.length} spare / {pastQueens.length} hist
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search lineage, nuc #, breed, label..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none font-mono transition-colors"
          />
        </div>
      </div>

      {/* Group 1: Mated Queen Holding Section (Queen Rearing) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-indigo-700 tracking-wider">
            <Box className="w-4 h-4 text-indigo-600" />
            <span>Mated Queen Holding Section (Queen Rearing) · {holdingQueens.length}</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => handleOpenAdd(true)}
              className="text-xs text-indigo-600 hover:underline font-mono cursor-pointer"
            >
              + Add Holding Queen
            </button>
          )}
        </div>

        {holdingQueens.length === 0 ? (
          <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-400 font-mono shadow-xs">
            No mated queens currently in rearing holding nucs.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {holdingQueens.map(renderQueenCard)}
          </div>
        )}
      </div>

      {/* Group 2: In Hives */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase font-semibold text-emerald-700 tracking-wider">
          <Crown className="w-4 h-4 text-emerald-600" />
          <span>Active in Production Hives ({inHiveQueens.length})</span>
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

      {/* Group 3: Spare Queen Bank */}
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

      {/* Group 4: Sold or Deceased */}
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
          title={editingQueen ? `Edit Queen ${editingQueen.label}` : 'Add Queen / Holding Nuc'}
          subtitle="Record genetics, queen rearing holding status, lineage, age, and nuc placement"
          maxWidth="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {/* Queen Rearing Mated Holding Toggle */}
            <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.is_holding}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_holding: e.target.checked,
                      status: e.target.checked ? 'mated-holding' : formData.status,
                    })
                  }
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-indigo-300 cursor-pointer"
                />
                <span className="font-mono font-bold text-indigo-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-indigo-600" />
                  Mated Queen Holding Section (Queen Rearing)
                </span>
              </label>
              <p className="text-[11px] text-indigo-800/80 font-mono">
                Check this if the queen is mated and currently held in a mating nuc or holding bank.
              </p>
            </div>

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

            {/* Mated Queen Holding Specific Fields */}
            {formData.is_holding ? (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                      Mated Nuc Number *
                    </label>
                    <input
                      type="text"
                      value={formData.mated_nuc_number}
                      onChange={(e) =>
                        setFormData({ ...formData, mated_nuc_number: e.target.value })
                      }
                      placeholder="e.g. Nuc-04 (Mating Yard A)"
                      className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                      Queen Age / Emergence Date
                    </label>
                    <input
                      type="text"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="e.g. 2024 Summer (3 weeks)"
                      className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                    Queen Lineage &amp; Genetics
                  </label>
                  <input
                    type="text"
                    value={formData.lineage}
                    onChange={(e) =>
                      setFormData({ ...formData, lineage: e.target.value })
                    }
                    placeholder="e.g. VSH Italian Mother Line x Survivor Drone Station"
                    className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                  />
                </div>
              </div>
            ) : null}

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

            {!formData.is_holding && (
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
            )}

            {!formData.is_holding && formData.status === 'in-hive' && (
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
