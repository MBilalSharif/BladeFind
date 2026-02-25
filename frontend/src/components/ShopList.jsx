import ShopCard from "./ShopCard";

/**
 * ShopList component
 * Sidebar panel that lists all fetched barber shops.
 * Shows loading skeleton, empty state, and error messages.
 */
const ShopList = ({ shops, loading, error, selectedShop, onShopSelect }) => {
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {/* Skeleton cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-xl overflow-hidden animate-pulse">
            <div className="h-28 bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 font-medium text-sm">⚠️ {error}</p>
          <p className="text-gray-400 text-xs mt-1">Check your connection and try again.</p>
        </div>
      </div>
    );
  }

  if (!shops || shops.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p className="text-4xl mb-3">✂️</p>
        <p className="font-medium text-gray-500">No barber shops found</p>
        <p className="text-sm mt-1">Try searching a location or using your GPS.</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 sidebar-scroll overflow-y-auto">
      <p className="text-xs text-gray-400 font-medium px-1">
        {shops.length} shop{shops.length !== 1 ? "s" : ""} found
      </p>
      {shops.map((shop) => (
        <ShopCard
          key={shop.placeId}
          shop={shop}
          isSelected={selectedShop?.placeId === shop.placeId}
          onClick={() => onShopSelect(shop)}
        />
      ))}
    </div>
  );
};

export default ShopList;
