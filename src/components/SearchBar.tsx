interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none text-sm">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search all fields…"
        className="w-full pl-9 pr-9 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-2 flex items-center px-1 text-gray-500 hover:text-gray-300 text-lg leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}
