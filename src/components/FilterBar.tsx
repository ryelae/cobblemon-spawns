import { FilterState, SpawnEntry } from '../types/spawn';

interface Props {
  filters: FilterState;
  resultCount: number;
  totalCount: number;
  onRemoveBiome: (biome: string) => void;
  onClearAll: () => void;
  filteredData: SpawnEntry[];
}

function exportCSV(data: SpawnEntry[]) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]._raw);

  const escape = (v: string) => (v.includes(',') || v.includes('"') || v.includes('\n'))
    ? `"${v.replace(/"/g, '""')}"`
    : v;

  const rows = [
    headers.join(','),
    ...data.map(entry => headers.map(h => escape(entry._raw[h] ?? '')).join(',')),
  ];

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cobblemon-spawn-filtered.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function FilterBar({
  filters,
  resultCount,
  totalCount,
  onRemoveBiome,
  onClearAll,
  filteredData,
}: Props) {
  const hasActiveFilters = filters.search.trim() || filters.biomes.length > 0;
  const isFiltered = resultCount !== totalCount;

  return (
    <div className="flex flex-wrap items-center gap-2 min-h-[28px]">
      {/* Count */}
      <span className="text-sm text-gray-400 flex-shrink-0">
        {isFiltered ? (
          <>
            <span className="text-white font-medium">{resultCount.toLocaleString()}</span>
            <span className="text-gray-500"> / {totalCount.toLocaleString()} entries</span>
          </>
        ) : (
          <span className="text-gray-500">{totalCount.toLocaleString()} entries</span>
        )}
      </span>

      {/* Search tag */}
      {filters.search.trim() && (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 border border-gray-600">
          🔍 "{filters.search}"
        </span>
      )}

      {/* Biome tags */}
      {filters.biomes.map(biome => (
        <span
          key={biome}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-700"
        >
          🌿 {biome}
          <button
            onClick={() => onRemoveBiome(biome)}
            className="ml-0.5 hover:text-white transition-colors leading-none"
          >
            ×
          </button>
        </span>
      ))}

      {/* Biome mode indicator */}
      {filters.biomes.length > 1 && (
        <span className="text-xs text-gray-500">
          ({filters.biomeMode === 'any' ? 'match any' : 'match all'})
        </span>
      )}

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="text-xs text-gray-400 hover:text-white transition-colors ml-1 underline underline-offset-2"
        >
          Clear all
        </button>
      )}

      {/* Export */}
      <button
        onClick={() => exportCSV(filteredData)}
        disabled={filteredData.length === 0}
        className="ml-auto flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Export filtered results to CSV"
      >
        ↓ Export CSV
      </button>
    </div>
  );
}
