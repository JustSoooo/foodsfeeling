import { useMemo } from 'react';
import type { Restaurant } from '../types/restaurant';
import './CityListView.css';

interface CityListViewProps {
  restaurants: Restaurant[];
  onSelectCity: (city: string) => void;
}

export default function CityListView({ restaurants, onSelectCity }: CityListViewProps) {
  const cityCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of restaurants) {
      map.set(r.city, (map.get(r.city) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [restaurants]);

  return (
    <div className="city-list">
      {cityCounts.map(([city, count]) => (
        <button key={city} className="city-list__row" onClick={() => onSelectCity(city)}>
          <span className="city-list__name">{city}</span>
          <span className="city-list__count">{count} 家</span>
        </button>
      ))}
      {cityCounts.length === 0 && <p className="city-list__empty">当前筛选条件下没有店铺</p>}
    </div>
  );
}
