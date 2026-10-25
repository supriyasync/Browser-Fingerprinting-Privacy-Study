// collector/signals/screenSignals.js

export function collectScreenSignals() {
  return {
    width: {
      value: screen.width,
      available: true,
      error: null,
      collectionMethod: "screen.width",
    },
    height: {
      value: screen.height,
      available: true,
      error: null,
      collectionMethod: "screen.height",
    },
    colorDepth: {
      value: screen.colorDepth,
      available: true,
      error: null,
      collectionMethod: "screen.colorDepth",
    },
    devicePixelRatio: {
      value: window.devicePixelRatio || null,
      available: !!window.devicePixelRatio,
      error: window.devicePixelRatio ? null : "Unavailable",
      collectionMethod: "window.devicePixelRatio",
    },
  };
}
