import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./config";

export async function searchListingsAI(text) {
  const all = await getDocs(collection(db, "listings"));
  const listings = all.docs.map((d) => ({ id: d.id, ...d.data() }));

  const queryLower = text.toLowerCase();

  // Search by:
  // - title
  // - description
  // - aiTags
  // - aiCaption
  return listings.filter((l) => {
    return (
      (l.title && l.title.toLowerCase().includes(queryLower)) ||
      (l.description && l.description.toLowerCase().includes(queryLower)) ||
      (l.aiCaption && l.aiCaption.toLowerCase().includes(queryLower)) ||
      (Array.isArray(l.aiTags) &&
        l.aiTags.some((tag) => tag.toLowerCase().includes(queryLower)))
    );
  });
}
