import { useMemo, useState } from 'react';
import type { Restaurant } from '../types/restaurant';
import type { FavoritesMap } from '../lib/favorites';
import './FavoritesView.css';

const MAX_SELECTABLE = 6; // 暴走强度上限，见启动文档 9.2.4

interface FavoritesViewProps {
  restaurants: Restaurant[];
  favorites: FavoritesMap;
  onSelect: (r: Restaurant) => void;
  onGenerateItinerary: (city: string, selected: Restaurant[]) => void;
}

export default function FavoritesView({
  restaurants,
  favorites,
  onSelect,
  onGenerateItinerary,
}: FavoritesViewProps) {
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

  const byId = useMemo(() => new Map(restaurants.map((r) => [r.id, r])), [restaurants]);
  const lockedCity = useMemo(() => {
    const first = Array.from(checkedIds)[0];
    return first ? byId.get(first)?.city : undefined;
  }, [checkedIds, byId]);

  function isSelectable(r: Restaurant) {
    if (r.status === '存疑' || r.status === '关闭') return false;
    if (lockedCity && r.city !== lockedCity) return false;
    return true;
  }

  function toggleCheck(r: Restaurant) {
    if (!isSelectable(r) && !checkedIds.has(r.id)) return;
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(r.id)) {
        next.delete(r.id);
      } else {
        if (next.size >= MAX_SELECTABLE) return prev;
        next.add(r.id);
      }
      return next;
    });
  }

  function handleGenerate() {
    if (!lockedCity) return;
    const selected = Array.from(checkedIds)
      .map((id) => byId.get(id))
      .filter((r): r is Restaurant => !!r);
    onGenerateItinerary(lockedCity, selected);
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
          已选 {checkedIds.size} 家（{lockedCity}）
          {checkedIds.size >= MAX_SELECTABLE && '（已达单日上限）'}
          <button onClick={handleGenerate}>生成打卡攻略</button>
          <button className="ghost" onClick={() => setCheckedIds(new Set())}>
            清空
          </button>
        </div>
      )}
      {grouped.map(([city, list]) => (
        <section key={city} className="favorites-view__group">
          <h3>
            {city} <span>{list.length} 家</span>
          </h3>
          {list.map((r) => {
            const selectable = isSelectable(r);
            return (
              <div
                key={r.id}
                className={`favorites-view__row${!selectable ? ' favorites-view__row--disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checkedIds.has(r.id)}
                  disabled={!selectable && !checkedIds.has(r.id)}
                  onChange={() => toggleCheck(r)}
                  title={
                    r.status === '存疑' || r.status === '关闭'
                      ? `状态为${r.status}，暂不可用于攻略`
                      : lockedCity && r.city !== lockedCity
                        ? `多选仅限同城市（当前已锁定${lockedCity}）`
                        : undefined
                  }
                />
                <div className="favorites-view__row-main" onClick={() => onSelect(r)}>
                  <span className="favorites-view__row-name">{r.name}</span>
                  <span
                    className={`favorites-view__row-status favorites-view__row-status--${favorites[r.id]}`}
                  >
                    {favorites[r.id] === 'want' ? '想去' : '去过'}
                  </span>
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
