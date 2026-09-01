// 收藏/打卡状态持久化（localStorage）。对应启动文档 MVP 第6点。
export type FavoriteStatus = 'want' | 'been';
export type FavoritesMap = Record<string, FavoriteStatus>;

const STORAGE_KEY = 'foods-feeling:favorites';

export function getFavorites(): FavoritesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function persistFavorites(map: FavoritesMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 隐私模式等场景 localStorage 不可用时静默失败，不影响当次会话使用
  }
}
