export type AccountRole = 'admin' | 'employee';

export interface Account {
  id: string;
  name: string;
  role: AccountRole;
  pin: string;
}

export type HiveStatus = 'Queen Right' | 'Queenless' | 'Undetermined' | 'Sold';
export type HiveSource = 'Nuc' | 'Split' | 'Overwintered' | 'Domestic Swarm' | 'Captured Swarm';

export type QueenHealth = 'good' | 'fair' | 'poor' | 'unknown';
export type QueenStatus = 'in-hive' | 'mated-holding' | 'spare' | 'sold' | 'dead';
export type QueenOrigin = 'raised' | 'purchased' | 'survivor stock' | 'swarm';
export type BroodPattern = 'good' | 'spotty' | 'none';
export type Temperament = 'calm' | 'normal' | 'aggressive';
export type FoodStores = 'low' | 'adequate' | 'full';

export type DroneObservation =
  | 'None'
  | 'Drone Brood Seen'
  | 'Live Drones Seen'
  | 'Drone Brood & Live Drones Seen';

export type MiteTreatment =
  | 'None'
  | 'Formic Pro'
  | 'Apivar (Amitraz)'
  | 'Oxalic Acid Vapor (OAV)'
  | 'Oxalic Acid Dribble (OAD)'
  | 'Apiguard (Thymol)'
  | 'HopGuard'
  | 'Thymovar'
  | 'ApiLife Var'
  | 'Other Treatment';

export type SwarmHistory =
  | 'None / No Swarm Signs'
  | 'Swarm Cells Built'
  | 'Swarmed Previously'
  | 'Suspected Swarm'
  | 'Swarm Impending';

export type VarroaWashResult =
  | 'Not Tested'
  | '0 Mites (0.0%)'
  | '1-2 Mites (<1.0% - Low)'
  | '3-5 Mites (1.0% - 1.7% - Caution)'
  | '6-8 Mites (2.0% - 2.7% - Action Threshold)'
  | '9+ Mites (3.0%+ - High Infestation)';

export interface Hive {
  id: string;
  number: string;
  location: string;
  date_established: string;
  source: HiveSource;
  status: HiveStatus;
  queen_id: string;
  notes: string;
}

export interface Queen {
  id: string;
  label: string;
  origin: QueenOrigin;
  hive_id: string;
  status: QueenStatus;
  date_introduced: string;
  breed: string;
  // Queen rearing holding fields
  is_holding: boolean;
  lineage: string;
  age: string;
  mated_nuc_number: string;
  notes: string;
}

export interface Inspection {
  id: string;
  hive_id: string;
  date: string;
  queen_seen: boolean;
  queen_health: QueenHealth;
  eggs_seen: boolean;
  brood_frames_count: number;
  brood_pattern: BroodPattern;
  drone_status: DroneObservation;
  mite_treatment: MiteTreatment;
  swarming_history: SwarmHistory;
  varroa_wash_result: VarroaWashResult;
  temperament: Temperament;
  food_stores: FoodStores;
  extra_queens_seen: number;
  pests_disease: string;
  action_taken: string;
  inspector: string;
  notes: string;
  // Season ending inspection section
  is_season_ending: boolean;
  honey_harvested_lbs: number;
  season_conclusion_notes: string;
}

export type SplitOutcome = 'kept' | 'sold';

export interface Split {
  id: string;
  parent_hive_id: string;
  date: string;
  outcome: SplitOutcome;
  new_hive_number: string;
  buyer: string;
  price: number;
  notes: string;
}

export interface Sale {
  id: string;
  queen_id: string;
  description: string;
  date: string;
  buyer: string;
  price: number;
  notes: string;
}

export const HIVE_STATUSES: HiveStatus[] = ['Queen Right', 'Queenless', 'Undetermined', 'Sold'];
export const HIVE_SOURCES: HiveSource[] = [
  'Nuc',
  'Split',
  'Overwintered',
  'Domestic Swarm',
  'Captured Swarm',
];

export const QUEEN_HEALTH_OPTIONS: QueenHealth[] = ['good', 'fair', 'poor', 'unknown'];
export const QUEEN_STATUS_OPTIONS: QueenStatus[] = ['in-hive', 'mated-holding', 'spare', 'sold', 'dead'];
export const QUEEN_ORIGINS: QueenOrigin[] = ['raised', 'purchased', 'survivor stock', 'swarm'];
export const BROOD_PATTERNS: BroodPattern[] = ['good', 'spotty', 'none'];
export const TEMPERAMENTS: Temperament[] = ['calm', 'normal', 'aggressive'];
export const FOOD_STORES: FoodStores[] = ['low', 'adequate', 'full'];

export const DRONE_OPTIONS: DroneObservation[] = [
  'None',
  'Drone Brood Seen',
  'Live Drones Seen',
  'Drone Brood & Live Drones Seen',
];

export const MITE_TREATMENTS: MiteTreatment[] = [
  'None',
  'Formic Pro',
  'Apivar (Amitraz)',
  'Oxalic Acid Vapor (OAV)',
  'Oxalic Acid Dribble (OAD)',
  'Apiguard (Thymol)',
  'HopGuard',
  'Thymovar',
  'ApiLife Var',
  'Other Treatment',
];

export const SWARM_HISTORIES: SwarmHistory[] = [
  'None / No Swarm Signs',
  'Swarm Cells Built',
  'Swarmed Previously',
  'Suspected Swarm',
  'Swarm Impending',
];

export const VARROA_WASH_OPTIONS: VarroaWashResult[] = [
  'Not Tested',
  '0 Mites (0.0%)',
  '1-2 Mites (<1.0% - Low)',
  '3-5 Mites (1.0% - 1.7% - Caution)',
  '6-8 Mites (2.0% - 2.7% - Action Threshold)',
  '9+ Mites (3.0%+ - High Infestation)',
];

export type TabKey = 'dashboard' | 'hives' | 'inspections' | 'queens' | 'splits' | 'accounts';
export type StatusTone = 'good' | 'warn' | 'bad' | 'neutral' | 'dim';
