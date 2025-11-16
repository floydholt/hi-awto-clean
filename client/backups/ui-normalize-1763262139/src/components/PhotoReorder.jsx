import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

// Sortable item component
function SortablePhoto({ id, url, index }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative flex-shrink-0"
    >
      <img
        src={url}
        alt="listing"
        className="w-28 h-28 object-cover rounded shadow"
      />
      <div className="absolute bottom-0 right-0 bg-black text-white text-xs px-1 rounded-tl">
        {index + 1}
      </div>
    </div>
  );
}

export default function PhotoReorder({ photos = [], onReorder }) {
  const [items, setItems] = useState(photos);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((img) => img === active.id);
    const newIndex = items.findIndex((img) => img === over.id);

    const newOrder = arrayMove(items, oldIndex, newIndex);
    setItems(newOrder);
    onReorder(newOrder);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Reorder Photos</h3>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {items.map((url, index) => (
              <SortablePhoto key={url} id={url} url={url} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
