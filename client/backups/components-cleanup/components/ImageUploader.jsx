// client/src/components/ImageUploader.jsx
import React, { useRef, useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { createThumbnailBlob } from "../utils/imageUtils";

export default function ImageUploader({ onUploaded = () => {}, folderPrefix = "listing_photos" }) {
  const inputRef = useRef(null);
  const [progresses, setProgresses] = useState([]); // array of {name, percent}

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const uploaded = [];

    for (const file of files) {
      // 1) generate a thumbnail Blob (client-side)
      const thumbBlob = await createThumbnailBlob(file, 480); // 480px wide thumbnail

      // 2) upload original
      const filename = `${folderPrefix}/${file.name.replace(/\s+/g, "_")}-${Date.now()}`;
      const fileRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(fileRef, file);

      // listen for progress
      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgresses((p) => {
              const others = p.filter((x) => x.name !== filename);
              return [...others, { name: filename, percent }];
            });
          },
          (err) => {
            console.error("upload error", err);
            reject(err);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);

            // 3) upload thumbnail
            const thumbPath = `${folderPrefix}/thumbs/${file.name.replace(/\s+/g, "_")}-${Date.now()}`;
            const thumbRef = ref(storage, thumbPath);
            const thumbTask = uploadBytesResumable(thumbRef, thumbBlob);

            thumbTask.on(
              "state_changed",
              (s) => {
                const percent = Math.round((s.bytesTransferred / s.totalBytes) * 100);
                setProgresses((p) => {
                  const others = p.filter((x) => x.name !== thumbPath && x.name !== filename);
                  return [...others, { name: thumbPath, percent }];
                });
              },
              (err) => {
                console.error("thumb upload error", err);
                reject(err);
              },
              async () => {
                const thumbnailUrl = await getDownloadURL(thumbTask.snapshot.ref);

                uploaded.push({
                  url,
                  thumbnailUrl,
                  path: filename,
                  thumbPath,
                });

                // remove progress entries for this file
                setProgresses((p) => p.filter((x) => x.name !== filename && x.name !== thumbPath));
                resolve();
              }
            );
          }
        );
      });
    }

    // call parent callback with array of uploaded file info
    if (uploaded.length) onUploaded(uploaded);
    // reset input
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} />
      <div className="mt-2">
        {progresses.map((p) => (
          <div key={p.name} className="mb-2">
            <div className="text-sm">{p.name.split("/").pop()}</div>
            <div className="w-full bg-gray-200 rounded h-2">
              <div style={{ width: `${p.percent}%` }} className="bg-blue-600 h-2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
