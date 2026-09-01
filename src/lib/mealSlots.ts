// 品类 → 餐段的静态映射表（启动文档 9.2.1）。用关键词匹配 cuisine 字段。
import type { MealSlotId } from '../types/itinerary';

const BREAKFAST_KEYWORDS = /早点|早餐|粉|面|粥|包子|豆浆|小吃/;
const AFTERNOON_KEYWORDS = /甜品|饮品|奶茶|咖啡|下午茶|糖水/;
const LATENIGHT_KEYWORDS = /烧烤|大排档|夜宵|串串|撸串|鸡煲|小龙虾/;

/**
 * 返回该店"天然"归属的固定档位（早餐/下午/夜宵），命中即为唯一选择。
 * 命中不到固定档位的，视为"正餐"，由 buildItinerary 统一分配到午餐/晚餐档。
 */
export function fixedMealSlot(cuisine: string | undefined): MealSlotId | null {
  const c = cuisine ?? '';
  if (BREAKFAST_KEYWORDS.test(c)) return 'breakfast';
  if (AFTERNOON_KEYWORDS.test(c)) return 'afternoon';
  if (LATENIGHT_KEYWORDS.test(c)) return 'latenight';
  return null;
}
