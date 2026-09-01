import { useEffect, useMemo, useState } from 'react';
import type { Restaurant } from '../types/restaurant';
import type { Intensity, ItineraryDraft, ItinerarySlot, TravelMode } from '../types/itinerary';
import { INTENSITY_CAP, INTENSITY_LABEL, MEAL_SLOTS, TRAVEL_MODE_LABEL } from '../types/itinerary';
import { buildItinerary, recomputeCommute } from '../lib/itineraryBuilder';
import { itineraryToText } from '../lib/itineraryText';
import { saveDraft } from '../lib/itineraryDrafts';
import './ItineraryOverlay.css';

interface ItineraryOverlayProps {
  city: string;
  restaurants: Restaurant[];
  onClose: () => void;
}

type Step = 'params' | 'loading' | 'result';

export default function ItineraryOverlay({ city, restaurants, onClose }: ItineraryOverlayProps) {
  const [step, setStep] = useState<Step>('params');
  const [travelMode, setTravelMode] = useState<TravelMode>('walking');
  const [intensity, setIntensity] = useState<Intensity>('standard');
  const [startPoint, setStartPoint] = useState('');
  const [slots, setSlots] = useState<ItinerarySlot[]>([]);
  const [copied, setCopied] = useState(false);

  const restaurantMap = useMemo(
    () => Object.fromEntries(restaurants.map((r) => [r.id, r])),
    [restaurants],
  );

  const cap = INTENSITY_CAP[intensity];
  const overCap = restaurants.length > cap;

  async function handleGenerate() {
    setStep('loading');
    const result = await buildItinerary(restaurants, travelMode);
    setSlots(result);
    setStep('result');
  }

  async function updateAndRecompute(next: ItinerarySlot[]) {
    setSlots(next);
    const recomputed = await recomputeCommute(next, restaurantMap, travelMode);
    setSlots(recomputed);
  }

  function moveStop(slotIdx: number, stopIdx: number, dir: -1 | 1) {
    const next = slots.map((s) => ({ ...s, stops: [...s.stops] }));
    const stops = next[slotIdx].stops;
    const targetIdx = stopIdx + dir;
    if (targetIdx < 0 || targetIdx >= stops.length) return;
    [stops[stopIdx], stops[targetIdx]] = [stops[targetIdx], stops[stopIdx]];
    updateAndRecompute(next);
  }

  function removeStop(slotIdx: number, stopIdx: number) {
    const next = slots
      .map((s, i) => (i === slotIdx ? { ...s, stops: s.stops.filter((_, j) => j !== stopIdx) } : s))
      .filter((s) => s.stops.length > 0);
    updateAndRecompute(next);
  }

  function handleCopy() {
    const text = itineraryToText(slots, restaurantMap, { city, travelMode });
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSaveDraft() {
    const draft: ItineraryDraft = {
      city,
      travelMode,
      intensity,
      startPoint,
      slots,
      createdAt: new Date().toISOString(),
    };
    saveDraft(draft);
  }

  useEffect(() => {
    if (step === 'result') handleSaveDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, slots]);

  return (
    <div className="itinerary-overlay">
      <div className="itinerary-overlay__header">
        <h2>{city} 打卡攻略</h2>
        <button onClick={onClose} aria-label="关闭">
          ×
        </button>
      </div>

      {step === 'params' && (
        <div className="itinerary-overlay__params">
          <p>已选 {restaurants.length} 家店</p>

          <label>出行方式</label>
          <div className="itinerary-overlay__chips">
            {(Object.keys(TRAVEL_MODE_LABEL) as TravelMode[]).map((m) => (
              <button
                key={m}
                className={travelMode === m ? 'active' : ''}
                onClick={() => setTravelMode(m)}
              >
                {TRAVEL_MODE_LABEL[m]}
              </button>
            ))}
          </div>

          <label>用餐强度</label>
          <div className="itinerary-overlay__chips">
            {(Object.keys(INTENSITY_LABEL) as Intensity[]).map((i) => (
              <button
                key={i}
                className={intensity === i ? 'active' : ''}
                onClick={() => setIntensity(i)}
              >
                {INTENSITY_LABEL[i]}
              </button>
            ))}
          </div>

          <label>起点（可选）</label>
          <input
            type="text"
            placeholder="例如：XX 酒店"
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
          />

          {overCap && (
            <p className="itinerary-overlay__warning">
              已选 {restaurants.length} 家，超过「{INTENSITY_LABEL[intensity]}」上限 {cap} 家，建议分两天或提高强度；仍可继续生成。
            </p>
          )}

          <button className="itinerary-overlay__generate" onClick={handleGenerate}>
            一键生成
          </button>
        </div>
      )}

      {step === 'loading' && <div className="itinerary-overlay__loading">正在计算路线与通勤时间…</div>}

      {step === 'result' && (
        <div className="itinerary-overlay__result">
          <div className="itinerary-overlay__actions">
            <button onClick={handleCopy}>{copied ? '已复制' : '复制文本'}</button>
            <button onClick={() => setStep('params')}>重新设置</button>
          </div>

          {slots.map((slotEntry, slotIdx) => {
            const def = MEAL_SLOTS.find((d) => d.id === slotEntry.slot)!;
            return (
              <section key={slotEntry.slot} className="itinerary-overlay__slot">
                <h3>
                  {def.label} <span>{def.timeRange}</span>
                </h3>
                {slotEntry.stops.map((stop, stopIdx) => {
                  const r = restaurantMap[stop.restaurantId];
                  if (!r) return null;
                  return (
                    <div key={r.id}>
                      {stop.commuteFromPrevMinutes != null && (
                        <div
                          className={`itinerary-overlay__commute${stop.crossDistrictWarning ? ' warn' : ''}`}
                        >
                          → 通勤约 {stop.commuteFromPrevMinutes} 分钟
                          {stop.commuteIsEstimate ? '（估算）' : ''}
                          {stop.crossDistrictWarning ? ' ⚠️跨区较远' : ''}
                        </div>
                      )}
                      <div className="itinerary-overlay__stop">
                        <div className="itinerary-overlay__stop-main">
                          <div className="itinerary-overlay__stop-name">{r.name}</div>
                          <div className="itinerary-overlay__stop-meta">
                            {r.address}
                            {r.price_per_person != null ? ` · ¥${r.price_per_person}` : ''}
                          </div>
                        </div>
                        <div className="itinerary-overlay__stop-actions">
                          <button onClick={() => moveStop(slotIdx, stopIdx, -1)} disabled={stopIdx === 0}>
                            ↑
                          </button>
                          <button
                            onClick={() => moveStop(slotIdx, stopIdx, 1)}
                            disabled={stopIdx === slotEntry.stops.length - 1}
                          >
                            ↓
                          </button>
                          <button onClick={() => removeStop(slotIdx, stopIdx)}>删</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}

          <p className="itinerary-overlay__footnote">
            出发前建议点评确认营业时间；攻略已自动保存为草稿。
          </p>
        </div>
      )}
    </div>
  );
}
