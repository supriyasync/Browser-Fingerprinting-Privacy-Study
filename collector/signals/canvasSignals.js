// collector/signals/canvasSignals.js

// Native Web Crypto API for hashing
async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function collectCanvasSignal() {
  try {
    const canvas = document.createElement("canvas");
    // Standardized dimensions across all runs
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return {
        value: null,
        available: false,
        error: "Canvas 2D context unavailable",
        collectionMethod: "HTMLCanvasElement.getContext('2d')",
      };
    }

    // Standardized drawing operations
    ctx.textBaseline = "top";
    ctx.font = "16px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, 100, 30);
    ctx.fillStyle = "#069";
    ctx.fillText("Browser fingerprint study", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Controlled measurement", 4, 35);

    const dataUrl = canvas.toDataURL();
    const hash = await sha256(dataUrl);

    return {
      value: hash,
      available: true,
      error: null,
      collectionMethod: "canvas.toDataURL() + SHA-256",
    };
  } catch (error) {
    return {
      value: null,
      available: false,
      error: error.name || error.message || "UnknownError",
      collectionMethod: "canvas.toDataURL() + SHA-256",
    };
  }
}
