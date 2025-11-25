// src/firebase/aiTags.js
import { getApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

/**
 * analyzeImage(imageUrl)
 * Calls the Cloud Function, returns:
 * {
 *   tags: string[],
 *   rawLabels: [...],
 *   caption: string | null
 * }
 */
export async function analyzeImage(imageUrl) {
  if (!imageUrl) return { tags: [], caption: null };

  const app = getApp();
  const functions = getFunctions(app);
  const analyzeImageFn = httpsCallable(functions, "analyzeImage");

  const result = await analyzeImageFn({ imageUrl });
  return result?.data || { tags: [], caption: null };
}
