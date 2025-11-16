// client/src/components/ListingForm.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { addDoc, collection, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useDropzone } from "react-dropzone";
import Sortable from "sortablejs";
import PhotoCropper from "./PhotoCropper";
import { processFileToResizedBlob } from "../utils/imageHelpers";

/*
  Key design:
  - photos[] array items are either { url } (already uploaded) or { file, preview } (local)
  - on save: upload any local items, build an array of URLs, save to Firestore
  - SortableJS used to reorder thumbnails
  - Dropzone supports drag-to-upload anywhere over the photo grid area
*/

export default function ListingForm({ listing = null, onSaved = () => {}, onCancel = () => {} }) {
  // form
  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    price: "",
    rent: "",
    description: "",
    photos: [], // array of { url } or { file, preview }
  });

  // crop modal
  const [cropFile, setCropFile] = useState(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  // loading states
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // sortable ref
  const photoContainerRef = useRef(null);

  useEffect(() => {
    if (listing) {
      // ensure we copy listing to keep consistent shape
      setForm({
        address: listing.address || "",
        city: listing.city || "",
        state: listing.state || "",
        price: listing.price || "",
        rent: listing.rent || "",
        description: listing.description || "",
        photos: (listing.photos || []).map((u) => ({ url: u })),
      });
    }
  }, [listing]);

  // initialize Sortable
  useEffect(() => {
    if (!photoContainerRef.current) return;
    const sortable = Sortable.create(photoContainerRef.current, {
      animation: 150,
      handle: ".drag-handle",
      onEnd: (evt) => {
        setForm((prev) => {
          const arr = [...prev.photos];
          const [moved] = arr.splice(evt.oldIndex, 1);
          arr.splice(evt.newIndex, 0, moved);
          return { ...prev, photos: arr };
        });
      },
    });
    return () => sortable.destroy();
  }, [form.photos.length]);

  // dropzone
  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    // we open cropper for the first file (user can upload multiple, we'll process sequentially)
    // store remaining files in an internal queue
    // simplest UX: open cropper for first file; when saved, continue with others automatically
    startCropQueue(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  // crop queue to handle multiple drop files sequentially
  const cropQueueRef = useRef([]);
  function startCropQueue(files) {
    cropQueueRef.current = files.slice();
    openNextCrop();
  }
  function openNextCrop() {
    const next = cropQueueRef.current.shift();
    if (!next) {
      // queue done
      return;
    }
    setCropFile(next);
    setIsCropOpen(true);
  }

  // handle crop result (blob) -> create file and preview and append to photos
  async function handleCropDone(croppedBlob) {
    // convert blob to File so we can upload with name
    const fileName = `photo-${Date.now()}.jpg`;
    const file = new File([croppedBlob], fileName, { type: "image/jpeg" });

    // optionally further resize to max 1600 (processFileToResizedBlob returns a blob)
    const resizedBlob = await processFileToResizedBlob(file, 1600);
    const resizedFile = new File([resizedBlob], fileName, { type: "image/jpeg" });

    const preview = URL.createObjectURL(resizedFile);

    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, { file: resizedFile, preview }],
    }));

    setIsCropOpen(false);
    setCropFile(null);

    // continue with next file if exists
    if (cropQueueRef.current.length > 0) {
      openNextCrop();
    }
  }

  function handleCropCancel() {
    setIsCropOpen(false);
    setCropFile(null);
    // continue with next if any
    if (cropQueueRef.current.length > 0) {
      openNextCrop();
    }
  }

  // remove a photo (if it's uploaded url, optionally delete from storage on save/delete flow)
  function removePhoto(index) {
    setForm((prev) => {
      const arr = [...prev.photos];
      arr.splice(index, 1);
      return { ...prev, photos: arr };
    });
  }

  // set primary (move index to 0)
  function setPrimary(index) {
    setForm((prev) => {
      const arr = [...prev.photos];
      const [item] = arr.splice(index, 1);
      arr.unshift(item);
      return { ...prev, photos: arr };
    });
  }

  // upload local files (file objects) and return array of urls in the same order as photos array
  async function uploadLocalPhotos(listingId) {
    const urls = [];
    for (const p of form.photos) {
      if (p.url) {
        urls.push(p.url);
      } else if (p.file) {
        const path = `listings/${listingId}/${Date.now()}_${p.file.name}`;
        const sRef = storageRef(storage, path);
        await uploadBytes(sRef, p.file);
        const url = await getDownloadURL(sRef);
        urls.push(url);
      }
    }
    return urls;
  }

  // Save listing - create or update
  async function handleSave(e) {
    e?.preventDefault?.();
    setSaving(true);
    try {
      // validate
      if (!form.address || !form.city || !form.state) {
        alert("Please fill address, city, state.");
        setSaving(false);
        return;
      }

      let docId = listing?.id;
      if (!docId) {
        // create new doc with empty photos then upload
        const newDocRef = await addDoc(collection(db, "listings"), {
          address: form.address,
          city: form.city,
          state: form.state,
          price: Number(form.price || 0),
          rent: Number(form.rent || 0),
          description: form.description || "",
          photos: [],
          createdAt: serverTimestamp(),
        });
        docId = newDocRef.id;
      }

      setUploading(true);
      const urls = await uploadLocalPhotos(docId);
      setUploading(false);

      // update doc with final urls
      await updateDoc(doc(db, "listings", docId), {
        address: form.address,
        city: form.city,
        state: form.state,
        price: Number(form.price || 0),
        rent: Number(form.rent || 0),
        description: form.description || "",
        photos: urls,
        updatedAt: serverTimestamp(),
      });

      onSaved();
    } catch (err) {
      console.error("save error", err);
      alert("Save failed — check console.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-3">{listing ? "Edit Listing" : "Add Listing"}</h2>

      <form onSubmit={handleSave}>

        {/* basic fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input className="p-2 border rounded" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="p-2 border rounded" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="p-2 border rounded" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Purchase Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Monthly Rent" type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} />
        </div>

        <textarea className="w-full p-2 border rounded mb-3" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        {/* drag/drop area */}
        <div {...getRootProps()} className={`border-dashed border-2 p-4 rounded mb-3 ${isDragActive ? "border-blue-500 bg-blue-50" : "bg-white"}`}>
          <input {...getInputProps()} />
          <div className="flex items-center justify-between">
            <div>
              <strong>Photos</strong>
              <p className="text-sm text-gray-600">Drag images here or click to upload. You can crop each file before it’s added.</p>
            </div>
            <div>
              <button type="button" onClick={() => document.querySelector('input[type="file"]').click()} className="bg-blue-600 text-white px-3 py-2 rounded">
                Select Files
              </button>
            </div>
          </div>

          {/* photo grid (sortable) */}
          <div ref={photoContainerRef} className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-3">
            {form.photos.map((p, i) => (
              <div key={i} className="relative group border rounded overflow-hidden">
                <div className="drag-handle absolute left-1 top-1 bg-black/40 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 cursor-move">⇅</div>

                <img src={p.preview || p.url} alt={`photo-${i}`} className="w-full h-24 object-cover" />
                <div className="absolute top-1 right-1 flex gap-1">
                  <button type="button" onClick={() => setPrimary(i)} title="Make primary" className="bg-white text-xs px-1 rounded opacity-0 group-hover:opacity-100">★</button>
                  <button type="button" onClick={() => removePhoto(i)} title="Remove" className="bg-red-600 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100">✕</button>
                </div>
                {i === 0 && <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">Primary</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
          <button type="submit" disabled={saving || uploading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {saving ? "Saving..." : uploading ? "Uploading..." : listing ? "Update Listing" : "Create Listing"}
          </button>
        </div>
      </form>

      {/* crop modal */}
      {isCropOpen && cropFile && (
        <PhotoCropper
          file={cropFile}
          onCancel={handleCropCancel}
          onCropped={handleCropDone}
        />
      )}
    </div>
  );
}
