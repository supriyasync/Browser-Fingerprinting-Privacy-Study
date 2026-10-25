// collector/signals/featureSignals.js

export function collectFeatureSignals() {
  return {
    localStorage: {
      value: typeof Storage !== "undefined" && !!window.localStorage,
      available: true,
      error: null,
      collectionMethod: "window.localStorage",
    },
    sessionStorage: {
      value: typeof Storage !== "undefined" && !!window.sessionStorage,
      available: true,
      error: null,
      collectionMethod: "window.sessionStorage",
    },
    indexedDB: {
      value: !!window.indexedDB,
      available: true,
      error: null,
      collectionMethod: "window.indexedDB",
    },
  };
}
