import type { Source } from './restaurant';

export interface Filters {
  sources: Set<Source>;
  city: string; // 'all' 或具体城市名
  priceRange: PriceRange;
  cuisine: string; // 'all' 或具体菜系
}

export type PriceRange = 'all' | 'lt100' | '100-300' | '300-600' | 'gt600';

export const PRICE_RANGE_LABEL: Record<PriceRange, string> = {
  all: '人均不限',
  lt100: '¥100 以下',
  '100-300': '¥100-300',
  '300-600': '¥300-600',
  gt600: '¥600 以上',
};

export function priceInRange(price: number | null | undefined, range: PriceRange): boolean {
  if (range === 'all') return true;
  if (price == null) return false;
  switch (range) {
    case 'lt100':
      return price < 100;
    case '100-300':
      return price >= 100 && price <= 300;
    case '300-600':
      return price > 300 && price <= 600;
    case 'gt600':
      return price > 600;
  }
}

export const ALL_SOURCES: Source[] = ['yifan_s1', 'yifan_s2', 'wulala', 'liuyuxin'];

export const DEFAULT_FILTERS: Filters = {
  sources: new Set(ALL_SOURCES),
  city: 'all',
  priceRange: 'all',
  cuisine: 'all',
};
