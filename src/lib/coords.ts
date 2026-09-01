// GCJ-02 → BD-09 坐标转换，仅在跳转百度地图时使用（对应启动文档 8.1 强提示）。
const X_PI = (Math.PI * 3000.0) / 180.0;

export function gcj02ToBd09(lng: number, lat: number): [number, number] {
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI);
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI);
  const bdLng = z * Math.cos(theta) + 0.0065;
  const bdLat = z * Math.sin(theta) + 0.006;
  return [bdLng, bdLat];
}
