// client/src/components/ListingFilters.jsx
import React, { useState } from "react";

export default function ListingFilters({ onApply, initial = {} }) {
  const [city, setCity] = useState(initial.city || "");
  const [minPrice, setMinPrice] = useState(initial.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice || "");

  const handleApply = (e) => {
    e.preventDefault();
    onApply({
      city: city.trim() || null,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
    });
  };

  const handleReset = () => {
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    onApply({});
  };

  return (
    <form
      onSubmit={handleApply}
      className="bg-white p-4 rounded-md shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
    >
      <div>
        <label className="block text-sm text-gray-600">City</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g., Testville"
          className="mt-1 border rounded px-3 py-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Min price</label>
        <input
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          type="number"
          placeholder="0"
          className="mt-1 border rounded px-3 py-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Max price</label>
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          type="number"
          placeholder="Any"
          className="mt-1 border rounded px-3 py-2 w-full"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded w-full"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 rounded w-full"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
