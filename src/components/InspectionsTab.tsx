import React, { useState } from 'react';
import {
  Inspection,
  Hive,
  QueenHealth,
  BroodPattern,
  Temperament,
  FoodStores,
  DroneObservation,
  MiteTreatment,
  SwarmHistory,
  VarroaWashResult,
  QUEEN_HEALTH_OPTIONS,
  BROOD_PATTERNS,
  TEMPERAMENTS,
  FOOD_STORES,
  DRONE_OPTIONS,
  MITE_TREATMENTS,
  SWARM_HISTORIES,
  VARROA_WASH_OPTIONS,
  Account,
} from '../types';
import { today, uid } from '../storage/db';
import { StatusChip } from './StatusChip';
import { Modal } from './Modal';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  ClipboardCheck,
  Calendar,
  AlertTriangle,
  User,
  Sparkles,
  Bug,
  ShieldAlert,
  Flame,
  Award,
  Layers,
} from 'lucide-react';

interface InspectionsTabProps {
  inspections: Inspection[];
  hives: Hive[];
  session: Account;
  isAdmin: boolean;
  onSaveInspection: (inspection: Inspection) => void;
  onDeleteInspection: (inspectionId: string) => void;
  preselectedHiveId?: string | null;
  onClearPreselectedHive?: () => void;
}

export const InspectionsTab: React.FC<InspectionsTabProps> = ({
  inspections,
  hives,
  session,
  isAdmin,
  onSaveInspection,
  onDeleteInspection,
  preselectedHiveId,
  onClearPreselectedHive,
}) => {
  const [selectedHiveFilter, setSelectedHiveFilter] = useState<string>(
    preselectedHiveId || 'all'
  );
  const [search, setSearch] = useState('');
  const [seasonEndingFilter, setSeasonEndingFilter] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);

  // Sync if preselected hive changes
  React.useEffect(() => {
    if (preselectedHiveId) {
      setSelectedHiveFilter(preselectedHiveId);
      handleOpenAdd(preselectedHiveId);
      if (onClearPreselectedHive) onClearPreselectedHive();
    }
  }, [preselectedHiveId]);

  const hiveLookup = React.useMemo(() => {
    const map: Record<string, Hive> = {};
    for (const h of hives) map[h.id] = h;
    return map;
  }, [hives]);

  // Form state
  const [formData, setFormData] = useState({
    hive_id: hives[0]?.id || '',
    date: today(),
    queen_seen: true,
    queen_health: 'good' as QueenHealth,
    eggs_seen: true,
    brood_frames_count: 5,
    brood_pattern: 'good' as BroodPattern,
    drone_status: 'None' as DroneObservation,
    mite_treatment: 'None' as MiteTreatment,
    swarming_history: 'None / No Swarm Signs' as SwarmHistory,
    varroa_wash_result: 'Not Tested' as VarroaWashResult,
    temperament: 'calm' as Temperament,
    food_stores: 'adequate' as FoodStores,
    extra_queens_seen: 0,
    pests_disease: '',
    action_taken: '',
    inspector: session.name,
    notes: '',
    is_season_ending: false,
    honey_harvested_lbs: 0,
    season_conclusion_notes: '',
  });

  const filteredInspections = inspections
    .filter((insp) => {
      if (selectedHiveFilter !== 'all' && insp.hive_id !== selectedHiveFilter)
        return false;
      if (seasonEndingFilter !== null && Boolean(insp.is_season_ending) !== seasonEndingFilter)
        return false;
      if (!search) return true;
      const q = search.toLowerCase();
      const hive = hiveLookup[insp.hive_id];
      return (
        (hive && hive.number.toLowerCase().includes(q)) ||
        (insp.inspector && insp.inspector.toLowerCase().includes(q)) ||
        (insp.notes && insp.notes.toLowerCase().includes(q)) ||
        (insp.action_taken && insp.action_taken.toLowerCase().includes(q)) ||
        (insp.pests_disease && insp.pests_disease.toLowerCase().includes(q)) ||
        (insp.drone_status && insp.drone_status.toLowerCase().includes(q)) ||
        (insp.mite_treatment && insp.mite_treatment.toLowerCase().includes(q)) ||
        (insp.swarming_history && insp.swarming_history.toLowerCase().includes(q)) ||
        (insp.varroa_wash_result && insp.varroa_wash_result.toLowerCase().includes(q)) ||
        (insp.season_conclusion_notes && insp.season_conclusion_notes.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalHoneyHarvested = inspections.reduce(
    (acc, i) => acc + (i.honey_harvested_lbs || 0),
    0
  );

  const seasonEndingCount = inspections.filter((i) => i.is_season_ending).length;

  const handleOpenAdd = (defaultHiveId?: string) => {
    setEditingInspection(null);
    setFormData({
      hive_id: defaultHiveId || (hives[0] ? hives[0].id : ''),
      date: today(),
      queen_seen: true,
      queen_health: 'good',
      eggs_seen: true,
      brood_frames_count: 5,
      brood_pattern: 'good',
      drone_status: 'None',
      mite_treatment: 'None',
      swarming_history: 'None / No Swarm Signs',
      varroa_wash_result: 'Not Tested',
      temperament: 'calm',
      food_stores: 'adequate',
      extra_queens_seen: 0,
      pests_disease: '',
      action_taken: '',
      inspector: session.name,
      notes: '',
      is_season_ending: false,
      honey_harvested_lbs: 0,
      season_conclusion_notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (insp: Inspection) => {
    setEditingInspection(insp);
    setFormData({
      hive_id: insp.hive_id,
      date: insp.date,
      queen_seen: insp.queen_seen,
      queen_health: insp.queen_health,
      eggs_seen: insp.eggs_seen,
      brood_frames_count: typeof insp.brood_frames_count === 'number' ? insp.brood_frames_count : 5,
      brood_pattern: insp.brood_pattern,
      drone_status: insp.drone_status || 'None',
      mite_treatment: insp.mite_treatment || 'None',
      swarming_history: insp.swarming_history || 'None / No Swarm Signs',
      varroa_wash_result: insp.varroa_wash_result || 'Not Tested',
      temperament: insp.temperament,
      food_stores: insp.food_stores,
      extra_queens_seen: insp.extra_queens_seen || 0,
      pests_disease: insp.pests_disease || '',
      action_taken: insp.action_taken || '',
      inspector: insp.inspector || session.name,
      notes: insp.notes || '',
      is_season_ending: Boolean(insp.is_season_ending),
      honey_harvested_lbs: insp.honey_harvested_lbs || 0,
      season_conclusion_notes: insp.season_conclusion_notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (insp: Inspection) => {
    const hive = hiveLookup[insp.hive_id];
    if (
      window.confirm(
        `Delete inspection record for ${hive ? hive.number : 'hive'} on ${insp.date}?`
      )
    ) {
      onDeleteInspection(insp.id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hive_id) {
      alert('Please select a valid hive');
      return;
    }

    const updated: Inspection = {
      id: editingInspection ? editingInspection.id : uid(),
      hive_id: formData.hive_id,
      date: formData.date,
      queen_seen: Boolean(formData.queen_seen),
      queen_health: formData.queen_health,
      eggs_seen: Boolean(formData.eggs_seen),
      brood_frames_count: Number(formData.brood_frames_count) || 0,
      brood_pattern: formData.brood_pattern,
      drone_status: formData.drone_status,
      mite_treatment: formData.mite_treatment,
      swarming_history: formData.swarming_history,
      varroa_wash_result: formData.varroa_wash_result,
      temperament: formData.temperament,
      food_stores: formData.food_stores,
      extra_queens_seen: Number(formData.extra_queens_seen) || 0,
      pests_disease: formData.pests_disease.trim(),
      action_taken: formData.action_taken.trim(),
      inspector: formData.inspector.trim(),
      notes: formData.notes.trim(),
      is_season_ending: Boolean(formData.is_season_ending),
      honey_harvested_lbs: Number(formData.honey_harvested_lbs) || 0,
      season_conclusion_notes: formData.season_conclusion_notes.trim(),
    };

    onSaveInspection(updated);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            Hive Inspection Logs
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1">
            {inspections.length} recorded inspections · {totalHoneyHarvested} lbs total honey recorded
          </p>
        </div>

        {hives.length > 0 && (
          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-sm font-mono uppercase tracking-wider transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Log Inspection
          </button>
        )}
      </div>

      {/* Honey Harvest & Summary Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Total Inspections
          </span>
          <span className="font-display text-xl font-bold text-slate-900 mt-2">
            {inspections.length}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Season Harvest
          </span>
          <span className="font-display text-xl font-bold text-amber-600 mt-2">
            {totalHoneyHarvested} lbs
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Season Finale Audits
          </span>
          <span className="font-display text-xl font-bold text-indigo-600 mt-2">
            {seasonEndingCount} colonies
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Varroa Screened
          </span>
          <span className="font-display text-xl font-bold text-emerald-600 mt-2">
            {inspections.filter((i) => i.varroa_wash_result && i.varroa_wash_result !== 'Not Tested').length} logs
          </span>
        </div>
      </div>

      {hives.length === 0 ? (
        <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500 font-mono shadow-xs">
          Add at least one hive colony first before logging inspections.
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-400" />
                <label className="text-xs font-mono text-slate-600 uppercase font-medium">
                  Colony:
                </label>
                <select
                  value={selectedHiveFilter}
                  onChange={(e) => setSelectedHiveFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none transition-colors"
                >
                  <option value="all">All Hives ({inspections.length} logs)</option>
                  {hives.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.number}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season Ending Filter Toggle */}
              <button
                type="button"
                onClick={() =>
                  setSeasonEndingFilter(
                    seasonEndingFilter === null
                      ? true
                      : seasonEndingFilter === true
                      ? false
                      : null
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                  seasonEndingFilter === true
                    ? 'bg-amber-500 text-white border-amber-600 font-semibold'
                    : seasonEndingFilter === false
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {seasonEndingFilter === true
                  ? '★ Season Ending Only'
                  : seasonEndingFilter === false
                  ? 'Weekly Routine Only'
                  : 'All Types'}
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search brood, treatment, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none font-mono transition-colors"
              />
            </div>
          </div>

          {/* Inspections Feed / Cards */}
          <div className="space-y-3">
            {filteredInspections.length === 0 ? (
              <div className="p-12 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-400 font-mono shadow-xs">
                No inspection logs found matching your filters.
              </div>
            ) : (
              filteredInspections.map((insp) => {
                const hive = hiveLookup[insp.hive_id];

                return (
                  <div
                    key={insp.id}
                    className={`p-4 rounded-xl bg-white border shadow-xs hover:border-slate-300 transition-colors ${
                      insp.is_season_ending
                        ? 'border-amber-300 ring-1 ring-amber-200/60'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Top Row: Hive name, date, season badge, and actions */}
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-indigo-600 font-bold text-sm">⬡</span>
                        <span className="font-semibold text-sm text-slate-900">
                          {hive ? hive.number : 'Unknown Hive'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          · {insp.date}
                        </span>
                        {insp.is_season_ending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-300">
                            <Award className="w-3 h-3 text-amber-600" />
                            Season Ending Audit
                            {insp.honey_harvested_lbs > 0 && ` (${insp.honey_harvested_lbs} lbs)`}
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(insp)}
                            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                            title="Edit inspection"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(insp)}
                            className="p-1.5 rounded-md bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                            title="Delete inspection"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Status Badges Row */}
                    <div className="flex items-center gap-2 pt-3 flex-wrap">
                      <StatusChip
                        label={insp.queen_seen ? 'Queen Seen' : 'Queen Not Seen'}
                        tone={insp.queen_seen ? 'good' : 'bad'}
                        size="sm"
                      />
                      <StatusChip
                        label={`Health: ${insp.queen_health}`}
                        tone={
                          insp.queen_health === 'good'
                            ? 'good'
                            : insp.queen_health === 'poor'
                            ? 'bad'
                            : 'warn'
                        }
                        size="sm"
                      />
                      <StatusChip
                        label={insp.eggs_seen ? 'Eggs Seen' : 'No Eggs'}
                        tone={insp.eggs_seen ? 'good' : 'warn'}
                        size="sm"
                      />
                      {/* Frames of Brood */}
                      <StatusChip
                        label={`${insp.brood_frames_count ?? 0} Frames Brood (${insp.brood_pattern})`}
                        tone={(insp.brood_frames_count ?? 0) > 0 ? 'good' : 'bad'}
                        size="sm"
                      />
                      {/* Drones */}
                      {insp.drone_status && insp.drone_status !== 'None' && (
                        <StatusChip
                          label={`Drones: ${insp.drone_status}`}
                          tone="neutral"
                          size="sm"
                        />
                      )}
                      {/* Swarming History */}
                      {insp.swarming_history && insp.swarming_history !== 'None / No Swarm Signs' && (
                        <StatusChip
                          label={`Swarm Hx: ${insp.swarming_history}`}
                          tone="warn"
                          size="sm"
                        />
                      )}
                      {/* Varroa Wash Result */}
                      {insp.varroa_wash_result && insp.varroa_wash_result !== 'Not Tested' && (
                        <StatusChip
                          label={`Varroa Wash: ${insp.varroa_wash_result}`}
                          tone={
                            insp.varroa_wash_result.includes('0 Mites')
                              ? 'good'
                              : insp.varroa_wash_result.includes('1-2 Mites')
                              ? 'neutral'
                              : insp.varroa_wash_result.includes('3-5 Mites')
                              ? 'warn'
                              : 'bad'
                          }
                          size="sm"
                        />
                      )}
                      {/* Mite Treatment */}
                      {insp.mite_treatment && insp.mite_treatment !== 'None' && (
                        <StatusChip
                          label={`Treatment: ${insp.mite_treatment}`}
                          tone="neutral"
                          size="sm"
                        />
                      )}
                      <StatusChip
                        label={`Stores: ${insp.food_stores}`}
                        tone="dim"
                        size="sm"
                      />
                      <StatusChip
                        label={`Temper: ${insp.temperament}`}
                        tone={insp.temperament === 'aggressive' ? 'bad' : 'dim'}
                        size="sm"
                      />
                    </div>

                    {/* Inspection Details / Observations */}
                    <div className="mt-3 space-y-1.5 text-xs">
                      {insp.pests_disease && (
                        <div className="text-rose-600 flex items-start gap-1.5 font-mono">
                          <span className="text-slate-400 shrink-0 font-medium">Pests/Disease:</span>
                          <span>{insp.pests_disease}</span>
                        </div>
                      )}
                      {insp.action_taken && (
                        <div className="text-indigo-700 flex items-start gap-1.5 font-mono">
                          <span className="text-slate-400 shrink-0 font-medium">Action Taken:</span>
                          <span>{insp.action_taken}</span>
                        </div>
                      )}
                      {insp.notes && (
                        <p className="text-slate-700 pt-1 leading-relaxed italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          &ldquo;{insp.notes}&rdquo;
                        </p>
                      )}

                      {/* Season Ending Specific Card Section */}
                      {insp.is_season_ending && (
                        <div className="mt-2 p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-semibold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-amber-700" />
                              Season Ending Summary &amp; Honey Harvest
                            </span>
                            <span className="font-bold text-amber-800 text-sm">
                              {insp.honey_harvested_lbs || 0} lbs Harvested
                            </span>
                          </div>
                          {insp.season_conclusion_notes && (
                            <p className="text-amber-900/90 leading-relaxed italic pt-0.5">
                              {insp.season_conclusion_notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Inspector */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        Inspector: <strong className="text-slate-700 font-semibold">{insp.inspector || 'Staff'}</strong>
                      </span>
                      <span>Recorded in Log</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Add / Edit Inspection Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingInspection ? 'Edit Inspection Record' : 'Log Weekly Hive Inspection'}
          subtitle="Record brood frames, drones, varroa wash, mite treatment, swarm history & season finale"
          maxWidth="lg"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {/* Hive and Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Hive Colony *
                </label>
                <select
                  value={formData.hive_id}
                  onChange={(e) => setFormData({ ...formData, hive_id: e.target.value })}
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

              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Inspection Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none font-mono"
                  required
                />
              </div>
            </div>

            {/* Queen & Eggs Seen */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Queen Spotted?
                </label>
                <select
                  value={formData.queen_seen ? 'yes' : 'no'}
                  onChange={(e) =>
                    setFormData({ ...formData, queen_seen: e.target.value === 'yes' })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                >
                  <option value="yes">Yes - Queen Observed</option>
                  <option value="no">No - Not Seen</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Eggs / Young Larvae Seen?
                </label>
                <select
                  value={formData.eggs_seen ? 'yes' : 'no'}
                  onChange={(e) =>
                    setFormData({ ...formData, eggs_seen: e.target.value === 'yes' })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                >
                  <option value="yes">Yes - Standing Eggs Present</option>
                  <option value="no">No - No Fresh Eggs</option>
                </select>
              </div>
            </div>

            {/* Brood & Queen Health */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* How many frames of brood */}
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Frames of Brood (Count) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.brood_frames_count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      brood_frames_count: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  placeholder="e.g. 6"
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-1.5 text-slate-900 outline-none font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Brood Pattern
                </label>
                <select
                  value={formData.brood_pattern}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      brood_pattern: e.target.value as BroodPattern,
                    })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-1.5 text-slate-900 outline-none capitalize"
                >
                  {BROOD_PATTERNS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Queen Health
                </label>
                <select
                  value={formData.queen_health}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      queen_health: e.target.value as QueenHealth,
                    })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-1.5 text-slate-900 outline-none capitalize"
                >
                  {QUEEN_HEALTH_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Drones & Swarm History */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Drone drop down */}
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Drone Status (Dropdown)
                </label>
                <select
                  value={formData.drone_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      drone_status: e.target.value as DroneObservation,
                    })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                >
                  {DRONE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hx of swarming drop down */}
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Hx of Swarming (Swarm History)
                </label>
                <select
                  value={formData.swarming_history}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      swarming_history: e.target.value as SwarmHistory,
                    })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                >
                  {SWARM_HISTORIES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Varroa Wash & Mite Treatment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              {/* Varroa wash results */}
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Varroa Wash Results
                </label>
                <select
                  value={formData.varroa_wash_result}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      varroa_wash_result: e.target.value as VarroaWashResult,
                    })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                >
                  {VARROA_WASH_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mite treatment dropdown */}
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Mite Treatment Applied
                </label>
                <select
                  value={formData.mite_treatment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mite_treatment: e.target.value as MiteTreatment,
                    })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                >
                  {MITE_TREATMENTS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Temperament & Food Stores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Colony Temperament
                </label>
                <select
                  value={formData.temperament}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      temperament: e.target.value as Temperament,
                    })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-1.5 text-slate-900 outline-none capitalize"
                >
                  {TEMPERAMENTS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Food &amp; Honey Stores
                </label>
                <select
                  value={formData.food_stores}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      food_stores: e.target.value as FoodStores,
                    })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-1.5 text-slate-900 outline-none capitalize"
                >
                  {FOOD_STORES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pests / Disease & Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Other Pests / Disease Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chalkbrood, wax moth, beetle traps..."
                  value={formData.pests_disease}
                  onChange={(e) =>
                    setFormData({ ...formData, pests_disease: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                  Action Taken
                </label>
                <input
                  type="text"
                  placeholder="e.g. Added super, fed syrup, reversed boxes..."
                  value={formData.action_taken}
                  onChange={(e) =>
                    setFormData({ ...formData, action_taken: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* SEASON ENDING INSPECTION SECTION */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_season_ending}
                    onChange={(e) =>
                      setFormData({ ...formData, is_season_ending: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-amber-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    Season Ending Inspection Section
                  </span>
                </label>
                <span className="text-[10px] font-mono text-amber-700">
                  {formData.is_season_ending ? 'Active' : 'Optional'}
                </span>
              </div>

              {formData.is_season_ending && (
                <div className="space-y-3 pt-2 border-t border-amber-200/80">
                  <div>
                    <label className="block font-mono font-semibold text-amber-950 uppercase tracking-wider mb-1">
                      Approx. Lbs of Honey Harvested
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="e.g. 45"
                      value={formData.honey_harvested_lbs}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          honey_harvested_lbs: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white border border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-slate-900 outline-none font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-mono font-semibold text-amber-950 uppercase tracking-wider mb-1">
                      Season Ending Conclusion Notes / Winterization Summary
                    </label>
                    <textarea
                      value={formData.season_conclusion_notes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          season_conclusion_notes: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="Summary of annual colony performance, honey yields, winter cluster strength, mouse guards installed, and winter feeding status..."
                      className="w-full bg-white border border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Inspector Name */}
            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                Inspector Name
              </label>
              <input
                type="text"
                value={formData.inspector}
                onChange={(e) =>
                  setFormData({ ...formData, inspector: e.target.value })
                }
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
              />
            </div>

            {/* Detailed Notes */}
            <div>
              <label className="block font-mono font-medium text-slate-700 uppercase tracking-wider mb-1">
                General Notes &amp; Observations
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
                placeholder="Colony vigor, behavior notes, equipment condition..."
                className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
              />
            </div>

            {/* Auto status notice */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-mono leading-relaxed">
              Auto-rule: If no queen &amp; no eggs are seen, hive will automatically be flagged as <strong>Queenless</strong>. If queen is seen on a queenless hive, status will reset to <strong>Queen Right</strong>.
            </div>

            {/* Buttons */}
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
                Save Inspection
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
