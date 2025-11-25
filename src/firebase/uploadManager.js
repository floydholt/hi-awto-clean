// src/firebase/uploadManager.js
import { ref, uploadBytesResumable, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config.js";

// ------------------------------------------
// 1) Chat attachments with progress
// ------------------------------------------
export async function uploadChatAttachmentsWithProgress(threadId, files, onProgress) {
  if (!threadId || !files || files.length === 0) return [];

  const uploads = files.map(
    (file, index) =>
      new Promise((resolve, reject) => {
        const safeName = file.name.replace(/\s+/g, "_");
        const path = `chatAttachments/${threadId}/${Date.now()}_${safeName}`;
        const fileRef = ref(storage, path);

        const task = uploadBytesResumable(fileRef, file);

        // Progress tracking
        task.on(
          "state_changed",
          (snapshot) => {
            const percent = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );

            if (typeof onProgress === "function") {
              onProgress(index, percent);
            }
          },
          reject,
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve({
              url,
              name: file.name,
              contentType: file.type,
              size: file.size,
            });
          }
        );
      })
  );

  return Promise.all(uploads);
}

// ------------------------------------------
// 2) Listing images (CreateListing)
//    Signature: uploadListingImages(files: File[]) => Promise<string[]>
// ------------------------------------------
export async function uploadListingImages(files) {
  if (!files || files.length === 0) return [];

  const uploads = files.map(
    (file) =>
      new Promise((resolve, reject) => {
        const safeName = file.name.replace(/\s+/g, "_");
        const path = `listingImages/${Date.now()}_${safeName}`;
        const fileRef = ref(storage, path);

        const task = uploadBytesResumable(fileRef, file);

        task.on(
          "state_changed",
          () => {
            // We don't surface per-image progress here for listings,
            // but this is where you'd do it if you wanted.
          },
          reject,
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve(url);
          }
        );
      })
  );

  return Promise.all(uploads);
}

// ------------------------------------------
// 3) Avatar upload (Profile)
//    Signature: uploadAvatar(file: File) => Promise<string>
// ------------------------------------------
export async function uploadAvatar(file) {
  if (!file) return "";

  const safeName = file.name.replace(/\s+/g, "_");
  const path = `avatars/${Date.now()}_${safeName}`;
  const fileRef = ref(storage, path);

  // Avatar is usually single & small, simple upload is fine
  const snapshot = await uploadBytes(fileRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}
