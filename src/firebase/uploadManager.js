// src/firebase/uploadManager.js
import { storage } from "./index.js";
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

/* ---------------------------------------------------------
   SIMPLE UPLOAD (no progress)
--------------------------------------------------------- */
export async function uploadImage(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

/* ---------------------------------------------------------
   RESUMABLE UPLOAD (with progress)
--------------------------------------------------------- */
export function uploadResumable(file, path, onProgress, onComplete, onError) {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      if (onProgress) onProgress(snapshot);
    },
    (error) => {
      if (onError) onError(error);
    },
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      if (onComplete) onComplete(downloadURL);
    }
  );

  return uploadTask;
}

/* ---------------------------------------------------------
   UPLOAD MULTIPLE LISTING IMAGES (legacy support)
--------------------------------------------------------- */

export async function uploadListingImages(listingId, files) {
  if (!listingId) throw new Error("listingId is required");
  if (!files?.length) return [];

  const urls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const path = `listings/${listingId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    urls.push(downloadURL);
  }

  return urls;
}

/* ---------------------------------------------------------
   UPLOAD USER AVATAR (legacy support)
--------------------------------------------------------- */

export async function uploadAvatar(userId, file) {
  if (!userId) throw new Error("userId is required");
  if (!file) throw new Error("Avatar file is required");

  const path = `avatars/${userId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);

  return await getDownloadURL(storageRef);
}
