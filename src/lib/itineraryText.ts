// 生成可复制的纯文本攻略（启动文档 9.3）：店名/地址/人均/招牌菜/导航链接。
import type { Restaurant } from '../types/restaurant';
import type { ItinerarySlot, TravelMode } from '../types/itinerary';
import { MEAL_SLOTS, TRAVEL_MODE_LABEL } from '../types/itinerary';

export function itineraryToText(
  slots: ItinerarySlot[],
  restaurantMap: Record<string, Restaurant>,
  meta: { city: string; travelMode: TravelMode },
): string {
  const lines: string[] = [];
  lines.push(`【${meta.city} 打卡攻略】出行方式：${TRAVEL_MODE_LABEL[meta.travelMode]}`);
  lines.push('');

  for (const slotEntry of slots) {
    const def = MEAL_SLOTS.find((d) => d.id === slotEntry.slot)!;
    lines.push(`◆ ${def.label}（${def.timeRange}）`);
    for (const stop of slotEntry.stops) {
      const r = restaurantMap[stop.restaurantId];
      if (!r) continue;
      if (stop.commuteFromPrevMinutes != null) {
        lines.push(
          `  → 通勤约 ${stop.commuteFromPrevMinutes} 分钟${stop.commuteIsEstimate ? '（估算）' : ''}${stop.crossDistrictWarning ? ' ⚠️跨区较远' : ''}`,
        );
      }
      lines.push(`  · ${r.name}`);
      lines.push(`    地址：${r.address}`);
      if (r.price_per_person != null) lines.push(`    人均：¥${r.price_per_person}`);
      if (r.signature_dishes && r.signature_dishes.length > 0) {
        lines.push(`    招牌菜：${r.signature_dishes.join('、')}`);
      }
      if (r.lat != null && r.lng != null) {
        lines.push(`    导航：https://uri.amap.com/marker?position=${r.lng},${r.lat}&name=${encodeURIComponent(r.name)}`);
      }
      if (r.status !== '营业') lines.push(`    ⚠️ 状态：${r.status}，出发前建议点评确认营业时间`);
    }
    lines.push('');
  }

  lines.push('（出发前建议点评确认营业时间；本攻略由「城市美食地图」生成）');
  return lines.join('\n');
}
