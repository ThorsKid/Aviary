import React, { useState } from 'react';
import {
  Split,
  Sale,
  Hive,
  Queen,
  SplitOutcome,
} from '../types';
import { today, uid } from '../storage/db';
import { StatusChip } from './StatusChip';
import { Modal } from './Modal';
import {
  GitFork,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Boxes,
} from 'lucide-react';

interface SplitsTabProps {
  splits: Split[];
  sales: Sale[];
  hives: Hive[];
  queens: Queen[];
  isAdmin: boolean;
  onSaveSplit: (split: Split) => void;
  onDeleteSplit: (splitId: string) => void;
  onSaveSale: (sale: Sale) => void;
  onDeleteSale: (saleId: string) => void;
}

export const SplitsTab: React.FC<SplitsTabProps> = ({
  splits,
  sales,
  hives,
  queens,
  isAdmin,
  onSaveSplit,
  onDeleteSplit,
  onSaveSale,
  onDeleteSale,
}) => {
  // Modal states
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [editingSplit, setEditingSplit] = useState<Split | null>(null);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const hiveLookup = React.useMemo(() => {
    const map: Record<string, Hive> = {};
    for (const h of hives) map[h.id] = h;
    return map;
  }, [hives]);

  const queenLookup = React.useMemo(() => {
    const map: Record<string, Queen> = {};
    for (const q of queens) map[q.id] = q;
    return map;
  }, [queens]);

  // Financial tallies
  const splitSoldRevenue = splits.reduce(
    (acc, s) => (s.outcome === 'sold' ? acc + (s.price || 0) : acc),
    0
  );
  const queenSalesRevenue = sales.reduce((acc, s) => acc + (s.price || 0), 0);
  const totalRevenue = splitSoldRevenue + queenSalesRevenue;

  // Split form data
  const [splitForm, setSplitForm] = useState({
    parent_hive_id: hives[0]?.id || '',
    date: today(),
    outcome: 'kept' as SplitOutcome,
    new_hive_number: '',
    buyer: '',
    price: 0,
    notes: '',
  });

  // Sale form data
  const [saleForm, setSaleForm] = useState({
    queen_id: '',
    description: '',
    date: today(),
    buyer: '',
    price: 0,
    notes: '',
  });

  const handleOpenAddSplit = () => {
    setEditingSplit(null);
    setSplitForm({
      parent_hive_id: hives[0]?.id || '',
      date: today(),
      outcome: 'kept',
      new_hive_number: '',
      buyer: '',
      price: 0,
      notes: '',
    });
    setIsSplitModalOpen(true);
  };

  const handleOpenEditSplit = (s: Split) => {
    setEditingSplit(s);
    setSplitForm({
      parent_hive_id: s.parent_hive_id,
      date: s.date,
      outcome: s.outcome,
      new_hive_number: s.new_hive_number || '',
      buyer: s.buyer || '',
      price: s.price || 0,
      notes: s.notes || '',
    });
    setIsSplitModalOpen(true);
  };

  const handleDeleteSplit = (s: Split) => {
    const parent = hiveLookup[s.parent_hive_id];
    if (
      window.confirm(
        `Delete split record from ${parent ? parent.number : 'hive'} on ${s.date}?`
      )
    ) {
      onDeleteSplit(s.id);
    }
  };

  const handleSplitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!splitForm.parent_hive_id) return;

    const updated: Split = {
      id: editingSplit ? editingSplit.id : uid(),
      parent_hive_id: splitForm.parent_hive_id,
      date: splitForm.date,
      outcome: splitForm.outcome,
      new_hive_number: splitForm.new_hive_number.trim(),
      buyer: splitForm.buyer.trim(),
      price: Number(splitForm.price) || 0,
      notes: splitForm.notes.trim(),
    };

    onSaveSplit(updated);
    setIsSplitModalOpen(false);
  };

  const handleOpenAddSale = () => {
    setEditingSale(null);
    setSaleForm({
      queen_id: '',
      description: 'Mated Queen',
      date: today(),
      buyer: '',
      price: 45,
      notes: '',
    });
    setIsSaleModalOpen(true);
  };

  const handleOpenEditSale = (s: Sale) => {
    setEditingSale(s);
    setSaleForm({
      queen_id: s.queen_id || '',
      description: s.description || '',
      date: s.date,
      buyer: s.buyer || '',
      price: s.price || 0,
      notes: s.notes || '',
    });
    setIsSaleModalOpen(true);
  };

  const handleDeleteSale = (s: Sale) => {
    if (window.confirm(`Delete queen sale on ${s.date} for $${s.price}?`)) {
      onDeleteSale(s.id);
    }
  };

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: Sale = {
      id: editingSale ? editingSale.id : uid(),
      queen_id: saleForm.queen_id,
      description: saleForm.description.trim(),
      date: saleForm.date,
      buyer: saleForm.buyer.trim(),
      price: Number(saleForm.price) || 0,
      notes: saleForm.notes.trim(),
    };

    onSaveSale(updated);
    setIsSaleModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            Splits &amp; Queen Sales
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1">
            Track hive expansions, nuc colony sales, and standalone mated queen sales
          </p>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Splits Sold Revenue
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-slate-900">
              ${splitSoldRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {splits.filter((s) => s.outcome === 'sold').length} nucs sold
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Queen Sales Revenue
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-slate-900">
              ${queenSalesRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {sales.length} queens sold
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-700 font-semibold flex items-center justify-between">
            <span>Total Realized Revenue</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-indigo-950">
              ${totalRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-indigo-600/70 font-mono">
              {splits.length} splits total
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: SPLIT HIVES */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-indigo-600" />
            <h3 className="font-display font-bold text-base text-slate-900">
              Colony Splits ({splits.length})
            </h3>
          </div>

          {isAdmin && hives.length > 0 && (
            <button
              onClick={handleOpenAddSplit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              + Log Split
            </button>
          )}
        </div>

        {splits.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono">
            No splits logged yet. Log a split to multiply your apiary colonies or track nuc sales.
          </div>
        ) : (
          <div className="space-y-3">
            {splits
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((s) => {
                const parent = hiveLookup[s.parent_hive_id];

                return (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">
                          From: {parent ? parent.number : 'Unknown Hive'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          · {s.date}
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditSplit(s)}
                            className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                            title="Edit Split"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSplit(s)}
                            className="p-1.5 rounded-md bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                            title="Delete Split"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2.5 flex-wrap">
                      <StatusChip
                        label={s.outcome === 'kept' ? 'Kept in Yard' : 'Sold Nuc'}
                        tone={s.outcome === 'kept' ? 'good' : 'warn'}
                        size="sm"
                      />
                      {s.outcome === 'kept' && s.new_hive_number && (
                        <StatusChip
                          label={`→ ${s.new_hive_number}`}
                          tone="neutral"
                          size="sm"
                        />
                      )}
                      {s.outcome === 'sold' && (
                        <>
                          <StatusChip
                            label={`Buyer: ${s.buyer || 'Direct'}`}
                            tone="dim"
                            size="sm"
                          />
                          <StatusChip
                            label={`$${s.price || 0}`}
                            tone="warn"
                            size="sm"
                          />
                        </>
                      )}
                    </div>

                    {s.notes && (
                      <p className="text-xs text-slate-600 mt-2 italic">
                        {s.notes}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* SECTION 2: QUEEN SALES */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
            <h3 className="font-display font-bold text-base text-slate-900">
              Queen Sales ({sales.length})
            </h3>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddSale}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              + Log Queen Sale
            </button>
          )}
        </div>

        {sales.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono">
            No queen sales logged yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sales
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((s) => {
                const q = queenLookup[s.queen_id];
                const queenTitle = q ? q.label : s.description || 'Queen Sale';

                return (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">
                          {queenTitle}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          · {s.date}
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditSale(s)}
                            className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                            title="Edit Sale"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSale(s)}
                            className="p-1.5 rounded-md bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                            title="Delete Sale"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2.5 flex-wrap">
                      <StatusChip
                        label={`Buyer: ${s.buyer || 'Direct Buyer'}`}
                        tone="dim"
                        size="sm"
                      />
                      <StatusChip
                        label={`$${s.price || 0}`}
                        tone="warn"
                        size="sm"
                      />
                    </div>

                    {s.notes && (
                      <p className="text-xs text-slate-600 mt-2 italic">
                        {s.notes}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Split Modal */}
      {isSplitModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsSplitModalOpen(false)}
          title={editingSplit ? 'Edit Split Record' : 'Log Colony Split'}
          subtitle="Record hive split division, kept colony expansion, or nuc sale"
          maxWidth="md"
        >
          <form onSubmit={handleSplitSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                Parent Donor Hive *
              </label>
              <select
                value={splitForm.parent_hive_id}
                onChange={(e) =>
                  setSplitForm({ ...splitForm, parent_hive_id: e.target.value })
                }
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                required
              >
                {hives.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.number} ({h.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Split Date
                </label>
                <input
                  type="date"
                  value={splitForm.date}
                  onChange={(e) =>
                    setSplitForm({ ...splitForm, date: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Outcome
                </label>
                <select
                  value={splitForm.outcome}
                  onChange={(e) =>
                    setSplitForm({
                      ...splitForm,
                      outcome: e.target.value as SplitOutcome,
                    })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                >
                  <option value="kept">Kept in Yard (New Colony)</option>
                  <option value="sold">Sold as Nuc / Starter Hive</option>
                </select>
              </div>
            </div>

            {splitForm.outcome === 'kept' ? (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider">
                  New Hive Label (Auto-created in Hive roster)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hive 08 (Split A)"
                  value={splitForm.new_hive_number}
                  onChange={(e) =>
                    setSplitForm({
                      ...splitForm,
                      new_hive_number: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
                <span className="text-[10px] text-slate-500 font-mono block">
                  Providing a name here automatically registers a new active hive in your apiary list.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                    Buyer Name
                  </label>
                  <input
                    type="text"
                    placeholder="Customer / Apiary"
                    value={splitForm.buyer}
                    onChange={(e) =>
                      setSplitForm({ ...splitForm, buyer: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                    Sale Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 195"
                    value={splitForm.price}
                    onChange={(e) =>
                      setSplitForm({
                        ...splitForm,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                Split Notes &amp; Frame Composition
              </label>
              <textarea
                value={splitForm.notes}
                onChange={(e) =>
                  setSplitForm({ ...splitForm, notes: e.target.value })
                }
                rows={3}
                placeholder="Number of brood frames pulled, queen cell details, honey resources..."
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsSplitModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-mono uppercase tracking-wide transition-colors cursor-pointer"
              >
                Save Split Record
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Queen Sale Modal */}
      {isSaleModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsSaleModalOpen(false)}
          title={editingSale ? 'Edit Queen Sale' : 'Log Mated Queen Sale'}
          subtitle="Record buyer, price, and queen genetics"
          maxWidth="md"
        >
          <form onSubmit={handleSaleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                Linked Queen from Stock (Optional)
              </label>
              <select
                value={saleForm.queen_id}
                onChange={(e) =>
                  setSaleForm({ ...saleForm, queen_id: e.target.value })
                }
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
              >
                <option value="">(None / General Queen Stock)</option>
                {queens.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.label} ({q.status})
                  </option>
                ))}
              </select>
            </div>

            {!saleForm.queen_id && (
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Queen Description / Line
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mated Carniolan Breeder Queen"
                  value={saleForm.description}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, description: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Sale Date
                </label>
                <input
                  type="date"
                  value={saleForm.date}
                  onChange={(e) =>
                    setSaleForm({ ...saleForm, date: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={saleForm.price}
                  onChange={(e) =>
                    setSaleForm({
                      ...saleForm,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                Buyer Name / Apiary
              </label>
              <input
                type="text"
                placeholder="e.g. Sunny Hollow Honey Farm"
                value={saleForm.buyer}
                onChange={(e) =>
                  setSaleForm({ ...saleForm, buyer: e.target.value })
                }
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                Notes
              </label>
              <textarea
                value={saleForm.notes}
                onChange={(e) =>
                  setSaleForm({ ...saleForm, notes: e.target.value })
                }
                rows={3}
                placeholder="Shipping method, marking color, attendant cage details..."
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsSaleModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-mono uppercase tracking-wide transition-colors cursor-pointer"
              >
                Save Queen Sale
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
