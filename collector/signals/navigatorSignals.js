// collector/signals/navigatorSignals.js

// Helper to safely collect values and record availability
function safeCollect(label, collectionMethod, collectorFunc) {
  try {
    const value = collectorFunc();
    const isAvailable = value !== undefined && value !== null && value !== "";
    return {
      value: isAvailable ? value : null,
      available: isAvailable,
      error: null,
      collectionMethod: collectionMethod,
    };
  } catch (error) {
    return {
      value: null,
      available: false,
      error: error.name || error.message || "UnknownError",
      collectionMethod: collectionMethod,
    };
  }
}

export function collectNavigatorSignals() {
  return {
    userAgent: safeCollect(
      "User Agent",
      "navigator.userAgent",
      () => navigator.userAgent,
    ),
    languages: safeCollect("Browser Languages", "navigator.languages", () =>
      navigator.languages ? navigator.languages.join(", ") : null,
    ),
    platform: safeCollect(
      "Host Platform",
      "navigator.platform",
      () => navigator.platform,
    ),
    cookieEnabled: safeCollect(
      "Cookies Enabled",
      "navigator.cookieEnabled",
      () => navigator.cookieEnabled,
    ),
    hardwareConcurrency: safeCollect(
      "Hardware Concurrency",
      "navigator.hardwareConcurrency",
      () => navigator.hardwareConcurrency,
    ),
    deviceMemory: safeCollect(
      "Device Memory",
      "navigator.deviceMemory",
      () => navigator.deviceMemory,
    ),
  };
}
