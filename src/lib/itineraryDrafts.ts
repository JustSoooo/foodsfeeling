// 攻略草稿持久化（启动文档 9.1）：生成后可保存，下次进入直接调出。
import type { ItineraryDraft } from '../types/itinerary';

const STORAGE_KEY = 'foods-feeling:itinerary-draft';

export function saveDraft(draft: ItineraryDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // 隐私模式等场景静默失败
  }
}

export function loadDraft(): ItineraryDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ItineraryDraft) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
