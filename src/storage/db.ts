import {
  Account,
  Hive,
  Queen,
  Inspection,
  Split,
  Sale,
} from '../types';

export function uid(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4, 8);
}

export function today(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function daysAgo(dateStr: string | null | undefined): number {
  if (!dateStr) return 999999;
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return 999999;
    const now = new Date();
    const diffTime = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 0 ? 0 : diffDays;
  } catch {
    return 999999;
  }
}

export interface ApiaryDatabaseState {
  accounts: Account[];
  hives: Hive[];
  queens: Queen[];
  inspections: Inspection[];
  splits: Split[];
  sales: Sale[];
}

const STORAGE_KEY = 'apiaryops_desktop_data_v1';

export const SEED_DATA: ApiaryDatabaseState = {
  accounts: [
    {
      id: 'acc-owner',
      name: 'Owner',
      role: 'admin',
      pin: '1234',
    },
    {
      id: 'acc-emp-1',
      name: 'Assistant (Morgan)',
      role: 'employee',
      pin: '5678',
    },
  ],
  queens: [
    {
      id: 'q-1',
      label: 'Carniolan Yellow 2024 #1',
      origin: 'raised',
      hive_id: 'h-1',
      status: 'in-hive',
      date_introduced: '2024-04-12',
      breed: 'Carniolan Survivor F2',
      is_holding: false,
      lineage: 'Carpathian Line Mother #4',
      age: '1 year (Spring 2024)',
      mated_nuc_number: '',
      notes: 'Prolific layer, exceptionally calm, low swarming tendency.',
    },
    {
      id: 'q-2',
      label: 'Italian Cordovan 2024 #2',
      origin: 'purchased',
      hive_id: 'h-2',
      status: 'in-hive',
      date_introduced: '2024-05-18',
      breed: 'Italian Cordovan',
      is_holding: false,
      lineage: 'Kona Golden Breeder Line',
      age: '1 year (Summer 2024)',
      mated_nuc_number: '',
      notes: 'Strong brood cluster, high honey forage vigor.',
    },
    {
      id: 'q-3',
      label: 'Buckfast Blue 2025 #3',
      origin: 'survivor stock',
      hive_id: 'h-3',
      status: 'in-hive',
      date_introduced: '2025-05-02',
      breed: 'Buckfast Hybrid',
      is_holding: false,
      lineage: 'Abbey Survivor B16',
      age: '3 months',
      mated_nuc_number: '',
      notes: 'Selected for mite resistance and hygienic uncapping behavior.',
    },
    {
      id: 'q-4',
      label: 'Saskatraz Green 2025 #4',
      origin: 'purchased',
      hive_id: 'h-4',
      status: 'in-hive',
      date_introduced: '2025-06-10',
      breed: 'Saskatraz Certified',
      is_holding: false,
      lineage: 'Meadow Ridge Saskatraz VSH',
      age: '2 months',
      mated_nuc_number: '',
      notes: 'Fast spring buildup.',
    },
    {
      id: 'q-5',
      label: 'Holding Queen #N1 (Carniolan)',
      origin: 'raised',
      hive_id: '',
      status: 'mated-holding',
      date_introduced: '2025-07-20',
      breed: 'Carniolan Breeder',
      is_holding: true,
      lineage: 'Mother Hive 01 (Orchard Queen Line)',
      age: '3 weeks mated & laying',
      mated_nuc_number: 'Nuc Bank #01',
      notes: 'Laying excellent solid pattern in mating nuc. Ready for introduction or sale.',
    },
    {
      id: 'q-6',
      label: 'Holding Queen #N2 (Buckfast VSH)',
      origin: 'raised',
      hive_id: '',
      status: 'mated-holding',
      date_introduced: '2025-08-01',
      breed: 'Buckfast Hygienic',
      is_holding: true,
      lineage: 'Abbey B16 Breeder Daughter',
      age: '2 weeks laying',
      mated_nuc_number: 'Nuc Bank #02',
      notes: 'Mated nuc 2, confirmed worker brood with eggs and day-4 larvae.',
    },
    {
      id: 'q-7',
      label: 'Spare Buckfast #B3',
      origin: 'raised',
      hive_id: '',
      status: 'spare',
      date_introduced: '2025-08-10',
      breed: 'Buckfast',
      is_holding: false,
      lineage: 'Survivor Stock',
      age: '1 week laying',
      mated_nuc_number: 'Bank Box C',
      notes: 'Spare queen in yard bank.',
    },
    {
      id: 'q-8',
      label: 'Old Queen 2023 #0',
      origin: 'swarm',
      hive_id: '',
      status: 'dead',
      date_introduced: '2023-06-14',
      breed: 'Wild Feral',
      is_holding: false,
      lineage: 'Captured Swarm Mother',
      age: '2 years',
      mated_nuc_number: '',
      notes: 'Superceded in spring 2025.',
    },
  ],
  hives: [
    {
      id: 'h-1',
      number: 'Hive 01 (Orchard)',
      location: 'North Orchard - Row 3',
      date_established: '2024-04-10',
      source: 'Overwintered',
      status: 'Queen Right',
      queen_id: 'q-1',
      notes: 'Double deep 10-frame Langstroth. Top producer with great winter cluster.',
    },
    {
      id: 'h-2',
      number: 'Hive 02 (Meadow)',
      location: 'Wildflower Meadow East',
      date_established: '2024-05-15',
      source: 'Nuc',
      status: 'Queen Right',
      queen_id: 'q-2',
      notes: 'Vigorous nectar forager. Strong honey harvest potential.',
    },
    {
      id: 'h-3',
      number: 'Hive 03 (Hillside)',
      location: 'South Hillside Bench',
      date_established: '2025-05-01',
      source: 'Split',
      status: 'Queen Right',
      queen_id: 'q-3',
      notes: 'Created from Hive 01 spring split. Healthy brood count.',
    },
    {
      id: 'h-4',
      number: 'Hive 04 (Clover)',
      location: 'Clover Field Stand',
      date_established: '2025-06-08',
      source: 'Domestic Swarm',
      status: 'Queen Right',
      queen_id: 'q-4',
      notes: 'Strong population, gentle disposition.',
    },
    {
      id: 'h-5',
      number: 'Hive 05 (Swarm Box)',
      location: 'Perimeter Hedge',
      date_established: '2025-07-12',
      source: 'Captured Swarm',
      status: 'Queenless',
      queen_id: '',
      notes: 'Lost virgin queen after mating flight. Ready for mated holding queen introduction.',
    },
    {
      id: 'h-6',
      number: 'Hive 06 (Riverbank)',
      location: 'Riverbank Station',
      date_established: '2025-05-20',
      source: 'Split',
      status: 'Undetermined',
      queen_id: '',
      notes: 'Emergency cell emerged recently. Status undetermined until next check.',
    },
  ],
  inspections: [
    {
      id: 'insp-1',
      hive_id: 'h-1',
      date: getRecentDate(2),
      queen_seen: true,
      queen_health: 'good',
      eggs_seen: true,
      brood_frames_count: 7,
      brood_pattern: 'good',
      drone_status: 'Live Drones Seen',
      mite_treatment: 'Oxalic Acid Vapor (OAV)',
      swarming_history: 'None / No Swarm Signs',
      varroa_wash_result: '0 Mites (0.0%)',
      temperament: 'calm',
      food_stores: 'full',
      extra_queens_seen: 0,
      pests_disease: 'No varroa seen on wash or bottom board',
      action_taken: 'Added second honey super',
      inspector: 'Owner',
      notes: 'Wall-to-wall capped honey and 7 frames of solid capped brood.',
      is_season_ending: false,
      honey_harvested_lbs: 0,
      season_conclusion_notes: '',
    },
    {
      id: 'insp-2',
      hive_id: 'h-2',
      date: getRecentDate(4),
      queen_seen: true,
      queen_health: 'good',
      eggs_seen: true,
      brood_frames_count: 6,
      brood_pattern: 'good',
      drone_status: 'Drone Brood & Live Drones Seen',
      mite_treatment: 'Formic Pro',
      swarming_history: 'Swarm Cells Built',
      varroa_wash_result: '1-2 Mites (<1.0% - Low)',
      temperament: 'calm',
      food_stores: 'adequate',
      extra_queens_seen: 0,
      pests_disease: 'Low mite drop',
      action_taken: 'Rotated empty frames to outside, knocked down swarm cups',
      inspector: 'Morgan',
      notes: 'Queen spotted on frame 4 center. Good laying density with 6 frames of brood.',
      is_season_ending: false,
      honey_harvested_lbs: 0,
      season_conclusion_notes: '',
    },
    {
      id: 'insp-3',
      hive_id: 'h-3',
      date: getRecentDate(5),
      queen_seen: true,
      queen_health: 'good',
      eggs_seen: true,
      brood_frames_count: 5,
      brood_pattern: 'good',
      drone_status: 'Drone Brood Seen',
      mite_treatment: 'Apiguard (Thymol)',
      swarming_history: 'None / No Swarm Signs',
      varroa_wash_result: '0 Mites (0.0%)',
      temperament: 'normal',
      food_stores: 'adequate',
      extra_queens_seen: 0,
      pests_disease: 'Clean wash',
      action_taken: 'Inspected nuc expansion',
      inspector: 'Owner',
      notes: 'Strong expansion since split. Brood across 5 frames.',
      is_season_ending: false,
      honey_harvested_lbs: 0,
      season_conclusion_notes: '',
    },
    {
      id: 'insp-4',
      hive_id: 'h-4',
      date: getRecentDate(9),
      queen_seen: true,
      queen_health: 'good',
      eggs_seen: true,
      brood_frames_count: 8,
      brood_pattern: 'good',
      drone_status: 'Live Drones Seen',
      mite_treatment: 'None',
      swarming_history: 'None / No Swarm Signs',
      varroa_wash_result: '1-2 Mites (<1.0% - Low)',
      temperament: 'calm',
      food_stores: 'adequate',
      extra_queens_seen: 0,
      pests_disease: 'None',
      action_taken: 'Routine check',
      inspector: 'Morgan',
      notes: 'Due for weekly re-inspection. 8 frames of brood.',
      is_season_ending: false,
      honey_harvested_lbs: 0,
      season_conclusion_notes: '',
    },
    {
      id: 'insp-5',
      hive_id: 'h-5',
      date: getRecentDate(3),
      queen_seen: false,
      queen_health: 'unknown',
      eggs_seen: false,
      brood_frames_count: 0,
      brood_pattern: 'none',
      drone_status: 'None',
      mite_treatment: 'None',
      swarming_history: 'Suspected Swarm',
      varroa_wash_result: 'Not Tested',
      temperament: 'aggressive',
      food_stores: 'low',
      extra_queens_seen: 0,
      pests_disease: 'Queenless roar heard',
      action_taken: 'Fed 1:1 sugar syrup, flagged for queen introduction from holding nuc',
      inspector: 'Owner',
      notes: 'No eggs, no larvae, no queen found. Bees agitated. Queenless status confirmed.',
      is_season_ending: false,
      honey_harvested_lbs: 0,
      season_conclusion_notes: '',
    },
    {
      id: 'insp-6',
      hive_id: 'h-1',
      date: getRecentDate(15),
      queen_seen: true,
      queen_health: 'good',
      eggs_seen: true,
      brood_frames_count: 6,
      brood_pattern: 'good',
      drone_status: 'None',
      mite_treatment: 'Apivar (Amitraz)',
      swarming_history: 'None / No Swarm Signs',
      varroa_wash_result: '0 Mites (0.0%)',
      temperament: 'calm',
      food_stores: 'full',
      extra_queens_seen: 0,
      pests_disease: 'None',
      action_taken: 'Harvested honey supers and installed mouse guard for winter prep',
      inspector: 'Owner',
      notes: 'Season finale inspection. Strong heavy winter cluster.',
      is_season_ending: true,
      honey_harvested_lbs: 65,
      season_conclusion_notes: 'Exceptional honey harvest of 65 lbs. Colony entered winter with 8 deep frames of honey and strong healthy cluster.',
    },
  ],
  splits: [
    {
      id: 'sp-1',
      parent_hive_id: 'h-1',
      date: '2025-05-01',
      outcome: 'kept',
      new_hive_number: 'Hive 03 (Hillside)',
      buyer: '',
      price: 0,
      notes: '4-frame split with queen cell from Hive 01. Queen mated successfully.',
    },
    {
      id: 'sp-2',
      parent_hive_id: 'h-2',
      date: '2025-06-15',
      outcome: 'sold',
      new_hive_number: '',
      buyer: 'Green Valley Apiaries',
      price: 195,
      notes: '5-frame overwintered nuc with mated Italian queen.',
    },
  ],
  sales: [
    {
      id: 'sl-1',
      queen_id: '',
      description: 'Mated Carniolan Breeder Queen',
      date: '2025-07-05',
      buyer: 'Sunny Hollow Honey Farm',
      price: 45,
      notes: 'Marked yellow, shipped in Jz-Bz cage with attendants.',
    },
    {
      id: 'sl-2',
      queen_id: '',
      description: 'Buckfast Mated Queen',
      date: '2025-07-28',
      buyer: 'Dave R. (Local hobbyist)',
      price: 40,
      notes: 'Local pickup.',
    },
  ],
};

function getRecentDate(daysAgoNum: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgoNum);
  return d.toISOString().split('T')[0];
}

export function loadDatabase(): ApiaryDatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDatabase(SEED_DATA);
      return SEED_DATA;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.accounts || !parsed.hives) {
      saveDatabase(SEED_DATA);
      return SEED_DATA;
    }

    // Normalize hives
    const normalizedHives = (parsed.hives || []).map((h: any) => {
      let status = h.status;
      if (status === 'active') status = 'Queen Right';
      else if (status === 'queenless') status = 'Queenless';
      else if (status === 'dead' || status === 'merged') status = 'Undetermined';
      else if (status === 'sold') status = 'Sold';
      else if (!['Queen Right', 'Queenless', 'Undetermined', 'Sold'].includes(status)) {
        status = 'Queen Right';
      }

      let source = h.source;
      if (source === 'package' || source === 'purchased') source = 'Nuc';
      else if (source === 'swarm capture') source = 'Captured Swarm';
      else if (source === 'nuc') source = 'Nuc';
      else if (source === 'split') source = 'Split';
      else if (!['Nuc', 'Split', 'Overwintered', 'Domestic Swarm', 'Captured Swarm'].includes(source)) {
        source = 'Nuc';
      }

      return {
        ...h,
        status,
        source,
      };
    });

    // Normalize queens
    const normalizedQueens = (parsed.queens || []).map((q: any) => ({
      ...q,
      is_holding: q.is_holding ?? (q.status === 'mated-holding'),
      lineage: q.lineage || '',
      age: q.age || '',
      mated_nuc_number: q.mated_nuc_number || '',
    }));

    // Normalize inspections
    const normalizedInspections = (parsed.inspections || []).map((i: any) => ({
      ...i,
      brood_frames_count: typeof i.brood_frames_count === 'number' ? i.brood_frames_count : (i.brood_pattern === 'none' ? 0 : 5),
      drone_status: i.drone_status || 'None',
      mite_treatment: i.mite_treatment || 'None',
      swarming_history: i.swarming_history || 'None / No Swarm Signs',
      varroa_wash_result: i.varroa_wash_result || 'Not Tested',
      is_season_ending: Boolean(i.is_season_ending),
      honey_harvested_lbs: typeof i.honey_harvested_lbs === 'number' ? i.honey_harvested_lbs : 0,
      season_conclusion_notes: i.season_conclusion_notes || '',
    }));

    return {
      accounts: parsed.accounts || SEED_DATA.accounts,
      hives: normalizedHives,
      queens: normalizedQueens,
      inspections: normalizedInspections,
      splits: parsed.splits || [],
      sales: parsed.sales || [],
    };
  } catch (e) {
    console.error('Error loading apiary database:', e);
    return SEED_DATA;
  }
}

export function saveDatabase(data: ApiaryDatabaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving apiary database:', e);
  }
}

export function resetDatabaseToDefaults(): ApiaryDatabaseState {
  saveDatabase(SEED_DATA);
  return SEED_DATA;
}
