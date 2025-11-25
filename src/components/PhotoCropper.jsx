// client/src/components/PhotoCropper.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";

/*
Props:
- file: File (original)
- onCropped: async function(blob) called with cropped image Blob
- onCancel: function() to close
*/

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = url;
  });
}

// helper to get cropped image blob using canvas
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
}

export default function PhotoCropper({ file, onCropped, onCancel }) {
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result);
    reader.readAsDataURL(file);
  }, [file]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleDone = useCallback(async () => {
    if (!imageDataUrl || !croppedAreaPixels) return;
    const blob = await getCroppedImg(imageDataUrl, croppedAreaPixels);
    onCropped(blob);
  }, [imageDataUrl, croppedAreaPixels, onCropped]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded p-4 max-w-xl w-full">
        <h3 className="text-lg font-semibold mb-2">Crop photo</h3>

        <div style={{ position: "relative", width: "100%", height: 400, background: "#333" }}>
          {imageDataUrl && (
            <Cropper
              image={imageDataUrl}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Zoom</span>
            <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
          </label>

          <div className="ml-auto flex gap-2">
            <button onClick={onCancel} className="px-3 py-2 bg-gray-500 text-white rounded">Cancel</button>
            <button onClick={handleDone} className="px-3 py-2 bg-blue-600 text-white rounded">Crop & Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}
