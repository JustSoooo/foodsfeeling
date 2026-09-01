// 三家地图导航 + 大众点评外链，对应启动文档「八、外链跳转设计」。
// 移动端优先唤起 App（URL scheme），唤起失败（App 未安装）时降级到网页版。
import type { Restaurant } from '../types/restaurant';
import { gcj02ToBd09 } from './coords';

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isMobile() {
  return isIOS() || isAndroid();
}

/**
 * 尝试用 scheme 唤起 App，若在 timeoutMs 内页面仍留在原地（说明没有安装对应 App / 唤起失败），
 * 则跳转到网页版兜底。经典的"隐藏跳转 + setTimeout 检测"方案。
 */
function openWithFallback(scheme: string, webFallback: string, timeoutMs = 1500) {
  if (!isMobile()) {
    window.open(webFallback, '_blank', 'noopener,noreferrer');
    return;
  }

  let didHide = false;
  const onVisibilityChange = () => {
    if (document.hidden) didHide = true;
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  window.location.href = scheme;

  setTimeout(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (!didHide) {
      window.location.href = webFallback;
    }
  }, timeoutMs);
}

export function openAmapNav(r: Restaurant) {
  if (r.lat == null || r.lng == null) return;
  const name = encodeURIComponent(r.name);
  const webFallback = `https://uri.amap.com/marker?position=${r.lng},${r.lat}&name=${name}`;
  const scheme = isIOS()
    ? `iosamap://viewMap?sourceApplication=foodsfeeling&poiname=${name}&lat=${r.lat}&lon=${r.lng}&dev=0`
    : `androidamap://viewMap?sourceApplication=foodsfeeling&poiname=${name}&lat=${r.lat}&lon=${r.lng}&dev=0`;
  openWithFallback(scheme, webFallback);
}

export function openBaiduNav(r: Restaurant) {
  if (r.lat == null || r.lng == null) return;
  const name = encodeURIComponent(r.name);
  // 百度坐标系为 BD-09，优先传 coord_type=gcj02 让百度自行转换；
  // scheme 唤起 App 端不支持该参数，因此手动转换一次坐标以防万一。
  const [bdLng, bdLat] = gcj02ToBd09(r.lng, r.lat);
  const webFallback = `https://api.map.baidu.com/marker?location=${r.lat},${r.lng}&title=${name}&coord_type=gcj02&output=html&src=foodsfeeling`;
  const scheme = `baidumap://map/marker?location=${bdLat},${bdLng}&title=${name}&content=${name}&src=foodsfeeling`;
  openWithFallback(scheme, webFallback);
}

export function openAppleNav(r: Restaurant) {
  if (r.lat == null || r.lng == null) return;
  const name = encodeURIComponent(r.name);
  const url = `https://maps.apple.com/?ll=${r.lat},${r.lng}&q=${name}`;
  if (isIOS()) {
    window.location.href = url;
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export function openDianping(r: Restaurant) {
  const webFallback = r.dianping_shop_id
    ? `https://www.dianping.com/shop/${r.dianping_shop_id}`
    : `https://www.dianping.com/search/keyword/0_0_${encodeURIComponent(r.name)}`;

  if (r.dianping_shop_id) {
    const scheme = `dianping://shopinfo?id=${r.dianping_shop_id}`;
    openWithFallback(scheme, webFallback);
  } else {
    window.open(webFallback, '_blank', 'noopener,noreferrer');
  }
}
