import { useRef, useState, useCallback, useEffect } from 'react';
import { parseFile, parseText } from '../lib/parser';
import { SpawnEntry } from '../types/spawn';

interface Props {
  onLoad: (entries: SpawnEntry[], name: string) => void;
  usingSampleData: boolean;
  fileName: string | null;
  onReset: () => void;
}

export default function FileUpload({ onLoad, usingSampleData, fileName, onReset }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteError, setPasteError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    const text = await file.text();
    try {
      const entries = parseFile(text, file.name);
      onLoad(entries, file.name);
    } catch (e) {
      alert('Parse error: ' + (e instanceof Error ? e.message : String(e)));
    }
  }, [onLoad]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handlePasteSubmit = () => {
    try {
      const entries = parseText(pasteText);
      onLoad(entries, 'pasted data');
      setPasteOpen(false);
      setPasteText('');
      setPasteError('');
    } catch (e) {
      setPasteError(e instanceof Error ? e.message : String(e));
    }
  };

  // Global drag-and-drop on the window
  useEffect(() => {
    const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragOver(true); };
    const onDragLeave = () => setDragOver(false);
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer?.files[0];
      if (file) handleFile(file);
    };
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [handleFile]);

  return (
    <>
      {/* Drag overlay */}
      {dragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/80 pointer-events-none">
          <div className="text-2xl font-bold text-indigo-300 border-2 border-dashed border-indigo-400 rounded-2xl px-16 py-10">
            Drop your TSV / CSV here
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Status badge */}
        <span className={`hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
          usingSampleData
            ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700'
            : 'bg-emerald-900/40 text-emerald-300 border border-emerald-700'
        }`}>
          {usingSampleData ? '★ Sample data' : `📄 ${fileName}`}
        </span>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          Upload file
        </button>

        <button
          onClick={() => { setPasteOpen(true); setPasteError(''); }}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
        >
          Paste
        </button>

        {!usingSampleData && (
          <button
            onClick={onReset}
            className="px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
            title="Reset to sample data"
          >
            ✕ Reset
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".tsv,.csv,.txt"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Paste modal */}
      {pasteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={e => { if (e.target === e.currentTarget) { setPasteOpen(false); setPasteError(''); } }}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Paste Spreadsheet Data</h2>
              <button
                onClick={() => { setPasteOpen(false); setPasteError(''); }}
                className="text-gray-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-400">
              Copy your data from a spreadsheet (Google Sheets, Excel) and paste it below. Include the header row.
            </p>
            <textarea
              className="w-full h-56 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 font-mono resize-y focus:outline-none focus:border-indigo-500"
              placeholder="No.&#9;Pokémon&#9;Bucket&#9;Biomes&#9;..."
              value={pasteText}
              onChange={e => { setPasteText(e.target.value); setPasteError(''); }}
              spellCheck={false}
            />
            {pasteError && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
                {pasteError}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setPasteOpen(false); setPasteError(''); }}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasteSubmit}
                disabled={!pasteText.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Load data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
