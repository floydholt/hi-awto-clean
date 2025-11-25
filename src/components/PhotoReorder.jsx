// client/src/components/PhotoReorder.jsx
import React, { useEffect, useRef } from "react";
import Sortable from "sortablejs";

export default function PhotoReorder({ photos = [], setPhotos = () => {} }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const sortable = Sortable.create(containerRef.current, {
      animation: 150,
      onEnd: (evt) => {
        const arr = Array.from(photos);
        const [moved] = arr.splice(evt.oldIndex, 1);
        arr.splice(evt.newIndex, 0, moved);
        setPhotos(arr);
      },
    });

    return () => sortable.destroy();
  }, [photos, setPhotos]);

  return (
    <div ref={containerRef} className="grid grid-cols-3 gap-2">
      {photos.map((p, i) => (
        <div key={p} className="relative border rounded overflow-hidden">
          <img src={p} alt={`photo-${i}`} className="w-full h-24 object-cover" />
        </div>
      ))}
    </div>
  );
}
