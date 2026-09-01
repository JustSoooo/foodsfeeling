export type TravelMode = 'walking' | 'driving' | 'transit';
export type Intensity = 'light' | 'standard' | 'heavy';

export const INTENSITY_CAP: Record<Intensity, number> = {
  light: 3,
  standard: 5,
  heavy: 6,
};

export const INTENSITY_LABEL: Record<Intensity, string> = {
  light: '轻（最多3家）',
  standard: '标准（4-5家）',
  heavy: '暴走（最多6家）',
};

export const TRAVEL_MODE_LABEL: Record<TravelMode, string> = {
  walking: '步行',
  driving: '驾车',
  transit: '公交',
};

export type MealSlotId = 'breakfast' | 'lunch' | 'afternoon' | 'dinner' | 'latenight';

export interface MealSlotDef {
  id: MealSlotId;
  label: string;
  timeRange: string;
}

export const MEAL_SLOTS: MealSlotDef[] = [
  { id: 'breakfast', label: '早餐档', timeRange: '8:00-10:00' },
  { id: 'lunch', label: '午餐档', timeRange: '11:30-13:30' },
  { id: 'afternoon', label: '下午档', timeRange: '14:30-17:00' },
  { id: 'dinner', label: '晚餐档', timeRange: '18:00-20:00' },
  { id: 'latenight', label: '夜宵档', timeRange: '21:00后' },
];

export interface ItineraryStop {
  restaurantId: string;
  /** 与上一站的通勤时间（分钟）；第一站为 null */
  commuteFromPrevMinutes: number | null;
  commuteIsEstimate: boolean;
  crossDistrictWarning: boolean;
}

export interface ItinerarySlot {
  slot: MealSlotId;
  stops: ItineraryStop[];
}

export interface ItineraryDraft {
  city: string;
  travelMode: TravelMode;
  intensity: Intensity;
  startPoint: string;
  slots: ItinerarySlot[];
  createdAt: string;
}
