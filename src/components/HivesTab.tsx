import React, { useState } from 'react';
import {
  Hive,
  Queen,
  Inspection,
  HiveStatus,
  HiveSource,
  HIVE_STATUSES,
  HIVE_SOURCES,
} from '../types';
import { daysAgo, today, uid } from '../storage/db';
import { StatusChip } from './StatusChip';
import { Modal } from './Modal';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ClipboardCheck,
  Crown,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

interface HivesTabProps {
  hives: Hive[];
  queens: Queen[];
  inspections: Inspection[];
  isAdmin: boolean;
  onSaveHive: (hive: Hive) => void;
  onDeleteHive: (hiveId: string) => void;
  onLogInspectionForHive: (hiveId: string) => void;
}

export const HivesTab: React.FC<HivesTabProps> = ({
  hives,
  queens,
  inspections,
  isAdmin,
  onSaveHive,
  onDeleteHive,
  onLogInspectionForHive,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedHiveForDetail, setSelectedHiveForDetail] = useState<Hive | null>(null);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHive, setEditingHive] = useState<Hive | null>(null);

  const [formData, setFormData] = useState({
    number: '',
    location: '',
    date_established: today(),
    source: 'package' as HiveSource,
    status: 'active' as HiveStatus,
    queen_id: '',
    notes: '',
  });

  const queenLookup = React.useMemo(() => {
    const map: Record<string, Queen> = {};
    for (const q of queens) map[q.id] = q;
    return map;
  }, [queens]);

  const lastInspectionMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const insp of inspections) {
      if (!map[insp.hive_id] || insp.date > map[insp.hive_id]) {
        map[insp.hive_id] = insp.date;
      }
    }
    return map;
  }, [inspections]);

  const filteredHives = hives.filter((h) => {
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const qObj = queenLookup[h.queen_id];
    return (
      h.number.toLowerCase().includes(q) ||
      h.location.toLowerCase().includes(q) ||
      h.notes.toLowerCase().includes(q) ||
      (qObj && qObj.label.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingHive(null);
    setFormData({
      number: '',
      location: '',
      date_established: today(),
      source: 'package',
      status: 'active',
      queen_id: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (hive: Hive, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingHive(hive);
    setFormData({
      number: hive.number,
      location: hive.location,
      date_established: hive.date_established || today(),
      source: hive.source,
      status: hive.status,
      queen_id: hive.queen_id,
      notes: hive.notes,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (hive: Hive, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete ${hive.number}? This cannot be undone.`
      )
    ) {
      onDeleteHive(hive.id);
      if (selectedHiveForDetail?.id === hive.id) {
        setSelectedHiveForDetail(null);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number.trim()) return;

    const updated: Hive = {
      id: editingHive ? editingHive.id : uid(),
      number: formData.number.trim(),
      location: formData.location.trim(),
      date_established: formData.date_established,
      source: formData.source,
      status: formData.status,
      queen_id: formData.queen_id,
      notes: formData.notes.trim(),
    };

    onSaveHive(updated);
    setIsModalOpen(false);
  };

  // Get inspections for detail view
  const detailInspections = selectedHiveForDetail
    ? inspections
        .filter((i) => i.hive_id === selectedHiveForDetail.id)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            Hives & Colonies
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1">
            {hives.length} total · {hives.filter((h) => h.status === 'active').length} active production colonies
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-sm font-mono uppercase tracking-wider transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Add Hive
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', ...HIVE_STATUSES].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all capitalize whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search hive, location, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none font-mono transition-colors"
          />
        </div>
      </div>

      {/* Hive Table / List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Hive Number / Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Queen</th>
                <th className="py-3 px-4">Last Inspected</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHives.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                    No hive records found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredHives.map((h) => {
                  const q = queenLookup[h.queen_id];
                  const days = daysAgo(lastInspectionMap[h.id]);
                  const isOverdue = days > 7 && h.status === 'active';

                  const getStatusTone = (st: HiveStatus) => {
                    switch (st) {
                      case 'active':
                        return 'good';
                      case 'queenless':
                      case 'dead':
                        return 'bad';
                      case 'sold':
                      case 'merged':
                        return 'dim';
                      default:
                        return 'neutral';
                    }
                  };

                  return (
                    <tr
                      key={h.id}
                      onClick={() => setSelectedHiveForDetail(h)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-indigo-600">⬡</span>
                          <span>{h.number}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {h.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {h.location}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusChip
                          label={h.status}
                          tone={getStatusTone(h.status)}
                          size="sm"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {q ? (
                          <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                            <Crown className="w-3 h-3 text-amber-500" />
                            {q.label}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">none</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {days >= 999999 ? (
                          <StatusChip label="Never" tone="warn" size="sm" />
                        ) : (
                          <span
                            className={`font-mono ${
                              isOverdue
                                ? 'text-amber-600 font-semibold'
                                : 'text-slate-600'
                            }`}
                          >
                            {days}d ago
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono capitalize">
                        {h.source}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onLogInspectionForHive(h.id)}
                            title="Log Inspection"
                            className="p-1.5 rounded-md bg-slate-100 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 border border-slate-200 transition-colors cursor-pointer"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                onClick={(e) => handleOpenEdit(h, e)}
                                title="Edit Hive"
                                className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(h, e)}
                                title="Delete Hive"
                                className="p-1.5 rounded-md bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hive Detail Drawer / Modal */}
      {selectedHiveForDetail && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedHiveForDetail(null)}
          title={selectedHiveForDetail.number}
          subtitle={`Established ${selectedHiveForDetail.date_established || '—'} · Source: ${selectedHiveForDetail.source}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* Quick Status Bar */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Status
                </span>
                <span className="font-semibold text-slate-900 capitalize">
                  {selectedHiveForDetail.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Location
                </span>
                <span className="text-slate-700 truncate block">
                  {selectedHiveForDetail.location || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Assigned Queen
                </span>
                <span className="text-amber-700 font-medium truncate block">
                  {queenLookup[selectedHiveForDetail.queen_id]?.label || 'None'}
                </span>
              </div>
            </div>

            {selectedHiveForDetail.notes && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Hive Notes
                </span>
                {selectedHiveForDetail.notes}
              </div>
            )}

            {/* Inspection History for This Hive */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                <h4 className="font-semibold text-xs text-slate-900 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Inspection History ({detailInspections.length})
                </h4>
                <button
                  onClick={() => {
                    const hId = selectedHiveForDetail.id;
                    setSelectedHiveForDetail(null);
                    onLogInspectionForHive(hId);
                  }}
                  className="text-xs text-indigo-600 hover:underline font-mono cursor-pointer"
                >
                  + Log Inspection
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {detailInspections.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-mono">
                    No inspections recorded yet for this hive.
                  </div>
                ) : (
                  detailInspections.map((insp) => (
                    <div
                      key={insp.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-slate-900">
                          {insp.date}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          by {insp.inspector || 'Staff'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <StatusChip
                          label={insp.queen_seen ? 'Queen Seen' : 'No Queen'}
                          tone={insp.queen_seen ? 'good' : 'bad'}
                          size="sm"
                        />
                        <StatusChip
                          label={`Brood: ${insp.brood_pattern}`}
                          tone="neutral"
                          size="sm"
                        />
                        <StatusChip
                          label={`Stores: ${insp.food_stores}`}
                          tone="dim"
                          size="sm"
                        />
                        {insp.extra_queens_seen > 0 && (
                          <StatusChip
                            label={`${insp.extra_queens_seen} queen cell(s)`}
                            tone="warn"
                            size="sm"
                          />
                        )}
                      </div>
                      {insp.notes && (
                        <p className="text-[11px] text-slate-600 italic mt-1">
                          &ldquo;{insp.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              {isAdmin && (
                <button
                  onClick={() => {
                    const h = selectedHiveForDetail;
                    setSelectedHiveForDetail(null);
                    handleOpenEdit(h);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono transition-colors cursor-pointer"
                >
                  Edit Hive Details
                </button>
              )}
              <button
                onClick={() => setSelectedHiveForDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs font-mono transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Hive Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingHive ? `Edit ${editingHive.number}` : 'Add New Hive Colony'}
          subtitle="Configure operational hive number, location, queen, and source"
          maxWidth="md"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                Hive Number / Label *
              </label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="e.g. Hive 07 (Meadow)"
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Location / Yard
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. South Yard - Row 2"
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Date Established
                </label>
                <input
                  type="date"
                  value={formData.date_established}
                  onChange={(e) =>
                    setFormData({ ...formData, date_established: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none font-mono transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Colony Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value as HiveSource })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none capitalize"
                >
                  {HIVE_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Colony Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as HiveStatus })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none capitalize"
                >
                  {HIVE_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                Assigned Queen (Optional)
              </label>
              <select
                value={formData.queen_id}
                onChange={(e) => setFormData({ ...formData, queen_id: e.target.value })}
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
              >
                <option value="">(None / Unknown Queen)</option>
                {queens.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.label} ({q.status}) - {q.breed || q.origin}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                Hive Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Hardware specs, equipment notes, health peculiarities..."
                rows={3}
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
                Save Hive
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
