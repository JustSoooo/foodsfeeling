// 动态加载高德地图 JS API 2.0（https://lbs.amap.com）。
// key 未配置时返回 null，调用方需降级为占位视图。
declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig?: { securityJsCode: string };
  }
}

let loadPromise: Promise<any> | null = null;

export function getAmapKey(): string | undefined {
  return import.meta.env.VITE_AMAP_KEY as string | undefined;
}

export function loadAMap(): Promise<any> {
  const key = getAmapKey();
  if (!key) return Promise.resolve(null);

  if (window.AMap) return Promise.resolve(window.AMap);
  if (loadPromise) return loadPromise;

  const securityCode = import.meta.env.VITE_AMAP_SECURITY_CODE as string | undefined;
  if (securityCode) {
    window._AMapSecurityConfig = { securityJsCode: securityCode };
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.MarkerCluster,AMap.Driving,AMap.Walking,AMap.Transfer`;
    script.async = true;
    script.onload = () => resolve(window.AMap);
    script.onerror = () => reject(new Error('高德地图 JS SDK 加载失败'));
    document.head.appendChild(script);
  });

  return loadPromise;
}
