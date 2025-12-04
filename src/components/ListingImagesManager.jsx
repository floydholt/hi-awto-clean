// src/components/ListingImagesManager.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { db, storage } from "../firebase";
import {
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

/**
 * Sortable thumbnail card
 */
const SortableImage = ({ image, onDelete, progress }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group rounded-lg overflow-hidden bg-slate-100 border"
    >
      <img
        src={image.previewUrl || image.url}
        alt="Listing"
        className="w-full h-32 object-cover"
      />

      {/* drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 rounded bg-white/80 px-2 py-1 text-[11px] shadow-sm text-slate-700 hover:bg-white"
      >
        Drag
      </button>

      {/* delete button */}
      <button
        type="button"
        onClick={() => onDelete(image.id)}
        className="absolute right-2 top-2 rounded bg-red-600/90 px-2 py-1 text-[11px] text-white shadow-sm hover:bg-red-700"
      >
        Delete
      </button>

      {/* upload progress bar (new files only) */}
      {image.isNew && progress > 0 && progress < 100 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
          <div
            className="h-full bg-sky-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {image.isNew && progress === 100 && (
        <div className="absolute bottom-1 right-2 rounded bg-emerald-600 px-2 py-0.5 text-[11px] text-white">
          Uploaded
        </div>
      )}
    </div>
  );
};

/**
 * ListingImagesManager
 * Props:
 *  - listingId (string)
 *  - initialImageUrls (string[])
 */
const ListingImagesManager = ({ listingId, initialImageUrls }) => {
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // map Firestore urls -> internal image objects
  useEffect(() => {
    if (initialImageUrls && Array.isArray(initialImageUrls)) {
      const mapped = initialImageUrls.map((url, index) => ({
        id: `existing-${index}-${url}`, // stable id
        url,
        previewUrl: url,
        isNew: false,
      }));
      setImages(mapped);
    }
  }, [initialImageUrls]);

  // convenience: current ordered urls
  const currentUrls = images.map((img) => img.url).filter(Boolean);

  /** Sync current order to Firestore */
  const saveOrderToFirestore = useCallback(async () => {
    if (!listingId) return;
    setIsSavingOrder(true);
    try {
      await updateDoc(doc(db, "listings", listingId), {
        imageUrls: currentUrls,
      });
    } finally {
      setIsSavingOrder(false);
    }
  }, [listingId, currentUrls]);

  /** Handle drag end (reorder) */
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((prev) => {
      const oldIndex = prev.findIndex((img) => img.id === active.id);
      const newIndex = prev.findIndex((img) => img.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered;
    });

    // after state updates, sync to Firestore
    // small timeout to ensure images state is updated
    setTimeout(() => {
      saveOrderToFirestore();
    }, 0);
  };

  /** Add files from input/drop */
  const addFiles = (files) => {
    const array = Array.from(files);
    if (!array.length) return;

    const mapped = array.map((file) => ({
      id: `new-${file.name}-${file.lastModified}-${Math.random()
        .toString(36)
        .slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      url: null,
      isNew: true,
    }));

    setImages((prev) => [...prev, ...mapped]);
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  /** Drag & drop for adding new files */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  /** Delete image (from UI + Firestore) */
  const handleDelete = async (imageId) => {
    const confirm = window.confirm("Delete this image from the listing?");
    if (!confirm) return;

    setImages((prev) => prev.filter((img) => img.id !== imageId));

    // After deleting from local, sync order to Firestore
    // slight delay to let state update
    setTimeout(() => {
      const urls = images
        .filter((img) => img.id !== imageId)
        .map((img) => img.url)
        .filter(Boolean);

      updateDoc(doc(db, "listings", listingId), {
        imageUrls: urls,
      }).catch(() => {});
    }, 0);
  };

  /** Upload any new files to Firebase Storage & update Firestore */
  const uploadNewImages = async () => {
    const newImages = images.filter((img) => img.isNew && img.file);
    if (!newImages.length) {
      alert("No new images selected to upload.");
      return;
    }

    setIsUploading(true);
    const newUrls = [];

    for (const img of newImages) {
      const file = img.file;
      const storagePath = `listings/${listingId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            setUploadProgress((prev) => ({
              ...prev,
              [img.id]: Math.round(progress),
            }));
          },
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            newUrls.push({ id: img.id, url: downloadURL });
            resolve();
          }
        );
      });
    }

    // merge URLs back into images
    setImages((prev) =>
      prev.map((img) => {
        const uploaded = newUrls.find((u) => u.id === img.id);
        if (!uploaded) return img;
        return {
          ...img,
          url: uploaded.url,
          previewUrl: uploaded.url,
          isNew: false,
        };
      })
    );

    const allUrls = [
      ...currentUrls,
      ...newUrls.map((u) => u.url).filter(Boolean),
    ].filter(Boolean);

    await updateDoc(doc(db, "listings", listingId), {
      imageUrls: allUrls,
    });

    setUploadProgress({});
    setIsUploading(false);
    alert("Images uploaded and listing updated.");
  };

  return (
    <section className="mt-8 border rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Listing Images</h2>
          <p className="text-xs text-slate-500">
            Drag images to reorder. Drop new files here or use the file picker.
          </p>
        </div>

        <button
          type="button"
          onClick={uploadNewImages}
          disabled={isUploading}
          className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sky-700 disabled:opacity-60"
        >
          {isUploading ? "Uploading..." : "Upload New Images"}
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`mb-5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-sm ${
          isDraggingOver
            ? "border-sky-500 bg-sky-50 text-sky-700"
            : "border-slate-300 bg-slate-50 text-slate-500"
        }`}
      >
        <span className="mb-2 text-xs font-medium">
          Drag & drop images here
        </span>
        <span className="mb-2 text-[11px]">
          or click to choose files from your computer
        </span>

        <label className="mt-1 inline-flex cursor-pointer items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-sky-700 shadow-sm hover:bg-slate-50">
          Browse…
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Grid of images */}
      {images.length === 0 ? (
        <p className="text-xs text-slate-500">
          No images yet. Upload some to make this listing stand out.
        </p>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((img) => img.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <SortableImage
                  key={image.id}
                  image={image}
                  onDelete={handleDelete}
                  progress={uploadProgress[image.id] || 0}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {isSavingOrder && (
        <p className="mt-2 text-[11px] text-slate-400">
          Saving image order…
        </p>
      )}
    </section>
  );
};

export default ListingImagesManager;
