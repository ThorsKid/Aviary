export type AccountRole = 'admin' | 'employee';

export interface Account {
  id: string;
  name: string;
  role: AccountRole;
  pin: string;
}

export type HiveStatus = 'active' | 'queenless' | 'sold' | 'merged' | 'dead';
export type QueenHealth = 'good' | 'fair' | 'poor' | 'unknown';
export type QueenStatus = 'in-hive' | 'spare' | 'sold' | 'dead';
export type QueenOrigin = 'raised' | 'purchased' | 'survivor stock' | 'swarm';
export type HiveSource = 'package' | 'nuc' | 'split' | 'purchased' | 'swarm capture';
export type BroodPattern = 'good' | 'spotty' | 'none';
export type Temperament = 'calm' | 'normal' | 'aggressive';
export type FoodStores = 'low' | 'adequate' | 'full';

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
  notes: string;
}

export interface Inspection {
  id: string;
  hive_id: string;
  date: string;
  queen_seen: boolean;
  queen_health: QueenHealth;
  eggs_seen: boolean;
  brood_pattern: BroodPattern;
  temperament: Temperament;
  food_stores: FoodStores;
  extra_queens_seen: number;
  pests_disease: string;
  action_taken: string;
  inspector: string;
  notes: string;
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

export const HIVE_STATUSES: HiveStatus[] = ['active', 'queenless', 'sold', 'merged', 'dead'];
export const QUEEN_HEALTH_OPTIONS: QueenHealth[] = ['good', 'fair', 'poor', 'unknown'];
export const QUEEN_STATUS_OPTIONS: QueenStatus[] = ['in-hive', 'spare', 'sold', 'dead'];
export const QUEEN_ORIGINS: QueenOrigin[] = ['raised', 'purchased', 'survivor stock', 'swarm'];
export const HIVE_SOURCES: HiveSource[] = ['package', 'nuc', 'split', 'purchased', 'swarm capture'];
export const BROOD_PATTERNS: BroodPattern[] = ['good', 'spotty', 'none'];
export const TEMPERAMENTS: Temperament[] = ['calm', 'normal', 'aggressive'];
export const FOOD_STORES: FoodStores[] = ['low', 'adequate', 'full'];

export type TabKey = 'dashboard' | 'hives' | 'inspections' | 'queens' | 'splits' | 'accounts';

export type StatusTone = 'good' | 'warn' | 'bad' | 'neutral' | 'dim';
