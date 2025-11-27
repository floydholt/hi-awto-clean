import { doc, getDoc } from "firebase/firestore";
import { db } from "./config";

export async function getListingById(id) {
  const ref = doc(db, "listings", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data();

  const urls = Array.isArray(data.imageUrls) ? data.imageUrls : [];
  const analysis = Array.isArray(data.photoAnalysis)
    ? data.photoAnalysis
    : [];

  if (!urls.length) return data;

  // Pair urls + analysis
  let items = urls.map((url, i) => ({
    url,
    ...analysis[i],
  }));

  // Sort by room type priority first
  const order = [
    "exterior",
    "living_room",
    "kitchen",
    "bedroom",
    "bathroom",
    "yard",
    "floorplan",
    "other",
  ];

  items.sort((a, b) => {
    const aIndex = order.indexOf(a.roomType || "other");
    const bIndex = order.indexOf(b.roomType || "other");
    if (aIndex !== bIndex) return aIndex - bIndex;

    return (b.qualityScore ?? 0) - (a.qualityScore ?? 0);
  });

  // Move bestCoverIndex item to front
  if (typeof data.bestCoverIndex === "number") {
    const best = items[data.bestCoverIndex];
    if (best) {
      items = [best, ...items.filter((i) => i !== best)];
    }
  }

  return {
    ...data,
    imageUrls: items.map((i) => i.url),
    photoAnalysis: items,
  };
}
