import { useMemo, useState } from 'react';
import MapView from './components/MapView';
import RestaurantCard from './components/RestaurantCard';
import FilterBar from './components/FilterBar';
import CityListView from './components/CityListView';
import SearchBar from './components/SearchBar';
import FavoritesView from './components/FavoritesView';
import ItineraryOverlay from './components/ItineraryOverlay';
import restaurantsData from './data/restaurants.json';
import type { Restaurant } from './types/restaurant';
import type { Filters } from './types/filters';
import { DEFAULT_FILTERS, priceInRange } from './types/filters';
import type { FavoriteStatus, FavoritesMap } from './lib/favorites';
import { getFavorites, persistFavorites } from './lib/favorites';
import './App.css';

const restaurants = restaurantsData as Restaurant[];

type ViewMode = 'map' | 'cities' | 'favorites';

function App() {
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<ViewMode>('map');
  const [favorites, setFavorites] = useState<FavoritesMap>(() => getFavorites());
  const [itinerary, setItinerary] = useState<{ city: string; restaurants: Restaurant[] } | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restaurants.filter((r) => {
      if (!filters.sources.has(r.source)) return false;
      if (filters.city !== 'all' && r.city !== filters.city) return false;
      if (filters.cuisine !== 'all' && r.cuisine !== filters.cuisine) return false;
      if (!priceInRange(r.price_per_person, filters.priceRange)) return false;
      // 差评店默认不展示（避雷店开关是 V1.1 功能）
      if (r.sentiment === '差评') return false;
      if (q) {
        const hay = `${r.name} ${r.city} ${r.cuisine ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [filters, query]);

  function handleSelectCity(city: string) {
    setFilters((f) => ({ ...f, city }));
    setView('map');
  }

  function handleFavoriteChange(id: string, status: FavoriteStatus | null) {
    setFavorites((prev) => {
      const next = { ...prev };
      if (status == null) delete next[id];
      else next[id] = status;
      persistFavorites(next);
      return next;
    });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>城市美食地图</h1>
        <span className="app-header__count">
          {filtered.length} / {restaurants.length} 家店
        </span>
      </header>

      <nav className="app-tabs">
        <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>
          地图
        </button>
        <button className={view === 'cities' ? 'active' : ''} onClick={() => setView('cities')}>
          城市列表
        </button>
        <button
          className={view === 'favorites' ? 'active' : ''}
          onClick={() => setView('favorites')}
        >
          收藏 {Object.keys(favorites).length > 0 && `(${Object.keys(favorites).length})`}
        </button>
      </nav>

      {view !== 'favorites' && (
        <>
          <SearchBar value={query} onChange={setQuery} />
          <FilterBar restaurants={restaurants} filters={filters} onChange={setFilters} />
        </>
      )}

      <main className="app-map">
        {view === 'map' && <MapView restaurants={filtered} onSelect={setSelected} />}
        {view === 'cities' && (
          <CityListView restaurants={filtered} onSelectCity={handleSelectCity} />
        )}
        {view === 'favorites' && (
          <FavoritesView
            restaurants={restaurants}
            favorites={favorites}
            onSelect={setSelected}
            onGenerateItinerary={(city, sel) => setItinerary({ city, restaurants: sel })}
          />
        )}
      </main>

      {selected && (
        <RestaurantCard
          restaurant={selected}
          favoriteStatus={favorites[selected.id]}
          onFavoriteChange={handleFavoriteChange}
          onClose={() => setSelected(null)}
        />
      )}

      {itinerary && (
        <ItineraryOverlay
          city={itinerary.city}
          restaurants={itinerary.restaurants}
          onClose={() => setItinerary(null)}
        />
      )}
    </div>
  );
}

export default App;
