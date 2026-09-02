import { useMemo, useState } from 'react';
import type { Restaurant } from '../types/restaurant';
import { SOURCE_LABEL } from '../types/restaurant';
import './CityListView.css';

interface CityListViewProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (r: Restaurant) => void;
  onViewOnMap: (city: string) => void;
}

export default function CityListView({
  restaurants,
  onSelectRestaurant,
  onViewOnMap,
}: CityListViewProps) {
  const [activeCity, setActiveCity] = useState<string | null>(null);

  const cityCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of restaurants) {
      map.set(r.city, (map.get(r.city) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [restaurants]);

  const cityRestaurants = useMemo(() => {
    if (!activeCity) return [];
    return restaurants.filter((r) => r.city === activeCity);
  }, [restaurants, activeCity]);

  if (activeCity) {
    return (
      <div className="city-list">
        <div className="city-list__detail-header">
          <button className="city-list__back" onClick={() => setActiveCity(null)}>
            ‹ 返回城市列表
          </button>
          <button className="city-list__map-link" onClick={() => onViewOnMap(activeCity)}>
            在地图上看
          </button>
        </div>
        <h2 className="city-list__detail-title">
          {activeCity} <span>{cityRestaurants.length} 家</span>
        </h2>
        {cityRestaurants.map((r) => (
          <button key={r.id} className="city-list__item" onClick={() => onSelectRestaurant(r)}>
            <div className="city-list__item-main">
              <span className="city-list__item-name">{r.name}</span>
              <span className="city-list__item-meta">
                {SOURCE_LABEL[r.source]}
                {r.cuisine ? ` · ${r.cuisine}` : ''}
                {r.price_per_person != null ? ` · ¥${r.price_per_person}` : ''}
              </span>
            </div>
            {r.status !== '营业' && <span className="city-list__item-tag">{r.status}</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="city-list">
      {cityCounts.map(([city, count]) => (
        <button key={city} className="city-list__row" onClick={() => setActiveCity(city)}>
          <span className="city-list__name">{city}</span>
          <span className="city-list__count">{count} 家</span>
        </button>
      ))}
      {cityCounts.length === 0 && <p className="city-list__empty">当前筛选条件下没有店铺</p>}
    </div>
  );
}
