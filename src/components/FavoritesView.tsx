import { useMemo, useState } from 'react';
import type { Restaurant } from '../types/restaurant';
import type { FavoritesMap } from '../lib/favorites';
import './FavoritesView.css';

interface FavoritesViewProps {
  restaurants: Restaurant[];
  favorites: FavoritesMap;
  onSelect: (r: Restaurant) => void;
}

export default function FavoritesView({ restaurants, favorites, onSelect }: FavoritesViewProps) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const favored = restaurants.filter((r) => favorites[r.id]);
    const byCity = new Map<string, Restaurant[]>();
    for (const r of favored) {
      const list = byCity.get(r.city) ?? [];
      list.push(r);
      byCity.set(r.city, list);
    }
    return Array.from(byCity.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [restaurants, favorites]);

  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (grouped.length === 0) {
    return (
      <div className="favorites-view favorites-view--empty">
        还没有收藏的店。去地图上点开一家店，点"想去"或"打卡去过"。
      </div>
    );
  }

  return (
    <div className="favorites-view">
      {checkedIds.size > 0 && (
        <div className="favorites-view__selection-bar">
          已选 {checkedIds.size} 家
          <button disabled title="单日打卡攻略生成器为 V1.1 功能，敬请期待">
            生成打卡攻略（V1.1）
          </button>
        </div>
      )}
      {grouped.map(([city, list]) => (
        <section key={city} className="favorites-view__group">
          <h3>
            {city} <span>{list.length} 家</span>
          </h3>
          {list.map((r) => (
            <div key={r.id} className="favorites-view__row">
              <input
                type="checkbox"
                checked={checkedIds.has(r.id)}
                onChange={() => toggleCheck(r.id)}
              />
              <div className="favorites-view__row-main" onClick={() => onSelect(r)}>
                <span className="favorites-view__row-name">{r.name}</span>
                <span className={`favorites-view__row-status favorites-view__row-status--${favorites[r.id]}`}>
                  {favorites[r.id] === 'want' ? '想去' : '去过'}
                </span>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
