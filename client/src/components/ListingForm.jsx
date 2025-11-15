import React, { useEffect, useState, useRef } from "react";
import {
  addDoc,
  updateDoc,
  collection,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Sortable from "sortablejs";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import Sortable from "sortablejs";


export default function ListingForm({ listing, onSaved, onCancel }) {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [price, setPrice] = useState("");
  const [rent, setRent] = useState("");
  const [photos, setPhotos] = useState([]);

  const photoContainerRef = useRef(null);
  const dropOverlayRef = useRef(null);
  const cropper = useRef(null);
  const croppingImageRef = useRef(null);

  const [cropFile, setCropFile] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const storage = getStorage();

  // ---------------------------
  // LOAD EXISTING LISTING VALUES
  // ---------------------------
  useEffect(() => {
    if (listing) {
      setAddress(listing.address || "");
      setCity(listing.city || "");
      setStateVal(listing.state || "");
      setPrice(listing.price || "");
      setRent(listing.rent || "");
      setPhotos(listing.photos || []);
    }
  }, [listing]);

  // ---------------------------
  // SORTABLEJS INIT
  // ---------------------------
  useEffect(() => {
    if (!photoContainerRef.current) return;

    Sortable.create(photoContainerRef.current, {
      animation: 150,
      onEnd: (evt) => {
        const reordered = [...photos];
        const [moved] = reordered.splice(evt.oldIndex, 1);
        reordered.splice(evt.newIndex, 0, moved);
        setPhotos(reordered);
      },
    });
  }, [photos]);

  // ---------------------------
  // DRAG & DROP UPLOAD SUPPORT
  // ---------------------------
  useEffect(() => {
    const container = photoContainerRef.current;
    const overlay = dropOverlayRef.current;
    if (!container || !overlay) return;

    const showOverlay = () => overlay.classList.remove("hidden");
    const hideOverlay = () => overlay.classList.add("hidden");

    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      prevent(e);
      hideOverlay();

      if (e.dataTransfer.files.length > 0) {
        for (const file of e.dataTransfer.files) {
          beginCrop(file);
        }
      }
    };

    container.addEventListener("dragover", prevent);
    container.addEventListener("dragenter", showOverlay);
    container.addEventListener("dragleave", hideOverlay);
    container.addEventListener("drop", handleDrop);

    return () => {
      container.removeEventListener("dragover", prevent);
      container.removeEventListener("dragenter", showOverlay);
      container.removeEventListener("dragleave", hideOverlay);
      container.removeEventListener("drop", handleDrop);
    };
  }, []);

  // ---------------------------
  // OPEN CROPPER MODAL
  // ---------------------------
  const beginCrop = (file) => {
    setCropFile(file);
    setShowCropper(true);
  };

  // ---------------------------
  // APPLY CROPPING
  // ---------------------------
  const finishCropping = async () => {
    if (!cropper.current) return;

    const canvas = cropper.current.getCroppedCanvas({
      width: 1600,
      height: 1066,
      fillColor: "#fff",
    });

    canvas.toBlob(async (blob) => {
      const fileName = `photo-${Date.now()}.jpg`;
      const storageRef = ref(storage, `listing_photos/${fileName}`);

      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      setPhotos((prev) => [...prev, url]);

      cropper.current.destroy();
      cropper.current = null;
      setShowCropper(false);
      setCropFile(null);
    }, "image/jpeg", 0.9);
  };

  // ---------------------------
  // DELETE PHOTO
  // ---------------------------
  const removePhoto = async (url) => {
    if (!window.confirm("Remove this photo?")) return;

    try {
      // Try deleting from storage (if it's a Firebase URL)
      if (url.includes("firebase")) {
        const path = url.split("/o/")[1].split("?")[0];
        const decodedPath = decodeURIComponent(path);
        const fileRef = ref(storage, decodedPath);
        await deleteObject(fileRef);
      }
    } catch (err) {
      console.warn("Storage delete failed (safe to ignore):", err);
    }

    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  // ---------------------------
  // SUBMIT LISTING
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      address,
      city,
      state: stateVal,
      price: Number(price),
      rent: Number(rent),
      photos,
      updatedAt: serverTimestamp(),
    };

    try {
      if (listing?.id) {
        await updateDoc(doc(db, "listings", listing.id), data);
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, "listings"), data);
      }
      onSaved();
    } catch (err) {
      console.error("Save error:", err);
      alert("Save failed. Check console.");
    }
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-3">
        {listing ? "Edit Listing" : "Add Listing"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input className="input" placeholder="Address"
            value={address} onChange={(e) => setAddress(e.target.value)} required />

          <input className="input" placeholder="City"
            value={city} onChange={(e) => setCity(e.target.value)} required />

          <input className="input" placeholder="State"
            value={stateVal} onChange={(e) => setStateVal(e.target.value)} required />

          <input className="input" placeholder="Price" type="number"
            value={price} onChange={(e) => setPrice(e.target.value)} required />

          <input className="input" placeholder="Rent" type="number"
            value={rent} onChange={(e) => setRent(e.target.value)} />
        </div>

        {/* --------------------------- */}
        {/* PHOTO DRAG/DROP AREA */}
        {/* --------------------------- */}
        <div className="relative border rounded p-4 mb-4 bg-gray-50">
          <div
            ref={dropOverlayRef}
            className="absolute inset-0 bg-blue-200 bg-opacity-40 border-4 border-blue-500 rounded hidden flex items-center justify-center text-xl font-bold"
          >
            Drop to Upload
          </div>

          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Photos</h3>

            <label className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded">
              Upload Photos
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) =>
                  [...e.target.files].forEach((f) => beginCrop(f))
                }
              />
            </label>
          </div>

          <div
            ref={photoContainerRef}
            className="grid grid-cols-3 gap-3"
            style={{ minHeight: 120 }}
          >
            {photos.map((p, i) => (
              <div key={i} className="relative group">
                <img
                  src={p}
                  className="w-full h-24 object-cover rounded border"
                  alt=""
                />
                <button
                  type="button"
                  onClick={() => removePhoto(p)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SAVE / CANCEL */}
        <div className="flex gap-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            Save
          </button>
          <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </form>

      {/* --------------------------- */}
      {/* CROPPER MODAL */}
      {/* --------------------------- */}
      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-xl max-w-xl w-full">
            <h3 className="font-bold mb-2">Crop Photo</h3>

            <img
              ref={croppingImageRef}
              alt="Crop"
              style={{ maxHeight: "60vh", width: "100%" }}
            />

            <div className="flex justify-end mt-3 gap-2">
              <button
                onClick={() => {
                  cropper.current.destroy();
                  cropper.current = null;
                  setShowCropper(false);
                }}
                className="px-3 py-1 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={finishCropping}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------
// INITIALIZE CROPPER WHEN FILE SELECTED
// ---------------------------
useEffect(() => {
  if (!cropFile) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = croppingImageRef.current;
    if (!img) return;

    img.src = reader.result;

    if (cropper.current) cropper.current.destroy();

    setTimeout(() => {
      cropper.current = new Cropper(img, {
        aspectRatio: 4 / 3,
        viewMode: 1,
        autoCropArea: 1,
      });
    }, 50);
  };

  reader.readAsDataURL(cropFile);
}, [cropFile]);
