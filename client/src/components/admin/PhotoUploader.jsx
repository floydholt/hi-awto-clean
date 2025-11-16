import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import Sortable from "sortablejs";
import { ref } from "firebase/storage";

import { storage } from "../../firebase"; 
import getCroppedImg, { compressImage } from "../../utils/imageUtils";
import { uploadWithProgress } from "../../utils/uploadManager";

export default function PhotoUploader({ photos, setPhotos }) {
  const [rawFiles, setRawFiles] = useState([]);
  const [cropSrc, setCropSrc] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [queue, setQueue] = useState([]);        // upload tasks
  const [uploading, setUploading] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [cancelTokens, setCancelTokens] = useState({});

  const sortableRef = useRef(null);

  /** ------------------------------------------------
   * DROPZONE
   * ------------------------------------------------ */
  const onDrop = useCallback(async (accepted) => {
    if (!accepted.length) return;

    const file = accepted[0];

    const compressed = await compressImage(file, 0.8);

    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result);
      setRawFiles((prev) => [...prev, compressed]);
    };
    reader.readAsDataURL(compressed);
  }, []);

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({ onDrop, accept: { "image/*": [] } });

  /** ------------------------------------------------
   * SORTABLE
   * ------------------------------------------------ */
  useEffect(() => {
    if (sortableRef.current) {
      Sortable.create(sortableRef.current, {
        animation: 150,
        ghostClass: "opacity-40",
        onEnd: (evt) => {
          const arr = [...photos];
          const [removed] = arr.splice(evt.oldIndex, 1);
          arr.splice(evt.newIndex, 0, removed);
          setPhotos(arr);
        },
      });
    }
  }, [photos, setPhotos]);

  /** ------------------------------------------------
   * CROP
   * ------------------------------------------------ */
  const onCropComplete = useCallback((_, area) => {
    setCroppedAreaPixels(area);
  }, []);

  const applyCrop = async () => {
    const fileBlob = rawFiles[rawFiles.length - 1];

    const croppedBlob = await getCroppedImg(
      cropSrc,
      croppedAreaPixels,
      rotation
    );

    // Preview
    const previewUrl = URL.createObjectURL(croppedBlob);

    const itemId = "queue-" + Date.now();

    setQueue((prev) => [
      ...prev,
      {
        id: itemId,
        blob: croppedBlob,
        preview: previewUrl,
        name: fileBlob.name || "upload.jpg",
      },
    ]);

    setCropSrc(null);
  };

  const closeCrop = () => setCropSrc(null);

  /** ------------------------------------------------
   * UPLOAD QUEUE PROCESSOR
   * ------------------------------------------------ */
  useEffect(() => {
    if (!uploading && queue.length > 0) {
      processNextUpload();
    }
  }, [queue, uploading]);

  const processNextUpload = () => {
    if (queue.length === 0) return;

    setUploading(true);

    const next = queue[0];

    const fileName = `${Date.now()}-${next.name}`;
    const storageRef = ref(storage, `listings/${fileName}`);

    // Start upload
    const task = uploadWithProgress(storageRef, next.blob, {
      onProgress: (pct) => {
        setProgressMap((prev) => ({ ...prev, [next.id]: pct }));
      },
      onComplete: (url) => {
        setPhotos((prev) => [...prev, url]);

        finishTask(next.id);
      },
      onError: (err) => {
        console.error("Upload failed:", err);
        finishTask(next.id);
      },
    });

    // Store cancel token
    setCancelTokens((prev) => ({ ...prev, [next.id]: task }));
  };

  const finishTask = (id) => {
    setQueue((prev) => prev.filter((x) => x.id !== id));

    setCancelTokens((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });

    setUploading(false);
  };

  /** ------------------------------------------------
   * CANCEL UPLOAD
   * ------------------------------------------------ */
  const cancelUpload = (id) => {
    if (cancelTokens[id]) {
      cancelTokens[id].cancel(); // Firebase method
    }
    finishTask(id);
  };

  /** ------------------------------------------------
   * UI
   * ------------------------------------------------ */
  return (
    <>
      {/* DROPZONE */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-400 bg-gray-50 hover:bg-gray-100"}
        `}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive ? "Drop to upload…" : "Drag & drop or click to upload"}
        </p>
      </div>

      {/* SORTABLE THUMBNAILS */}
      <div ref={sortableRef} className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
        {photos.map((p, i) => (
          <div key={i} className="relative group">
            <img
              src={p.url || p}
              alt=""
              className="w-full h-24 object-cover rounded shadow"
            />

            <button
              onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
              className="
                absolute top-1 right-1 px-2 py-1 text-xs rounded
                bg-red-600 text-white opacity-0 group-hover:opacity-100 transition
              "
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* UPLOAD QUEUE */}
      {queue.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold">Uploading…</h3>

          {queue.map((q) => (
            <div key={q.id} className="bg-gray-100 p-3 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <img
                  src={q.preview}
                  className="w-16 h-16 object-cover rounded"
                  alt="preview"
                />

                <div className="flex-1">
                  <div className="text-sm font-medium">{q.name}</div>

                  <div className="w-full h-2 bg-gray-300 rounded mt-2">
                    <div
                      className="h-full bg-blue-600 rounded"
                      style={{ width: `${progressMap[q.id] || 5}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => cancelUpload(q.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CROP MODAL */}
      {cropSrc && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl w-[90%] max-w-xl">
            <h2 className="text-lg font-semibold mb-3">Crop Image</h2>

            <div className="relative w-full h-72 bg-gray-200 rounded">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="flex justify-between mt-5">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={closeCrop}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={applyCrop}>
                Save Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
