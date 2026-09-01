# 城市美食地图（Foods Feeling）

《一饭封神》S1/S2 选手餐厅 + 特别乌啦啦 + 刘雨鑫 三大探店源整合的城市美食地图 Web App。

完整产品/数据设计见 [`城市美食地图-启动文档.md`](./城市美食地图-启动文档.md)。

**⚠️ 数据以 `src/data/restaurants.json` 为唯一事实源，不得凭记忆编造餐厅名/地址。**

## 开发

```bash
npm install
cp .env.example .env.local   # 填入高德地图 Web端(JS API) key
npm run dev
```

未配置 `VITE_AMAP_KEY` 时地图会自动降级为列表占位视图，功能开发不受影响。

## 高德 Key 白名单

Web端(JS API) 类型的 key 需要在高德控制台配置域名白名单，本地开发需同时加入：

```
localhost
127.0.0.1
```

## 构建

```bash
npm run build   # tsc -b && vite build，产物在 dist/
npm run lint    # oxlint
```

## 目录结构

```
src/
  types/        数据模型（restaurant.ts）与筛选器类型（filters.ts）
  data/         restaurants.json（样例数据，全量数据整理后替换）
  lib/          高德 SDK 加载、坐标转换、导航跳转、收藏持久化
  components/   MapView / RestaurantCard / FilterBar / CityListView / SearchBar / FavoritesView
```

## 部署

技术选型为 Cloudflare Pages（纯静态 SPA），目标域名 `food.sung.homes`。部署尚未执行，
需要账号侧操作（创建 Pages 项目、绑定域名），见启动文档「六、技术建议」。
