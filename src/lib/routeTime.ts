// 店间通勤时间：优先调高德路径规划插件实时计算，失败时用直线距离估算兜底
// （estimateOnly=true 时不必等待网络请求，供无 key 环境使用）。
import type { TravelMode } from '../types/itinerary';
import { haversineMeters } from './haversine';

const AVG_SPEED_KMH: Record<TravelMode, number> = {
  walking: 4.5,
  driving: 25,
  transit: 18,
};

function estimateMinutes(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  mode: TravelMode,
): number {
  const meters = haversineMeters(a, b);
  const km = meters / 1000;
  // 直线距离到实际路程打个 1.3 倍冗余系数
  const minutes = ((km * 1.3) / AVG_SPEED_KMH[mode]) * 60;
  return Math.max(1, Math.round(minutes));
}

interface RouteResult {
  minutes: number;
  isEstimate: boolean;
}

export async function computeCommuteMinutes(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  mode: TravelMode,
): Promise<RouteResult> {
  const AMap = window.AMap;
  if (!AMap) {
    return { minutes: estimateMinutes(a, b, mode), isEstimate: true };
  }

  const PluginClass =
    mode === 'walking' ? AMap.Walking : mode === 'transit' ? AMap.Transfer : AMap.Driving;

  if (!PluginClass) {
    return { minutes: estimateMinutes(a, b, mode), isEstimate: true };
  }

  return new Promise((resolve) => {
    try {
      const planner = new PluginClass();
      planner.search(
        [a.lng, a.lat],
        [b.lng, b.lat],
        (status: string, result: any) => {
          const route = result?.routes?.[0];
          const seconds = route?.time;
          if (status === 'complete' && typeof seconds === 'number' && seconds > 0) {
            resolve({ minutes: Math.round(seconds / 60), isEstimate: false });
          } else {
            resolve({ minutes: estimateMinutes(a, b, mode), isEstimate: true });
          }
        },
      );
    } catch {
      resolve({ minutes: estimateMinutes(a, b, mode), isEstimate: true });
    }
  });
}
