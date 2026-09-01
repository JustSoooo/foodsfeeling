import { useEffect, useRef, useState } from 'react';
import { loadAMap, getAmapKey } from '../lib/amap-loader';
import type { Restaurant } from '../types/restaurant';
import { SOURCE_LABEL } from '../types/restaurant';
import './MapView.css';

interface MapViewProps {
  restaurants: Restaurant[];
  onSelect: (r: Restaurant) => void;
}

const SOURCE_COLOR: Record<Restaurant['source'], string> = {
  yifan_s1: '#c9302c',
  yifan_s2: '#c9302c',
  wulala: '#f0ad4e',
  liuyuxin: '#337ab7',
};

export default function MapView({ restaurants, onSelect }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const clusterRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const hasKey = Boolean(getAmapKey());

  useEffect(() => {
    if (!hasKey) return;
    let cancelled = false;

    loadAMap().then((AMap) => {
      if (cancelled || !AMap || !containerRef.current) return;
      mapRef.current = new AMap.Map(containerRef.current, {
        zoom: 5,
        center: [104.0, 35.0], // 中国地理中心附近
      });
      setReady(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasKey]);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.AMap) return;
    const AMap = window.AMap;
    const map = mapRef.current;

    const points = restaurants
      .filter((r) => r.lat != null && r.lng != null)
      .map((r) => ({ lnglat: [r.lng, r.lat] as [number, number], restaurant: r }));

    clusterRef.current?.setMap(null);

    if (points.length === 0) {
      clusterRef.current = null;
      return;
    }

    clusterRef.current = new AMap.MarkerCluster(map, points, {
      gridSize: 60,
      renderClusterMarker(context: any) {
        const count = context.count as number;
        const size = Math.min(28 + Math.sqrt(count) * 6, 56);
        const div = document.createElement('div');
        div.className = 'cluster-bubble';
        div.style.width = `${size}px`;
        div.style.height = `${size}px`;
        div.style.lineHeight = `${size}px`;
        div.textContent = String(count);
        context.marker.setContent(div);
        context.marker.setAnchor('center');
      },
      renderMarker(context: any) {
        const r: Restaurant = context.data[0].restaurant;
        const div = document.createElement('div');
        div.className = 'single-pin';
        div.style.background = SOURCE_COLOR[r.source];
        context.marker.setContent(div);
        context.marker.setAnchor('center');
        context.marker.setTitle(r.name);
        context.marker.on('click', () => onSelect(r));
      },
    });

    map.setFitView();

    return () => {
      clusterRef.current?.setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, restaurants]);

  if (!hasKey) {
    return (
      <div className="map-fallback">
        <div className="map-fallback__banner">
          未配置高德地图 Key（VITE_AMAP_KEY），当前以列表占位展示地图数据。
          <br />
          前往 <span>lbs.amap.com</span> 申请 key 后写入 <code>.env.local</code> 即可切换为真实地图。
        </div>
        <ul className="map-fallback__list">
          {restaurants.map((r) => (
            <li key={r.id} onClick={() => onSelect(r)}>
              <span className="pin-dot" data-source={r.source} />
              <div>
                <div className="fallback-name">{r.name}</div>
                <div className="fallback-meta">
                  {r.city} · {SOURCE_LABEL[r.source]}
                  {r.lat != null && r.lng != null ? ` · (${r.lat}, ${r.lng})` : ' · 坐标待核'}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <div ref={containerRef} className="map-container" />;
}
