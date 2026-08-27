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
      notes: 'Fast spring buildup.',
    },
    {
      id: 'q-5',
      label: 'Spare Carniolan #B1',
      origin: 'raised',
      hive_id: '',
      status: 'spare',
      date_introduced: '2025-07-20',
      breed: 'Carniolan',
      notes: 'Mated in nuc bank, ready for emergency requeening or sale.',
    },
    {
      id: 'q-6',
      label: 'Spare Buckfast #B2',
      origin: 'raised',
      hive_id: '',
      status: 'spare',
      date_introduced: '2025-08-01',
      breed: 'Buckfast',
      notes: 'Bank nuc 3, laying solid pattern.',
    },
    {
      id: 'q-7',
      label: 'Old Queen 2023 #0',
      origin: 'swarm',
      hive_id: '',
      status: 'dead',
      date_introduced: '2023-06-14',
      breed: 'Wild Feral',
      notes: 'Superceded in spring 2025.',
    },
  ],
  hives: [
    {
      id: 'h-1',
      number: 'Hive 01 (Orchard)',
      location: 'North Orchard - Row 3',
      date_established: '2024-04-10',
      source: 'package',
      status: 'active',
      queen_id: 'q-1',
      notes: 'Double deep 10-frame Langstroth. Top producer.',
    },
    {
      id: 'h-2',
      number: 'Hive 02 (Meadow)',
      location: 'Wildflower Meadow East',
      date_established: '2024-05-15',
      source: 'nuc',
      status: 'active',
      queen_id: 'q-2',
      notes: 'Vigorous nectar forager. Needs supers added early.',
    },
    {
      id: 'h-3',
      number: 'Hive 03 (Hillside)',
      location: 'South Hillside Bench',
      date_established: '2025-05-01',
      source: 'split',
      status: 'active',
      queen_id: 'q-3',
      notes: 'Created from Hive 01 spring split. Healthy mite counts.',
    },
    {
      id: 'h-4',
      number: 'Hive 04 (Clover)',
      location: 'Clover Field Stand',
      date_established: '2025-06-08',
      source: 'purchased',
      status: 'active',
      queen_id: 'q-4',
      notes: 'Strong population, gentle disposition.',
    },
    {
      id: 'h-5',
      number: 'Hive 05 (Swarm Box)',
      location: 'Perimeter Hedge',
      date_established: '2025-07-12',
      source: 'swarm capture',
      status: 'queenless',
      queen_id: '',
      notes: 'Lost virgin queen after mating flight. Needs spare queen introduction.',
    },
    {
      id: 'h-6',
      number: 'Hive 06 (Riverbank)',
      location: 'Riverbank Station',
      date_established: '2025-05-20',
      source: 'split',
      status: 'active',
      queen_id: '',
      notes: 'Recent inspection needed. Queen cell observed last week.',
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
      brood_pattern: 'good',
      temperament: 'calm',
      food_stores: 'full',
      extra_queens_seen: 0,
      pests_disease: 'No varroa seen on bottom board',
      action_taken: 'Added second honey super',
      inspector: 'Owner',
      notes: 'Wall-to-wall capped honey and 6 frames of solid capped brood.',
    },
    {
      id: 'insp-2',
      hive_id: 'h-2',
      date: getRecentDate(4),
      queen_seen: true,
      queen_health: 'good',
      eggs_seen: true,
      brood_pattern: 'good',
      temperament: 'calm',
      food_stores: 'adequate',
      extra_queens_seen: 0,
      pests_disease: 'Low mite drop',
      action_taken: 'Rotated empty frames to outside',
      inspector: 'Morgan',
      notes: 'Queen spotted on frame 4 center. Good laying density.',
    },
    {
      id: 'insp-3',
      hive_id: 'h-3',
      date: getRecentDate(5),
      queen_seen: true,
      queen_health: 'good',
      eggs_seen: true,
      brood_pattern: 'good',
      temperament: 'normal',
      food_stores: 'adequate',
      extra_queens_seen: 0,
      pests_disease: 'None',
      action_taken: 'Inspected nuc expansion',
      inspector: 'Owner',
      notes: 'Strong expansion since split. Brood in 7 frames.',
    },
    {
      id: 'insp-4',
      hive_id: 'h-4',
      date: getRecentDate(9),
      queen_seen: true,
      queen_health: 'good',
      eggs_seen: true,
      brood_pattern: 'good',
      temperament: 'calm',
      food_stores: 'adequate',
      extra_queens_seen: 0,
      pests_disease: 'None',
      action_taken: 'Routine check',
      inspector: 'Morgan',
      notes: 'Due for weekly re-inspection.',
    },
    {
      id: 'insp-5',
      hive_id: 'h-5',
      date: getRecentDate(3),
      queen_seen: false,
      queen_health: 'unknown',
      eggs_seen: false,
      brood_pattern: 'none',
      temperament: 'aggressive',
      food_stores: 'low',
      extra_queens_seen: 0,
      pests_disease: 'Queenless roar heard',
      action_taken: 'Fed 1:1 sugar syrup, flagged for spare queen introduction',
      inspector: 'Owner',
      notes: 'No eggs, no larvae, no queen found. Bees agitated. Must requeen.',
    },
    {
      id: 'insp-6',
      hive_id: 'h-6',
      date: getRecentDate(12),
      queen_seen: false,
      queen_health: 'unknown',
      eggs_seen: false,
      brood_pattern: 'spotty',
      temperament: 'normal',
      food_stores: 'adequate',
      extra_queens_seen: 2,
      pests_disease: 'None',
      action_taken: 'Capped swarm cells left to hatch',
      inspector: 'Owner',
      notes: 'Inspection overdue by 5+ days!',
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
    return parsed;
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
