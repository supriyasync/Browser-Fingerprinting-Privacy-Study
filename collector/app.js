// DOM Elements
const metaInputs = document.querySelectorAll(".meta-input");
const runBtn = document.getElementById("run-btn");
const downloadBtn = document.getElementById("download-btn");
const signalsBody = document.getElementById("signals-body");

// Global state to hold the JSON data before downloading
let currentProfileData = null;

// Validation: Ensure all inputs are filled before allowing a run or download
function validateInputs() {
  let allFilled = true;
  metaInputs.forEach((input) => {
    if (input.value.trim() === "") {
      allFilled = false;
    }
  });

  // The Run button unlocks as soon as fields are filled
  runBtn.disabled = !allFilled;

  // The Download button only unlocks if fields are filled AND a run has been completed
  downloadBtn.disabled = !allFilled || currentProfileData === null;
}

// Listen for keystrokes to dynamically enable/disable buttons
metaInputs.forEach((input) => {
  input.addEventListener("input", validateInputs);
});

// Run validation once on initial load to lock everything down
validateInputs();

// ---- Signal Collection & UI Logic ---- //

function getCanvasFingerprint() {
  const canvas = document.getElementById("fingerprint-canvas");
  const ctx = canvas.getContext("2d");

  ctx.textBaseline = "top";
  ctx.font = "14px Arial";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);

  ctx.fillStyle = "#069";
  ctx.fillText("Browser Fingerprint 😃", 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText("Browser Fingerprint 😃", 4, 17);

  return canvas.toDataURL();
}

async function collectSignals() {
  const signals = [];

  // 1. User Agent
  signals.push({
    name: "User Agent",
    value: navigator.userAgent,
    status: navigator.userAgent ? "Available" : "Blocked",
  });

  // 2. Screen Resolution & Color Depth
  signals.push({
    name: "Screen Resolution",
    value: `${window.screen.width}x${window.screen.height} (${window.screen.colorDepth}-bit)`,
    status: "Available",
  });

  // 3. Do Not Track (DNT)
  const dnt =
    navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
  signals.push({
    name: "Do Not Track (DNT)",
    value:
      dnt === "1" || dnt === "yes"
        ? "Enabled"
        : dnt === "0" || dnt === "no"
          ? "Disabled"
          : "Unspecified",
    status: "Available",
  });

  // 4. Timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    signals.push({ name: "Timezone", value: tz, status: "Available" });
  } catch (e) {
    signals.push({
      name: "Timezone",
      value: "N/A",
      status: "Blocked",
      notes: e.message,
    });
  }

  // 5. Language Profile
  signals.push({
    name: "Languages",
    value: navigator.languages
      ? navigator.languages.join(", ")
      : navigator.language,
    status: "Available",
  });

  // 6. Hardware Concurrency (CPU Cores)
  signals.push({
    name: "Hardware Concurrency",
    value: navigator.hardwareConcurrency
      ? `${navigator.hardwareConcurrency} Cores`
      : "N/A",
    status: navigator.hardwareConcurrency ? "Available" : "Blocked",
  });

  // 7. Device Memory (RAM)
  signals.push({
    name: "Device Memory",
    value: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "N/A",
    status: navigator.deviceMemory ? "Available" : "Blocked",
    notes: navigator.deviceMemory ? "" : "API not supported in this browser",
  });

  // 8. Canvas Fingerprint
  try {
    const canvasData = getCanvasFingerprint();
    const hash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(canvasData),
    );
    const hashHex = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    signals.push({
      name: "Canvas Fingerprint",
      value: hashHex.substring(0, 16) + "...",
      status: "Available",
      notes: "Successfully hashed",
    });
  } catch (e) {
    signals.push({
      name: "Canvas Fingerprint",
      value: "N/A",
      status: "Blocked",
      notes: e.message,
    });
  }

  // 9. WebGL Renderer
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      signals.push({
        name: "WebGL Renderer",
        value: `${vendor} ~ ${renderer}`,
        status: "Available",
      });
    } else {
      throw new Error("WebGL not supported");
    }
  } catch (e) {
    signals.push({
      name: "WebGL Renderer",
      value: "N/A",
      status: "Blocked",
      notes: "WebGL disabled or blocked",
    });
  }

  // 10. AudioContext Base Latency
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    signals.push({
      name: "Audio Base Latency",
      value: audioCtx.baseLatency
        ? audioCtx.baseLatency.toString()
        : "Fallback",
      status: "Available",
    });
    audioCtx.close();
  } catch (e) {
    signals.push({
      name: "Audio Context",
      value: "N/A",
      status: "Blocked",
      notes: "Audio API blocked",
    });
  }

  return signals;
}

function renderTable(signals) {
  signalsBody.innerHTML = ""; // Clear previous table data

  signals.forEach((signal) => {
    const tr = document.createElement("tr");

    let statusClass = "status-success";
    if (signal.status === "Blocked") statusClass = "status-error";
    else if (signal.status === "Unspecified" || signal.status === "Spoofed")
      statusClass = "status-warning";

    tr.innerHTML = `
            <td><strong>${signal.name}</strong></td>
            <td class="${statusClass}">${signal.status}</td>
            <td style="font-family: monospace; word-break: break-all;">${signal.value}</td>
            <td>${signal.notes || "-"}</td>
        `;
    signalsBody.appendChild(tr);
  });
}

// Main execution function
async function collectAndDisplay() {
  runBtn.textContent = "Collecting...";
  runBtn.disabled = true;

  try {
    const signals = await collectSignals();
    renderTable(signals);

    // Build the dataset for the JSON export
    currentProfileData = {
      metadata: {
        configId: document.getElementById("config-id").value.trim(),
        browser: document.getElementById("browser-name").value.trim(),
        version: document.getElementById("browser-version").value.trim(),
        os: document.getElementById("os-name").value.trim(),
        mode: document.getElementById("privacy-mode").value.trim(),
        runNumber: document.getElementById("run-number").value.trim(),
        timestamp: new Date().toISOString(),
      },
      signals: signals,
    };

    // Re-validate to unlock the download button now that data exists
    validateInputs();
  } catch (error) {
    console.error("Collection failed:", error);
    alert("An error occurred during collection. Check the console.");
  } finally {
    runBtn.textContent = "Run Collection";
    runBtn.disabled = false;
  }
}

// Download function
function downloadJSON() {
  if (!currentProfileData) return;

  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(currentProfileData, null, 2));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);

  const configId = document.getElementById("config-id").value || "profile";
  const runNum = document.getElementById("run-number").value || "01";

  downloadAnchorNode.setAttribute("download", `${configId}-run-${runNum}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

// Button Event Listeners
runBtn.addEventListener("click", collectAndDisplay);
downloadBtn.addEventListener("click", downloadJSON);
