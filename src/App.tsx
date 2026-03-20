import { useState, useMemo, useCallback } from 'react';
import { SpawnEntry, FilterState, SortState } from './types/spawn';
import { SAMPLE_DATA } from './lib/sampleData';
import FileUpload from './components/FileUpload';
import SearchBar from './components/SearchBar';
import BiomeFilter from './components/BiomeFilter';
import FilterBar from './components/FilterBar';
import DataTable from './components/DataTable';

const DEFAULT_FILTERS: FilterState = { search: '', biomes: [], biomeMode: 'any' };
const DEFAULT_SORT: SortState = { column: 'no', direction: 'asc' };

function getSortValue(entry: SpawnEntry, col: string): string {
  switch (col) {
    case 'no':              return entry.no.padStart(10, '0');
    case 'pokemon':         return entry.pokemon;
    case 'bucket': {
      const order: Record<string, string> = { common: '1', uncommon: '2', rare: '3', 'ultra-rare': '4' };
      return order[entry.bucket] ?? '5';
    }
    case 'weight':          return entry.weight.padStart(10, '0');
    case 'lvMin':           return entry.lvMin.padStart(10, '0');
    case 'lvMax':           return entry.lvMax.padStart(10, '0');
    case 'biomes':          return entry.biomesRaw;
    case 'time':            return entry.time;
    case 'weather':         return entry.weather;
    case 'context':         return entry.context;
    default:                return '';
  }
}

export default function App() {
  const [data, setData] = useState<SpawnEntry[]>(SAMPLE_DATA);
  const [fileName, setFileName] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

  const usingSampleData = fileName === null;

  const allBiomes = useMemo(() => {
    const set = new Set<string>();
    data.forEach(e => e.biomes.forEach(b => set.add(b)));
    return Array.from(set).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    let result = data;

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(entry =>
        Object.values(entry._raw).some(v => v.toLowerCase().includes(q))
      );
    }

    if (filters.biomes.length > 0) {
      result = result.filter(entry => {
        if (filters.biomeMode === 'any') {
          return filters.biomes.some(b => entry.biomes.includes(b));
        }
        return filters.biomes.every(b => entry.biomes.includes(b));
      });
    }

    if (sort.direction) {
      result = [...result].sort((a, b) => {
        const av = getSortValue(a, sort.column);
        const bv = getSortValue(b, sort.column);
        const cmp = av.localeCompare(bv, undefined, { numeric: true });
        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, filters, sort]);

  const handleLoad = useCallback((entries: SpawnEntry[], name?: string) => {
    setData(entries);
    setFileName(name ?? 'pasted data');
    setFilters(DEFAULT_FILTERS);
    setSort(DEFAULT_SORT);
  }, []);

  const handleReset = useCallback(() => {
    setData(SAMPLE_DATA);
    setFileName(null);
    setFilters(DEFAULT_FILTERS);
    setSort(DEFAULT_SORT);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className="text-xl">⚔️</span>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Cobblemon Spawn Browser</h1>
              <p className="text-xs text-gray-500 leading-tight hidden sm:block">Filter & explore spawn data</p>
            </div>
          </div>
          <div className="flex-1" />
          <FileUpload
            onLoad={(entries, name) => handleLoad(entries, name)}
            usingSampleData={usingSampleData}
            fileName={fileName}
            onReset={handleReset}
          />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-screen-2xl mx-auto w-full px-4 py-4 flex flex-col gap-3 flex-1">
        {/* Filter row */}
        <div className="flex flex-wrap gap-2 items-start">
          <div className="flex-1 min-w-[180px] max-w-sm">
            <SearchBar
              value={filters.search}
              onChange={v => setFilters(f => ({ ...f, search: v }))}
            />
          </div>
          <BiomeFilter
            allBiomes={allBiomes}
            selected={filters.biomes}
            mode={filters.biomeMode}
            onChange={(biomes, mode) => setFilters(f => ({ ...f, biomes, biomeMode: mode }))}
          />
        </div>

        {/* Active filter bar */}
        <FilterBar
          filters={filters}
          resultCount={filteredData.length}
          totalCount={data.length}
          onRemoveBiome={b => setFilters(f => ({ ...f, biomes: f.biomes.filter(x => x !== b) }))}
          onClearAll={() => setFilters(DEFAULT_FILTERS)}
          filteredData={filteredData}
        />

        {/* Table */}
        <DataTable
          data={filteredData}
          sort={sort}
          onSort={setSort}
          highlightBiomes={filters.biomes}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-3 text-center text-xs text-gray-600">
        Cobblemon Spawn Browser — upload your spawn data TSV/CSV to get started
      </footer>
    </div>
  );
}
