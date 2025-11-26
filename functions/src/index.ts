/**
 * index.ts
 * Firebase Functions entrypoint
 */

import { onDocumentWritten, type FirestoreEvent } from "firebase-functions/v2/firestore";

export const processListing = onDocumentWritten(
  "listings/{id}",
  async (event: FirestoreEvent<any>) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    const listingId = event.params.id;

    // Skip deletes
    if (!after) return;

    console.log("Processing listing:", listingId);

    // TODO: Call AI modules here (Vision, Pricing, Fraud, Description)
    // Example:
    // const vision = await generateAITags(after.imageUrls || []);
    // await updateDoc(doc(db, "listings", listingId), {
    //   aiTags: vision.tags,
    //   aiCaption: vision.caption,
    //   aiUpdatedAt: new Date().toISOString(),
    // });
  }
);
