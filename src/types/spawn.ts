export interface SpawnEntry {
  no: string;
  pokemon: string;
  entry: string;
  bucket: string;
  weight: string;
  lvMin: string;
  lvMax: string;
  biomes: string[];
  excludedBiomes: string[];
  time: string;
  weather: string;
  multipliers: string;
  context: string;
  presets: string;
  conditions: string;
  anticonditions: string;
  skyLightMin: string;
  skyLightMax: string;
  canSeeSky: string;
  patternKeyValue: string;
  biomesRaw: string;
  _raw: Record<string, string>;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string;
  direction: SortDirection;
}

export interface FilterState {
  search: string;
  biomes: string[];
  biomeMode: 'any' | 'all';
}

export const BUCKET_COLORS: Record<string, string> = {
  common: 'bg-green-900/40 text-green-300 border border-green-700',
  uncommon: 'bg-blue-900/40 text-blue-300 border border-blue-700',
  rare: 'bg-purple-900/40 text-purple-300 border border-purple-700',
  'ultra-rare': 'bg-amber-900/40 text-amber-300 border border-amber-700',
};

export const BUCKET_DEFAULT_COLOR = 'bg-gray-800 text-gray-400 border border-gray-700';
