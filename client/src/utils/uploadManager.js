// client/src/utils/uploadManager.js

import { uploadBytesResumable, getDownloadURL } from "firebase/storage";

/**
 * Uploads a Blob using Firebase Storage and provides:
 *  - Progress updates
 *  - Cancel token
 *  - Completion callback
 */
export function uploadWithProgress(storageRef, fileBlob, callbacks) {
  const { onProgress, onComplete, onError } = callbacks;

  const task = uploadBytesResumable(storageRef, fileBlob);

  task.on(
    "state_changed",
    (snapshot) => {
      const pct = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );
      onProgress && onProgress(pct);
    },
    (err) => {
      onError && onError(err);
    },
    async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      onComplete && onComplete(url);
    }
  );

  return task; // cancel token
}
