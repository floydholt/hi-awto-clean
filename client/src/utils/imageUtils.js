// client/src/utils/imageUtils.js
// Helpers: getCroppedImg and compressImage

/**
 * getCroppedImg(imageSrc, pixelCrop) -> returns a Blob of the cropped image (PNG)
 * `pixelCrop` object shape: { x, y, width, height }
 */
export default async function getCroppedImg(imageSrc, pixelCrop) {
  // load image
  const image = await new Promise((res, rej) => {
    const img = new Image();
    img.addEventListener("load", () => res(img));
    img.addEventListener("error", (e) => rej(e));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(pixelCrop.width));
  canvas.height = Math.max(1, Math.round(pixelCrop.height));
  const ctx = canvas.getContext("2d");

  // draw the cropped area onto the canvas
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

  // convert to blob
  return await new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
}

/**
 * compressImage(blob, maxSizeKB = 200, maxWidth = 1600) -> returns compressed Blob (JPEG)
 */
export async function compressImage(blob, { maxSizeKB = 200, maxWidth = 1600 } = {}) {
  const image = await new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = (e) => rej(e);
    img.setAttribute("crossOrigin", "anonymous");
    img.src = URL.createObjectURL(blob);
  });

  const scale = Math.min(1, maxWidth / image.width || 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  let quality = 0.9;
  let compressedBlob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
  );

  // loop to reduce quality if above target size
  const targetBytes = maxSizeKB * 1024;
  while (compressedBlob.size > targetBytes && quality > 0.3) {
    quality -= 0.1;
    // eslint-disable-next-line no-await-in-loop
    compressedBlob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );
  }

  return compressedBlob;
}
