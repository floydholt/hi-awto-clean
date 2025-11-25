import { storage } from "../firebase";
import { ref, deleteObject } from "firebase/storage";

export async function deleteListingImages(photoUrls = []) {
  if (!Array.isArray(photoUrls)) return;

  for (const url of photoUrls) {
    try {
      const path = decodeURIComponent(url.split("/o/")[1].split("?")[0]);
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      console.log("Deleted:", path);
    } catch (err) {
      console.warn("Could not delete image:", url, err);
    }
  }
}
