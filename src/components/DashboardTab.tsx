import React from 'react';
import {
  Hive,
  Inspection,
  Queen,
  Split,
  Sale,
  Account,
} from '../types';
import { daysAgo } from '../storage/db';
import { HexagonTile } from './HexagonTile';
import { StatusChip } from './StatusChip';
import {
  AlertTriangle,
  PlusCircle,
  ClipboardCheck,
  Crown,
  Boxes,
  DollarSign,
  Calendar,
  Sparkles,
  Search,
} from 'lucide-react';

interface DashboardTabProps {
  hives: Hive[];
  inspections: Inspection[];
  queens: Queen[];
  splits: Split[];
  sales: Sale[];
  session: Account;
  isAdmin: boolean;
  onSelectHive: (hive: Hive) => void;
  onAddInspectionForHive: (hiveId: string) => void;
  onAddHive: () => void;
  onAddInspection: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  hives,
  inspections,
  queens,
  splits,
  sales,
  onSelectHive,
  onAddInspectionForHive,
  onAddHive,
  onAddInspection,
}) => {
  const [filterQuery, setFilterQuery] = React.useState('');

  // Map last inspection date per hive
  const lastInspectionMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const insp of inspections) {
      if (!map[insp.hive_id] || insp.date > map[insp.hive_id]) {
        map[insp.hive_id] = insp.date;
      }
    }
    return map;
  }, [inspections]);

  // Queens lookup map
  const queenLookup = React.useMemo(() => {
    const map: Record<string, Queen> = {};
    for (const q of queens) {
      map[q.id] = q;
    }
    return map;
  }, [queens]);

  // Computed metrics
  const activeHives = hives.filter(
    (h) => h.status !== 'sold' && h.status !== 'merged' && h.status !== 'dead'
  );

  const needsInspection = activeHives.filter(
    (h) => daysAgo(lastInspectionMap[h.id]) > 7
  );

  const queenlessHives = hives.filter((h) => h.status === 'queenless');
  const spareQueens = queens.filter((q) => q.status === 'spare');

  const splitsRevenue = splits.reduce(
    (acc, s) => (s.outcome === 'sold' ? acc + (s.price || 0) : acc),
    0
  );
  const salesRevenue = sales.reduce((acc, s) => acc + (s.price || 0), 0);
  const totalRevenue = splitsRevenue + salesRevenue;

  // Filtered hives for status grid
  const filteredHives = hives.filter((h) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const qObj = queenLookup[h.queen_id];
    return (
      h.number.toLowerCase().includes(q) ||
      h.location.toLowerCase().includes(q) ||
      h.status.toLowerCase().includes(q) ||
      (qObj && qObj.label.toLowerCase().includes(q))
    );
  });

  // Recent inspections sorted descending
  const recentInspections = [...inspections]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const hiveLookup = React.useMemo(() => {
    const map: Record<string, Hive> = {};
    for (const h of hives) {
      map[h.id] = h;
    }
    return map;
  }, [hives]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            Operation Overview
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1">
            {hives.length} hive record{hives.length === 1 ? '' : 's'} on file · scale from 1 to 100+ colonies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddInspection}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold py-2 px-3.5 rounded-lg shadow-sm font-mono uppercase tracking-wider transition-all cursor-pointer"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            + Log Inspection
          </button>
          <button
            onClick={onAddHive}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 px-3.5 rounded-lg border border-slate-200 shadow-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
            + Add Hive
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Active Hives */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Active Hives
            </span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-emerald-600">
              {activeHives.length}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              of {hives.length} total
            </span>
          </div>
        </div>

        {/* Need Inspection */}
        <div
          className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between ${
            needsInspection.length > 0
              ? 'bg-amber-50/60 border-amber-200'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Need Inspection
            </span>
            <AlertTriangle
              className={`w-4 h-4 ${
                needsInspection.length > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span
              className={`font-display text-2xl font-bold ${
                needsInspection.length > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {needsInspection.length}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">&gt; 7 days</span>
          </div>
        </div>

        {/* Queenless */}
        <div
          className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between ${
            queenlessHives.length > 0
              ? 'bg-rose-50/60 border-rose-200'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Queenless
            </span>
            <Crown
              className={`w-4 h-4 ${
                queenlessHives.length > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span
              className={`font-display text-2xl font-bold ${
                queenlessHives.length > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {queenlessHives.length}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {queenlessHives.length > 0 ? 'urgent check' : 'all queenright'}
            </span>
          </div>
        </div>

        {/* Spare Queens */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Spare Queens
            </span>
            <Crown className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-sky-600">
              {spareQueens.length}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">in bank</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Splits & Sales
            </span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-indigo-600">
              ${totalRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">realized</span>
          </div>
        </div>
      </div>

      {/* Urgent Inspection Alert Banner */}
      {needsInspection.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-amber-900 font-mono">
                  ⚠ {needsInspection.length} colony{needsInspection.length === 1 ? '' : 'ies'} overdue for weekly inspection
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Overdue colonies require brood nest check, queen health assessment, and pest/varroa check.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {needsInspection.slice(0, 4).map((h) => (
                <button
                  key={h.id}
                  onClick={() => onAddInspectionForHive(h.id)}
                  className="px-2.5 py-1 rounded bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-mono font-medium shadow-xs transition-colors cursor-pointer"
                >
                  Inspect {h.number}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hive Status Honeycomb Grid */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Hive Status Grid
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Each hexagon = one hive. Badge shows days since last inspection (e.g. 2D, 8D, NO QUEEN).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search filter */}
            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search hive / location..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none font-mono transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 pt-3 pb-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Inspected &le; 7d
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            &gt; 7d / New
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Queenless / Dead
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            Sold / Merged
          </span>
        </div>

        {/* Hex Grid Content */}
        {filteredHives.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-mono">
            No hive records found matching &quot;{filterQuery}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 pt-2">
            {filteredHives.map((h) => {
              const days = daysAgo(lastInspectionMap[h.id]);
              const q = queenLookup[h.queen_id];
              return (
                <HexagonTile
                  key={h.id}
                  hive={h}
                  daysSinceInspection={days}
                  queenName={q?.label}
                  onClick={() => onSelectHive(h)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Lower Dashboard: Recent Inspections Feed & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inspections (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="font-display font-bold text-base text-slate-900">
                Recent Inspections
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Last {recentInspections.length} recorded
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-1">
            {recentInspections.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-mono">
                No inspections recorded yet.
              </div>
            ) : (
              recentInspections.map((insp) => {
                const hive = hiveLookup[insp.hive_id];
                return (
                  <div key={insp.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">
                          {hive ? hive.number : 'Unknown Hive'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          · {insp.date} ({daysAgo(insp.date)}d ago)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <StatusChip
                          label={insp.queen_seen ? 'Queen Seen' : 'No Queen'}
                          tone={insp.queen_seen ? 'good' : 'bad'}
                          size="sm"
                        />
                        <StatusChip
                          label={insp.eggs_seen ? 'Eggs Seen' : 'No Eggs'}
                          tone={insp.eggs_seen ? 'good' : 'warn'}
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
                      </div>
                      {insp.notes && (
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                          {insp.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 block">
                        by {insp.inspector || 'Staff'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Apiary Reference & Guide */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-display font-bold text-base text-slate-900">
                Apiary Best Practices
              </h3>
            </div>
            <div className="space-y-3 mt-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <strong className="text-indigo-700 block font-mono text-[11px]">
                  7-Day Inspection Cycle
                </strong>
                Regular inspection prevents swarming, detects emergency queen loss, and catches early mite spikes.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <strong className="text-emerald-700 block font-mono text-[11px]">
                  Queen Banks & Spares
                </strong>
                Keep 1-2 spare mated queens per 10 production hives to quickly resolve queenless colonies without losing a brood cycle.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <strong className="text-sky-700 block font-mono text-[11px]">
                  Automatic Hive Splits
                </strong>
                Logging a split with outcome &quot;kept&quot; automatically adds the new colony to your operational hive roster.
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>ApiaryOps Protocol</span>
            <span>v1.2 Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
