import { useMemo } from 'react';
import type { Restaurant } from '../types/restaurant';
import { SOURCE_LABEL } from '../types/restaurant';
import type { Filters, PriceRange } from '../types/filters';
import { ALL_SOURCES, PRICE_RANGE_LABEL } from '../types/filters';
import './FilterBar.css';

interface FilterBarProps {
  restaurants: Restaurant[];
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterBar({ restaurants, filters, onChange }: FilterBarProps) {
  const cities = useMemo(
    () => Array.from(new Set(restaurants.map((r) => r.city))).sort(),
    [restaurants],
  );
  const cuisines = useMemo(
    () =>
      Array.from(new Set(restaurants.map((r) => r.cuisine).filter((c): c is string => !!c))).sort(),
    [restaurants],
  );

  function toggleSource(s: (typeof ALL_SOURCES)[number]) {
    const next = new Set(filters.sources);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    onChange({ ...filters, sources: next });
  }

  return (
    <div className="filter-bar">
      <div className="filter-bar__chips">
        {ALL_SOURCES.map((s) => (
          <button
            key={s}
            className={`chip${filters.sources.has(s) ? ' chip--active' : ''}`}
            onClick={() => toggleSource(s)}
          >
            {SOURCE_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="filter-bar__selects">
        <select
          value={filters.city}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
        >
          <option value="all">全部城市</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.cuisine}
          onChange={(e) => onChange({ ...filters, cuisine: e.target.value })}
        >
          <option value="all">全部菜系</option>
          {cuisines.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.priceRange}
          onChange={(e) => onChange({ ...filters, priceRange: e.target.value as PriceRange })}
        >
          {(Object.keys(PRICE_RANGE_LABEL) as PriceRange[]).map((p) => (
            <option key={p} value={p}>
              {PRICE_RANGE_LABEL[p]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
