document.addEventListener("DOMContentLoaded", async () => {
  // Defensive checks for storage access
  function checkLocalStorage() {
    try {
      return !!window.localStorage;
    } catch (e) {
      return false;
    }
  }

  function checkSessionStorage() {
    try {
      return !!window.sessionStorage;
    } catch (e) {
      return false;
    }
  }

  // Defensive checks for rendering API support
  function checkCanvasSupport() {
    try {
      const elem = document.createElement("canvas");
      return !!(elem.getContext && elem.getContext("2d"));
    } catch (e) {
      return false;
    }
  }

  function checkWebGLSupport() {
    try {
      const elem = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (elem.getContext("webgl") || elem.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  }

  // 1. SHA-256 Hashing helper via native Web Crypto API
  async function computeSHA256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // 2. Offscreen Canvas Fingerprint Generator
  async function getCanvasFingerprint() {
    try {
      const canvas = document.getElementById("fingerprint-canvas");
      if (!canvas || !canvas.getContext) return { hash: "Unsupported" };

      const ctx = canvas.getContext("2d");
      // Set background canvas styling
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial', 'Times New Roman', sans-serif";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);

      // Render overlapping glyphs with varied colors and alpha blending
      ctx.fillStyle = "#069";
      ctx.fillText("MPI-Privacy-Study, \u2603", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("MPI-Privacy-Study, \u2603", 4, 17);

      // Extract raw rasterized pixels as a data URL and compute SHA-256
      const dataUri = canvas.toDataURL();
      const hash = await computeSHA256(dataUri);
      return { hash: hash.substring(0, 16) }; // 16-character hexadecimal prefix
    } catch (e) {
      return { hash: "Blocked / Error" };
    }
  }

  // 3. WebGL Driver & Hardware Unmasking
  function getWebGLHardwareInfo() {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return { vendor: "Unsupported", renderer: "Unsupported" };

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (!debugInfo) {
        return {
          vendor: gl.getParameter(gl.VENDOR) || "Generic",
          renderer: gl.getParameter(gl.RENDERER) || "Generic",
        };
      }

      return {
        vendor:
          gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "Unavailable",
        renderer:
          gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "Unavailable",
      };
    } catch (e) {
      return { vendor: "Blocked / Error", renderer: "Blocked / Error" };
    }
  }

  // Execute active probes
  const canvasResult = await getCanvasFingerprint();
  const webglInfo = getWebGLHardwareInfo();

  // Day 4 Signal Registry (Expanded)
  const signals = [
    {
      name: "Timestamp",
      api: "new Date().toISOString()",
      value: new Date().toISOString(),
    },
    {
      name: "User Agent",
      api: "navigator.userAgent",
      value: navigator.userAgent || "Unavailable",
    },
    {
      name: "Browser Languages",
      api: "navigator.languages",
      value:
        navigator.languages && navigator.languages.length
          ? navigator.languages.join(", ")
          : navigator.language || "Unavailable",
    },
    {
      name: "Host Platform",
      api: "navigator.platform",
      value: navigator.platform || "Unavailable",
    },
    {
      name: "Cookies Enabled",
      api: "navigator.cookieEnabled",
      value: navigator.cookieEnabled ? "true" : "false",
    },
    {
      name: "Screen Dimensions",
      api: "screen.width x screen.height",
      value: `${screen.width} x ${screen.height}`,
    },
    {
      name: "Available Screen Area",
      api: "screen.availWidth x screen.availHeight",
      value: `${screen.availWidth} x ${screen.availHeight}`,
    },
    {
      name: "Color Depth",
      api: "screen.colorDepth",
      value: `${screen.colorDepth}-bit`,
    },
    {
      name: "Device Pixel Ratio",
      api: "window.devicePixelRatio",
      value: window.devicePixelRatio || "Unavailable",
    },
    {
      name: "Timezone",
      api: "Intl.DateTimeFormat().resolvedOptions().timeZone",
      value: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unavailable",
    },
    {
      name: "Hardware Concurrency (CPU Cores)",
      api: "navigator.hardwareConcurrency",
      value: navigator.hardwareConcurrency
        ? `${navigator.hardwareConcurrency} logical cores`
        : "Unavailable",
    },
    {
      name: "Device Memory (RAM)",
      api: "navigator.deviceMemory",
      value: navigator.deviceMemory
        ? `~${navigator.deviceMemory} GB`
        : "Unavailable",
    },
    {
      name: "Canvas 2D Support",
      api: "document.createElement('canvas')",
      value: checkCanvasSupport() ? "Supported" : "Unsupported",
    },
    {
      name: "Canvas 2D Hash (SHA-256)",
      api: "canvas.toDataURL() -> SHA256",
      value: canvasResult.hash,
    },
    {
      name: "WebGL 3D Support",
      api: "canvas.getContext('webgl')",
      value: checkWebGLSupport() ? "Supported" : "Unsupported",
    },
    {
      name: "WebGL Unmasked Vendor",
      api: "WEBGL_debug_renderer_info.UNMASKED_VENDOR",
      value: webglInfo.vendor,
    },
    {
      name: "WebGL Unmasked Renderer",
      api: "WEBGL_debug_renderer_info.UNMASKED_RENDERER",
      value: webglInfo.renderer,
    },
    {
      name: "Local Storage Availability",
      api: "window.localStorage",
      value: checkLocalStorage() ? "Available" : "Restricted / Unavailable",
    },
    {
      name: "Session Storage Availability",
      api: "window.sessionStorage",
      value: checkSessionStorage() ? "Available" : "Restricted / Unavailable",
    },
  ];

  // Dynamically insert signals into the DOM table
  const tbody = document.getElementById("signals-body");
  signals.forEach((signal) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = signal.name;

    const apiCell = document.createElement("td");
    apiCell.textContent = signal.api;

    const valCell = document.createElement("td");
    valCell.textContent = signal.value;

    row.appendChild(nameCell);
    row.appendChild(apiCell);
    row.appendChild(valCell);

    tbody.appendChild(row);
  });

  // JSON Export Handler
  function exportProfileJSON() {
    const payload = {
      collectionTimestamp: new Date().toISOString(),
      attributes: signals.reduce((acc, curr) => {
        acc[curr.name] = curr.value;
        return acc;
      }, {}),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fingerprint-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Bind UI buttons
  document
    .getElementById("btn-export")
    .addEventListener("click", exportProfileJSON);
  document
    .getElementById("btn-recollect")
    .addEventListener("click", () => window.location.reload());
});
