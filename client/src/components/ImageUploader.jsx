// client/src/components/ImageUploader.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import getCroppedImg, { compressImage } from "../utils/imageUtils";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

/**
 * Props:
 * - onUploadComplete(url)  : called when a single file finishes uploading
 * - folder (string)        : storage folder e.g. "listings"
 * - maxConcurrent (number) : optional
 */
export default function ImageUploader({ onUploadComplete = () => {}, folder = "listings" }) {
  const [cropSrc, setCropSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // upload queue
  const [queue, setQueue] = useState([]); // { id, file, name, status, progress, task? }
  const idRef = useRef(0);

  const onDrop = useCallback((accepted) => {
    if (!accepted || accepted.length === 0) return;
    // add each file to queue; open crop for the first file
    const files = accepted.map((f) => {
      const id = ++idRef.current;
      return { id, file: f, name: f.name, status: "queued", progress: 0, task: null };
    });
    setQueue((q) => [...files, ...q]);
    // open crop for the first file
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  function onCropComplete(_, pixels) {
    setCroppedAreaPixels(pixels);
  }

  async function startUploadQueued(fileObj, croppedBlob = null) {
    // compress if not already compressed
    const sourceBlob = croppedBlob || fileObj.file;
    const compressed = await compressImage(sourceBlob, { maxSizeKB: 300, maxWidth: 1600 });

    const unique = `${Date.now()}-${fileObj.name.replace(/\s+/g, "_")}`;
    const path = `${folder}/${unique}`;
    const ref = storageRef(storage, path);
    const uploadTask = uploadBytesResumable(ref, compressed);

    // attach the task so we can cancel
    setQueue((q) => q.map((it) => (it.id === fileObj.id ? { ...it, status: "uploading", task: uploadTask } : it)));

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setQueue((q) => q.map((it) => (it.id === fileObj.id ? { ...it, progress: prog } : it)));
      },
      (err) => {
        console.error("Upload failed:", err);
        setQueue((q) => q.map((it) => (it.id === fileObj.id ? { ...it, status: "error" } : it)));
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setQueue((q) => q.map((it) => (it.id === fileObj.id ? { ...it, status: "done", progress: 100, task: null } : it)));
        onUploadComplete(url);
      }
    );
  }

  // Start upload for first queued file (if not uploading)
  useEffect(() => {
    const next = queue.find((it) => it.status === "queued");
    if (next) {
      // if there is a cropSrc and it's the same file as next.file, present crop step
      // But for simplicity: if cropSrc present start crop flow; else upload original
      if (cropSrc && queue[0] && queue[0].file === next.file) {
        // wait for user to finish crop (Save Crop button triggers upload)
      } else {
        // auto start upload with original file
        startUploadQueued(next);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  // Save the crop and upload the cropped image
  const saveCropAndUpload = async () => {
    try {
      if (!croppedAreaPixels) return;
      // last queued file is the one we were cropping (LIFO in onDrop)
      const working = queue[0];
      if (!working) return;

      const croppedBlob = await getCroppedImg(cropSrc, croppedAreaPixels);
      // clear crop UI
      setCropSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);

      // start upload with cropped blob
      await startUploadQueued(working, croppedBlob);

      // remove the local fileObj? we leave queue entry updated by startUploadQueued
    } catch (err) {
      console.error("Crop/upload failed", err);
      alert("Crop/upload failed - see console");
    }
  };

  const cancelUpload = (id) => {
    setQueue((q) => {
      const target = q.find((it) => it.id === id);
      if (target?.task && typeof target.task.cancel === "function") {
        try {
          target.task.cancel();
        } catch (e) {
          // ignore
        }
      }
      return q.filter((it) => it.id !== id);
    });
  };

  return (
    <div>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 rounded transition text-center ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-gray-600">
          Drag & drop images here, or click to browse (supports multi-upload)
        </p>
      </div>

      {/* Crop modal */}
      {cropSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white p-4 rounded w-[90%] max-w-3xl">
            <h4 className="font-semibold mb-3">Crop image</h4>
            <div style={{ position: "relative", width: "100%", height: 420 }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setCropSrc(null)}>
                Cancel
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={saveCropAndUpload}>
                Save & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload queue */}
      <div className="mt-3 space-y-2">
        {queue.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border rounded p-2 bg-white">
            <div className="flex-1">
              <div className="text-sm font-medium">{item.name}</div>

              {item.status === "uploading" && (
                <div className="mt-1">
                  <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
                    <div style={{ width: `${item.progress}%` }} className="h-2 bg-blue-500" />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.progress}%</div>
                </div>
              )}

              {item.status === "queued" && <div className="text-xs text-gray-500 mt-1">Queued</div>}
              {item.status === "done" && <div className="text-xs text-green-600 mt-1">Uploaded</div>}
              {item.status === "error" && <div className="text-xs text-red-600 mt-1">Error</div>}
            </div>

            <div className="flex gap-2">
              <button className="px-2 py-1 bg-gray-200 rounded text-xs" onClick={() => cancelUpload(item.id)}>
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
