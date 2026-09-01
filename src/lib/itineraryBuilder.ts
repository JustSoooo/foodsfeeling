// 单日打卡攻略生成核心逻辑（启动文档 9.2）：
// 1. 按品类把店分进餐段槽位（早/午/下午/晚/夜宵）
// 2. 同餐段内贪心最近邻排序（不做 TSP）
// 3. 店间通勤时间调用高德路径规划插件计算，失败降级直线估算
// 4. 通勤 >40 分钟标注跨区警告
import type { Restaurant } from '../types/restaurant';
import type { ItinerarySlot, ItineraryStop, MealSlotId, TravelMode } from '../types/itinerary';
import { MEAL_SLOTS } from '../types/itinerary';
import { fixedMealSlot } from './mealSlots';
import { haversineMeters } from './haversine';
import { computeCommuteMinutes } from './routeTime';

const CROSS_DISTRICT_THRESHOLD_MIN = 40;

function greedyOrder(list: Restaurant[]): Restaurant[] {
  if (list.length <= 1) return list;
  const remaining = [...list];
  const ordered: Restaurant[] = [remaining.shift()!];
  while (remaining.length) {
    const last = ordered[ordered.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;
    remaining.forEach((r, i) => {
      const d = haversineMeters(
        { lat: last.lat!, lng: last.lng! },
        { lat: r.lat!, lng: r.lng! },
      );
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    });
    ordered.push(remaining.splice(nearestIdx, 1)[0]);
  }
  return ordered;
}

export async function buildItinerary(
  selected: Restaurant[],
  travelMode: TravelMode,
): Promise<ItinerarySlot[]> {
  const withCoords = selected.filter((r) => r.lat != null && r.lng != null);

  const buckets: Record<MealSlotId, Restaurant[]> = {
    breakfast: [],
    lunch: [],
    afternoon: [],
    dinner: [],
    latenight: [],
  };
  const generic: Restaurant[] = [];

  for (const r of withCoords) {
    const fixed = fixedMealSlot(r.cuisine);
    if (fixed) buckets[fixed].push(r);
    else generic.push(r);
  }

  const lunchCount = Math.ceil(generic.length / 2);
  buckets.lunch.push(...generic.slice(0, lunchCount));
  buckets.dinner.push(...generic.slice(lunchCount));

  for (const def of MEAL_SLOTS) {
    buckets[def.id] = greedyOrder(buckets[def.id]);
  }

  const flatOrder: { slot: MealSlotId; restaurant: Restaurant }[] = [];
  for (const def of MEAL_SLOTS) {
    for (const r of buckets[def.id]) flatOrder.push({ slot: def.id, restaurant: r });
  }

  const stopsBySlot: Record<MealSlotId, ItineraryStop[]> = {
    breakfast: [],
    lunch: [],
    afternoon: [],
    dinner: [],
    latenight: [],
  };

  let prev: Restaurant | null = null;
  for (const { slot, restaurant } of flatOrder) {
    let commuteFromPrevMinutes: number | null = null;
    let commuteIsEstimate = false;
    let crossDistrictWarning = false;

    if (prev) {
      const { minutes, isEstimate } = await computeCommuteMinutes(
        { lat: prev.lat!, lng: prev.lng! },
        { lat: restaurant.lat!, lng: restaurant.lng! },
        travelMode,
      );
      commuteFromPrevMinutes = minutes;
      commuteIsEstimate = isEstimate;
      crossDistrictWarning = minutes > CROSS_DISTRICT_THRESHOLD_MIN;
    }

    stopsBySlot[slot].push({
      restaurantId: restaurant.id,
      commuteFromPrevMinutes,
      commuteIsEstimate,
      crossDistrictWarning,
    });
    prev = restaurant;
  }

  return MEAL_SLOTS.map((def) => ({ slot: def.id, stops: stopsBySlot[def.id] })).filter(
    (s) => s.stops.length > 0,
  );
}

/** 手动增删/调序后重新计算通勤时间（保留用户调整后的顺序，不重新做餐段分配）。 */
export async function recomputeCommute(
  slots: ItinerarySlot[],
  restaurantMap: Record<string, Restaurant>,
  travelMode: TravelMode,
): Promise<ItinerarySlot[]> {
  let prev: Restaurant | null = null;
  const result: ItinerarySlot[] = [];

  for (const slotEntry of slots) {
    const stops: ItineraryStop[] = [];
    for (const stop of slotEntry.stops) {
      const restaurant = restaurantMap[stop.restaurantId];
      let commuteFromPrevMinutes: number | null = null;
      let commuteIsEstimate = false;
      let crossDistrictWarning = false;

      if (prev && restaurant?.lat != null && restaurant?.lng != null && prev.lat != null && prev.lng != null) {
        const { minutes, isEstimate } = await computeCommuteMinutes(
          { lat: prev.lat, lng: prev.lng },
          { lat: restaurant.lat, lng: restaurant.lng },
          travelMode,
        );
        commuteFromPrevMinutes = minutes;
        commuteIsEstimate = isEstimate;
        crossDistrictWarning = minutes > CROSS_DISTRICT_THRESHOLD_MIN;
      }

      stops.push({
        restaurantId: stop.restaurantId,
        commuteFromPrevMinutes,
        commuteIsEstimate,
        crossDistrictWarning,
      });
      if (restaurant) prev = restaurant;
    }
    if (stops.length > 0) result.push({ slot: slotEntry.slot, stops });
  }

  return result;
}
