import { SpawnEntry } from '../types/spawn';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function splitLine(line: string, delimiter: string): string[] {
  if (delimiter === '\t') {
    return line.split('\t').map(v => v.trim());
  }
  return parseCSVLine(line);
}

function parseBiomeList(value: string): string[] {
  if (!value || !value.trim()) return [];
  return value
    .split(',')
    .map(b => b.trim())
    .filter(Boolean);
}

// Maps normalized header names to internal field names.
const HEADER_ALIASES: Record<string, string> = {
  'no.': 'no',
  '#': 'no',
  'number': 'no',
  'pokémon': 'pokemon',
  'name': 'pokemon',
  'bucket': 'bucket',
  'rarity': 'bucket',
  'lv. min': 'lvMin',
  'lv min': 'lvMin',
  'lv.min': 'lvMin',
  'level min': 'lvMin',
  'min level': 'lvMin',
  'min lv': 'lvMin',
  'lv. max': 'lvMax',
  'lv max': 'lvMax',
  'lv.max': 'lvMax',
  'level max': 'lvMax',
  'max level': 'lvMax',
  'max lv': 'lvMax',
  'biome': 'biomes',
  'excluded biomes': 'excludedBiomes',
  'excluded biome': 'excludedBiomes',
  'skylightmin': 'skyLightMin',
  'sky light min': 'skyLightMin',
  'skylightmax': 'skyLightMax',
  'sky light max': 'skyLightMax',
  'canseesky': 'canSeeSky',
  'can see sky': 'canSeeSky',
  'patternkey=value': 'patternKeyValue',
  'pattern key=value': 'patternKeyValue',
};

function resolveFieldName(header: string): string {
  const normalized = header.toLowerCase().trim().replace(/\s+/g, ' ');
  return HEADER_ALIASES[normalized] ?? normalized.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function parseDelimited(content: string, delimiter: string): SpawnEntry[] {
  const lines = content.split(/\r?\n/);
  const nonEmpty = lines.filter(l => l.trim());

  if (nonEmpty.length < 2) {
    throw new Error('No data found. File must have a header row and at least one data row.');
  }

  const rawHeaders = splitLine(nonEmpty[0], delimiter);
  const fieldNames = rawHeaders.map(resolveFieldName);

  // First occurrence of each field name wins.
  const fieldIndex: Record<string, number> = {};
  fieldNames.forEach((name, i) => {
    if (!(name in fieldIndex)) fieldIndex[name] = i;
  });

  const getValue = (values: string[], field: string): string => {
    const idx = fieldIndex[field];
    if (idx === undefined) return '';
    return (values[idx] ?? '').trim();
  };

  const entries: SpawnEntry[] = [];

  for (let i = 1; i < nonEmpty.length; i++) {
    const line = nonEmpty[i].trim();
    if (!line) continue;

    const values = splitLine(nonEmpty[i], delimiter);

    const raw: Record<string, string> = {};
    rawHeaders.forEach((h, j) => {
      raw[h] = (values[j] ?? '').trim();
    });

    const biomesRaw = getValue(values, 'biomes');

    entries.push({
      no: getValue(values, 'no'),
      pokemon: getValue(values, 'pokemon'),
      entry: getValue(values, 'entry'),
      bucket: getValue(values, 'bucket').toLowerCase(),
      weight: getValue(values, 'weight'),
      lvMin: getValue(values, 'lvMin'),
      lvMax: getValue(values, 'lvMax'),
      biomes: parseBiomeList(biomesRaw),
      excludedBiomes: parseBiomeList(getValue(values, 'excludedBiomes')),
      time: getValue(values, 'time'),
      weather: getValue(values, 'weather'),
      multipliers: getValue(values, 'multipliers'),
      context: getValue(values, 'context'),
      presets: getValue(values, 'presets'),
      conditions: getValue(values, 'conditions'),
      anticonditions: getValue(values, 'anticonditions'),
      skyLightMin: getValue(values, 'skyLightMin'),
      skyLightMax: getValue(values, 'skyLightMax'),
      canSeeSky: getValue(values, 'canSeeSky'),
      patternKeyValue: getValue(values, 'patternKeyValue'),
      biomesRaw,
      _raw: raw,
    });
  }

  if (entries.length === 0) {
    throw new Error('No valid rows found in the file.');
  }

  return entries;
}

export function parseFile(content: string, fileName: string): SpawnEntry[] {
  const lower = fileName.toLowerCase();
  let delimiter = '\t';
  if (lower.endsWith('.csv')) {
    const firstLine = content.split('\n')[0] ?? '';
    const tabCount = (firstLine.match(/\t/g) ?? []).length;
    delimiter = tabCount > 3 ? '\t' : ',';
  }
  return parseDelimited(content, delimiter);
}

export function parseText(content: string): SpawnEntry[] {
  const firstLine = content.split('\n')[0] ?? '';
  const tabCount = (firstLine.match(/\t/g) ?? []).length;
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  const delimiter = tabCount >= commaCount ? '\t' : ',';
  return parseDelimited(content, delimiter);
}
