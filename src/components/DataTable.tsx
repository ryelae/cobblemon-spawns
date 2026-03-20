import { useState, useRef, useEffect } from 'react';
import { SpawnEntry, SortState, BUCKET_COLORS, BUCKET_DEFAULT_COLOR } from '../types/spawn';

interface ColumnDef {
  key: string;
  label: string;
  defaultVisible: boolean;
  align?: 'right';
}

const COLUMNS: ColumnDef[] = [
  { key: 'no',            label: '#',             defaultVisible: true  },
  { key: 'pokemon',       label: 'Pokémon',        defaultVisible: true  },
  { key: 'bucket',        label: 'Bucket',         defaultVisible: true  },
  { key: 'weight',        label: 'Weight',         defaultVisible: true,  align: 'right' },
  { key: 'lvMin',         label: 'Lv. Min',        defaultVisible: true,  align: 'right' },
  { key: 'lvMax',         label: 'Lv. Max',        defaultVisible: true,  align: 'right' },
  { key: 'biomes',        label: 'Biomes',         defaultVisible: true  },
  { key: 'time',          label: 'Time',           defaultVisible: true  },
  { key: 'weather',       label: 'Weather',        defaultVisible: true  },
  { key: 'context',       label: 'Context',        defaultVisible: true  },
  { key: 'excludedBiomes',label: 'Excl. Biomes',   defaultVisible: false },
  { key: 'entry',         label: 'Entry',          defaultVisible: false },
  { key: 'multipliers',   label: 'Multipliers',    defaultVisible: false },
  { key: 'presets',       label: 'Presets',        defaultVisible: false },
  { key: 'conditions',    label: 'Conditions',     defaultVisible: false },
  { key: 'anticonditions',label: 'Anticonditions', defaultVisible: false },
  { key: 'skyLightMin',   label: 'Sky Light Min',  defaultVisible: false, align: 'right' },
  { key: 'skyLightMax',   label: 'Sky Light Max',  defaultVisible: false, align: 'right' },
  { key: 'canSeeSky',     label: 'Can See Sky',    defaultVisible: false },
  { key: 'patternKeyValue',label: 'Pattern',       defaultVisible: false },
];

const DEFAULT_VISIBLE = new Set(COLUMNS.filter(c => c.defaultVisible).map(c => c.key));

function getCellValue(entry: SpawnEntry, key: string): string {
  switch (key) {
    case 'no':              return entry.no;
    case 'pokemon':         return entry.pokemon;
    case 'bucket':          return entry.bucket;
    case 'weight':          return entry.weight;
    case 'lvMin':           return entry.lvMin;
    case 'lvMax':           return entry.lvMax;
    case 'biomes':          return entry.biomesRaw;
    case 'time':            return entry.time;
    case 'weather':         return entry.weather;
    case 'context':         return entry.context;
    case 'excludedBiomes':  return entry.excludedBiomes.join(', ');
    case 'entry':           return entry.entry;
    case 'multipliers':     return entry.multipliers;
    case 'presets':         return entry.presets;
    case 'conditions':      return entry.conditions;
    case 'anticonditions':  return entry.anticonditions;
    case 'skyLightMin':     return entry.skyLightMin;
    case 'skyLightMax':     return entry.skyLightMax;
    case 'canSeeSky':       return entry.canSeeSky;
    case 'patternKeyValue': return entry.patternKeyValue;
    default:                return '';
  }
}

interface Props {
  data: SpawnEntry[];
  sort: SortState;
  onSort: (s: SortState) => void;
  highlightBiomes: string[];
}

export default function DataTable({ data, sort, onSort, highlightBiomes }: Props) {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(DEFAULT_VISIBLE);
  const [colsOpen, setColsOpen] = useState(false);
  const colsRef = useRef<HTMLDivElement>(null);

  // Close column picker on outside click
  useEffect(() => {
    if (!colsOpen) return;
    const handler = (e: MouseEvent) => {
      if (colsRef.current && !colsRef.current.contains(e.target as Node)) {
        setColsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [colsOpen]);

  const visibleCols = COLUMNS.filter(c => visibleKeys.has(c.key));

  const handleSort = (key: string) => {
    if (sort.column === key) {
      if (sort.direction === 'asc') onSort({ column: key, direction: 'desc' });
      else if (sort.direction === 'desc') onSort({ column: key, direction: null });
      else onSort({ column: key, direction: 'asc' });
    } else {
      onSort({ column: key, direction: 'asc' });
    }
  };

  const toggleCol = (key: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return prev; // always keep at least one
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sort.column !== col || !sort.direction) {
      return <span className="text-gray-600 ml-1 text-[10px]">⇅</span>;
    }
    return <span className="text-indigo-400 ml-1 text-[10px]">{sort.direction === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden">
      {/* Table header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800">
        <span className="text-xs text-gray-500">
          {data.length === 0 ? 'No results' : `${data.length.toLocaleString()} row${data.length === 1 ? '' : 's'}`}
        </span>
        {/* Column visibility */}
        <div ref={colsRef} className="relative">
          <button
            onClick={() => setColsOpen(o => !o)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700 transition-colors"
          >
            ⚙ Columns
          </button>
          {colsOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-20 p-1 max-h-80 overflow-y-auto">
              {COLUMNS.map(col => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={visibleKeys.has(col.key)}
                    onChange={() => toggleCol(col.key)}
                    className="accent-indigo-500"
                  />
                  <span className="text-sm text-gray-300">{col.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[calc(100vh-280px)]">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-lg font-medium">No results match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search or biome filters</p>
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-gray-900">
              <tr>
                {visibleCols.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`px-3 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-gray-200 hover:bg-gray-800/60 transition-colors border-b border-gray-800 ${
                      col.align === 'right' ? 'text-right' : ''
                    } ${sort.column === col.key && sort.direction ? 'text-indigo-300' : ''}`}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {col.label}
                      <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((entry, i) => (
                <tr
                  key={`${entry.no}-${entry.pokemon}-${i}`}
                  className={`border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors ${
                    i % 2 === 0 ? '' : 'bg-gray-900/30'
                  }`}
                >
                  {visibleCols.map(col => (
                    <td
                      key={col.key}
                      className={`px-3 py-2 whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''}`}
                    >
                      {col.key === 'bucket' ? (
                        <BucketBadge value={entry.bucket} />
                      ) : col.key === 'biomes' ? (
                        <BiomePills biomes={entry.biomes} highlight={highlightBiomes} />
                      ) : col.key === 'excludedBiomes' ? (
                        entry.excludedBiomes.length > 0
                          ? <BiomePills biomes={entry.excludedBiomes} highlight={[]} muted />
                          : <span className="text-gray-600">—</span>
                      ) : col.key === 'pokemon' ? (
                        <span className="font-medium text-gray-100">{entry.pokemon}</span>
                      ) : (
                        <CellValue value={getCellValue(entry, col.key)} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function BucketBadge({ value }: { value: string }) {
  const colorClass = BUCKET_COLORS[value] ?? BUCKET_DEFAULT_COLOR;
  const label = value.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) || '—';
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

function BiomePills({ biomes, highlight, muted }: { biomes: string[]; highlight: string[]; muted?: boolean }) {
  if (biomes.length === 0) return <span className="text-gray-600">—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {biomes.map(b => {
        const isHighlighted = highlight.includes(b);
        const base = muted
          ? 'bg-gray-800/60 text-gray-500 border-gray-700'
          : isHighlighted
            ? 'bg-indigo-900/60 text-indigo-200 border-indigo-600'
            : 'bg-gray-800 text-gray-300 border-gray-700';
        return (
          <span
            key={b}
            className={`inline-block text-xs px-1.5 py-0.5 rounded border ${base}`}
          >
            {b}
          </span>
        );
      })}
    </span>
  );
}

function CellValue({ value }: { value: string }) {
  if (!value || value === 'any') {
    return <span className="text-gray-500">{value || '—'}</span>;
  }
  return <span className="text-gray-300">{value}</span>;
}
