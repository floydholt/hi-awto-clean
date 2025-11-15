import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import Cropper from "react-easy-crop";
import Sortable from "sortablejs";
import { useDropzone } from "react-dropzone";

import getCroppedImg from "../../utils/imageUtils";

export default function ListingForm({ listing, onSaved, onCancel }) {
  const isEdit = Boolean(listing?.id);

  // form fields
  const [address, setAddress] = useState(listing?.address || "");
  const [city, setCity] = useState(listing?.city || "");
  const [stateVal, setStateVal] = useState(listing?.state || "");
  const [zip, setZip] = useState(listing?.zip || "");
  const [price, setPrice] = useState(listing?.price || "");
  const [rent, setRent] = useState(listing?.rent || "");
  const [description, setDescription] = useState(listing?.description || "");

  // photo handling
  const [photos, setPhotos] = useState(listing?.photos || []);
  const [rawFiles, setRawFiles] = useState([]);

  // cropping
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // sortable ref
  const sortableRef = useRef(null);

  /** --------------------------
   *  INIT DROPZONE
   * -------------------------- */
  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles.length) return;

    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result);
      setRawFiles((prev) => [...prev, file]);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({ onDrop, accept: { "image/*": [] } });

  /** --------------------------
   *  SORTABLEJS INIT
   * -------------------------- */
  useEffect(() => {
    if (sortableRef.current) {
      Sortable.create(sortableRef.current, {
        animation: 150,
        onEnd: (evt) => {
          const reordered = [...photos];
          const [removed] = reordered.splice(evt.oldIndex, 1);
          reordered.splice(evt.newIndex, 0, removed);
          setPhotos(reordered);
        },
      });
    }
  }, [photos]);

  /** --------------------------
   *  CROPPER LOGIC
   * -------------------------- */
  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const finishCrop = async () => {
    try {
      const file = rawFiles[rawFiles.length - 1];
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);

      const url = await uploadPhoto(croppedBlob, file.name);
      setPhotos((prev) => [...prev, url]);

      setCropImageSrc(null);
    } catch (err) {
      console.error("Crop failed", err);
      alert("Crop failed.");
    }
  };

  /** --------------------------
   *  UPLOAD FILE TO STORAGE
   * -------------------------- */
  const uploadPhoto = async (blob, originalName) => {
    const fileName = `${Date.now()}-${originalName}`;
    const path = `listings/${fileName}`;

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  /** --------------------------
   *  SAVE LISTING
   * -------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      address,
      city,
      state: stateVal,
      zip,
      price: Number(price),
      rent: Number(rent),
      description,
      photos,
      updatedAt: serverTimestamp(),
    };

    try {
      if (isEdit) {
        await updateDoc(doc(db, "listings", listing.id), payload);
      } else {
        await addDoc(collection(db, "listings"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      onSaved();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed. Check console.");
    }
  };

  /** --------------------------
   *  UI
   * -------------------------- */
  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">

      {/* ---------------- CROP MODAL ---------------- */}
      {cropImageSrc && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl w-[90%] max-w-lg">
            <h3 className="text-lg font-semibold mb-2">Crop Image</h3>
            <div className="relative w-full h-64 bg-gray-200">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="mt-4 flex justify-between">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setCropImageSrc(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={finishCrop}
              >
                Save Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- FORM ---------------- */}
      <h2 className="text-2xl font-semibold">
        {isEdit ? "Edit Listing" : "Add New Listing"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ADDRESS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="input" placeholder="Address"
            value={address} onChange={(e) => setAddress(e.target.value)} />

          <input className="input" placeholder="City"
            value={city} onChange={(e) => setCity(e.target.value)} />

          <input className="input" placeholder="State"
            value={stateVal} onChange={(e) => setStateVal(e.target.value)} />

          <input className="input" placeholder="Zip"
            value={zip} onChange={(e) => setZip(e.target.value)} />
        </div>

        {/* PRICE & RENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="input" placeholder="Price"
            type="number" value={price}
            onChange={(e) => setPrice(e.target.value)} />

          <input className="input" placeholder="Monthly Rent"
            type="number" value={rent}
            onChange={(e) => setRent(e.target.value)} />
        </div>

        {/* DESCRIPTION */}
        <textarea
          className="input h-24"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* ---------------- PHOTO UPLOAD ---------------- */}
        <div>
          <h3 className="font-semibold mb-1">Photos</h3>

          {/* drag-and-drop zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition 
              ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-400"}
            `}
          >
            <input {...getInputProps()} />
            <p>{isDragActive ? "Drop the image…" : "Drag & drop or click to upload"}</p>
          </div>

          {/* sortable thumbnails */}
          <div
            ref={sortableRef}
            className="grid grid-cols-3 gap-3 mt-4"
          >
            {photos.map((p, i) => (
              <div key={p} className="relative">
                <img
                  src={p}
                  alt=""
                  className="w-full h-24 object-cover rounded border"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded"
          >
            {isEdit ? "Update Listing" : "Create Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
