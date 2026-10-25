// collector/signals/webglSignals.js

export function collectWebGLSignals() {
  const canvas = document.createElement("canvas");
  let gl;

  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  } catch (e) {
    gl = null;
  }

  // If WebGL is entirely blocked/unsupported
  if (!gl) {
    return {
      supported: {
        value: false,
        available: true,
        error: null,
        collectionMethod: "canvas.getContext('webgl')",
      },
      unmaskedVendor: {
        value: null,
        available: false,
        error: "WebGL context unavailable",
        collectionMethod: "WEBGL_debug_renderer_info",
      },
      unmaskedRenderer: {
        value: null,
        available: false,
        error: "WebGL context unavailable",
        collectionMethod: "WEBGL_debug_renderer_info",
      },
    };
  }

  // WebGL is supported, now check for the debug extension (which privacy browsers often block)
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

  return {
    supported: {
      value: true,
      available: true,
      error: null,
      collectionMethod: "canvas.getContext('webgl')",
    },
    unmaskedVendor: {
      value: debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : null,
      available: Boolean(debugInfo),
      error: debugInfo
        ? null
        : "Extension WEBGL_debug_renderer_info restricted",
      collectionMethod: "WEBGL_debug_renderer_info.UNMASKED_VENDOR",
    },
    unmaskedRenderer: {
      value: debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : null,
      available: Boolean(debugInfo),
      error: debugInfo
        ? null
        : "Extension WEBGL_debug_renderer_info restricted",
      collectionMethod: "WEBGL_debug_renderer_info.UNMASKED_RENDERER",
    },
  };
}
