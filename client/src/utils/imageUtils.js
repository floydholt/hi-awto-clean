/**
 * getCroppedImg(imageSrc, pixelCrop)
 * Returns a Blob of the cropped image (JPEG)
 */
export default async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(pixelCrop.width));
  canvas.height = Math.max(1, Math.round(pixelCrop.height));

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

  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
  });
}

/**
 * compressImage(blob, {maxSizeKB, maxWidth})
 * Compress an image Blob down to a max file size (in KB)
 */
export async function compressImage(
  blob,
  { maxSizeKB = 200, maxWidth = 1600 } = {}
) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = URL.createObjectURL(blob);
  });

  // Auto-scale to width
  const scale = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Try gradually reducing quality
  let quality = 0.9;
  let compressedBlob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
  );

  const targetBytes = maxSizeKB * 1024;

  while (compressedBlob.size > targetBytes && quality > 0.25) {
    quality -= 0.1;

    // Recompress
    // eslint-disable-next-line no-await-in-loop
    compressedBlob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality)
    );
  }

  return compressedBlob;
}

/**
 * resizeImages(files, quality)
 * Returns an array of compressed Blobs
 */
export async function resizeImages(files, quality = 0.7) {
  const result = [];

  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    const blob = await compressImage(file, { maxSizeKB: 200 });
    result.push(blob);
  }

  return result;
}
