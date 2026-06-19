// @ts-nocheck
import { fetchAnalytics, fetchHotspots } from "./api";

/**
 * Silently warms up the backend APIs on app load to prevent cold-start latency.
 * Catches and ignores any errors so it doesn't affect the user interface.
 */
export async function warmupBackend() {
  try {
    // Run both calls concurrently without awaiting their success in the main thread
    Promise.allSettled([
      fetchAnalytics(),
      fetchHotspots()
    ]);
    console.log("Backend warmup initiated");
  } catch (e) {
    // Silently ignore errors
  }
}
