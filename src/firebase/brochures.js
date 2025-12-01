import { functions } from "./index.js";
import { httpsCallable } from "firebase/functions";

export async function generateBrochure(listingId) {
  const fn = httpsCallable(functions, "createListingBrochure");
  const result = await fn({ listingId });
  return result.data;
}


/**
 * Calls the Cloud Function to generate an MLS-style brochure
 * for a given listing and returns { storagePath }.
 */
export async function generateBrochureForListing(listingId) {
  if (!listingId) {
    throw new Error("listingId is required");
  }

  const fn = httpsCallable(functions, "createListingBrochure");
  const result = await fn({ listingId });
  return result.data; // { storagePath }
}
