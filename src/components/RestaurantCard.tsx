import type { Restaurant } from '../types/restaurant';
import { SOURCE_LABEL } from '../types/restaurant';
import { openAmapNav, openBaiduNav, openAppleNav, openDianping } from '../lib/navLinks';
import type { FavoriteStatus } from '../lib/favorites';
import './RestaurantCard.css';

interface RestaurantCardProps {
  restaurant: Restaurant;
  favoriteStatus?: FavoriteStatus;
  onFavoriteChange: (id: string, status: FavoriteStatus | null) => void;
  onClose: () => void;
}

export default function RestaurantCard({
  restaurant: r,
  favoriteStatus,
  onFavoriteChange,
  onClose,
}: RestaurantCardProps) {
  return (
    <div className="detail-card">
      <button className="detail-card__close" onClick={onClose} aria-label="关闭">
        ×
      </button>
      <h2>{r.name}</h2>
      <div className="detail-card__tags">
        <span className="tag">{SOURCE_LABEL[r.source]}</span>
        {r.status !== '营业' && <span className="tag tag--warn">{r.status}</span>}
        {r.sentiment === '差评' && <span className="tag tag--warn">避雷</span>}
      </div>

      <div className="detail-card__favorite">
        <button
          className={favoriteStatus === 'want' ? 'active' : ''}
          onClick={() => onFavoriteChange(r.id, favoriteStatus === 'want' ? null : 'want')}
        >
          {favoriteStatus === 'want' ? '★ 已想去' : '☆ 想去'}
        </button>
        <button
          className={favoriteStatus === 'been' ? 'active' : ''}
          onClick={() => onFavoriteChange(r.id, favoriteStatus === 'been' ? null : 'been')}
        >
          {favoriteStatus === 'been' ? '✓ 已去过' : '打卡去过'}
        </button>
      </div>
      <p className="detail-card__address">
        {r.city} {r.district} · {r.address}
      </p>
      {r.chef && <p>主厨：{r.chef}</p>}
      {r.awards && r.awards.length > 0 && <p>荣誉：{r.awards.join('、')}</p>}
      {r.cuisine && <p>菜系：{r.cuisine}</p>}
      {r.signature_dishes && r.signature_dishes.length > 0 && (
        <p>招牌菜：{r.signature_dishes.join('、')}</p>
      )}
      {r.price_per_person != null && <p>人均：¥{r.price_per_person}</p>}
      {r.notes && <p className="detail-card__notes">{r.notes}</p>}

      {r.lat != null && r.lng != null && (
        <div className="detail-card__nav">
          <button onClick={() => openAmapNav(r)}>高德导航</button>
          <button onClick={() => openBaiduNav(r)}>百度导航</button>
          <button onClick={() => openAppleNav(r)}>苹果地图</button>
        </div>
      )}
      <button className="detail-card__dianping" onClick={() => openDianping(r)}>
        去点评看排队/评价
      </button>

      <p className="detail-card__verified">信息核实于 {r.verified_at}</p>
    </div>
  );
}
