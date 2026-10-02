document.addEventListener("DOMContentLoaded", () => {
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

  // Day 3 Core Signal Registry
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
      name: "WebGL 3D Support",
      api: "canvas.getContext('webgl')",
      value: checkWebGLSupport() ? "Supported" : "Unsupported",
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
});
