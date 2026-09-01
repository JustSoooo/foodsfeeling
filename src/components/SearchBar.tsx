import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <input
        type="search"
        inputMode="search"
        placeholder="搜索店名 / 城市 / 菜系"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="search-bar__clear" onClick={() => onChange('')} aria-label="清空">
          ×
        </button>
      )}
    </div>
  );
}
