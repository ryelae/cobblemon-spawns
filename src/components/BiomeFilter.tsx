import { useState, useRef, useEffect } from 'react';

interface Props {
  allBiomes: string[];
  selected: string[];
  mode: 'any' | 'all';
  onChange: (biomes: string[], mode: 'any' | 'all') => void;
}

export default function BiomeFilter({ allBiomes, selected, mode, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const filtered = allBiomes.filter(b =>
    b.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (biome: string) => {
    const next = selected.includes(biome)
      ? selected.filter(b => b !== biome)
      : [...selected, biome];
    onChange(next, mode);
  };

  const selectAll = () => onChange(filtered.length === allBiomes.length ? filtered : [...new Set([...selected, ...filtered])], mode);
  const clearAll = () => onChange([], mode);

  const label = selected.length === 0
    ? 'Filter by Biome'
    : selected.length <= 2
      ? `Biome: ${selected.join(', ')}`
      : `Biomes: ${selected.slice(0, 2).join(', ')} +${selected.length - 2}`;

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
          selected.length > 0
            ? 'bg-indigo-900/40 border-indigo-600 text-indigo-300 hover:bg-indigo-900/60'
            : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
        }`}
      >
        <span>🌿</span>
        <span className="max-w-[200px] truncate">{label}</span>
        {selected.length > 0 && (
          <span className="ml-0.5 bg-indigo-500/30 text-indigo-200 text-xs px-1.5 py-0.5 rounded-full">
            {selected.length}
          </span>
        )}
        <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-30 flex flex-col">
          {/* Match mode toggle */}
          <div className="flex items-center gap-1 p-2 border-b border-gray-800">
            <span className="text-xs text-gray-400 mr-1">Match:</span>
            <button
              onClick={() => onChange(selected, 'any')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                mode === 'any' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Any
            </button>
            <button
              onClick={() => onChange(selected, 'all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                mode === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <span className="ml-auto flex gap-1">
              <button
                onClick={selectAll}
                className="text-xs text-indigo-400 hover:text-indigo-200 px-1"
              >
                All
              </button>
              <span className="text-gray-600">·</span>
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-gray-200 px-1"
              >
                Clear
              </button>
            </span>
          </div>

          {/* Search */}
          <div className="p-2 border-b border-gray-800">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search biomes…"
              autoFocus
              className="w-full px-2.5 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Biome list */}
          <div className="overflow-y-auto max-h-64 p-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 py-3 text-center">No biomes match</p>
            ) : (
              filtered.map(biome => (
                <label
                  key={biome}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(biome)}
                    onChange={() => toggle(biome)}
                    className="accent-indigo-500"
                  />
                  <span className="text-sm text-gray-200">{biome}</span>
                </label>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-800 flex justify-end">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1 rounded-lg text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
