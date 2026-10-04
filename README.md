# Browser Fingerprinting & Privacy Study

An empirical study and client-side profiling tool designed to evaluate stateless browser identification techniques, entropy distribution, and cross-context tracking persistence.

---

## 1. Abstract & Threat Model

Modern web tracking has evolved beyond stateful client-side mechanisms (such as HTTP cookies and `localStorage`). **Stateless browser fingerprinting** operates by extracting passive hardware, operating system, and rendering-engine characteristics exposed through standard Web APIs. These attributes require no explicit user permissions and enable third-party trackers to construct persistent, probabilistically unique device identifiers.

This study investigates:

1. The real-world stability of active rendering probes (HTML5 Canvas 2D and WebGL unmasking).
2. The privacy boundary of private browsing modes (e.g., Google Chrome Incognito).
3. Cross-browser linkability across Chromium-based browsers running on identical host hardware.

---

## 2. Signal Architecture & Collector Design

The collection engine (`app.js`) samples 19 discrete attributes across four primary architectural layers without relying on external libraries or network requests:

| Layer                   | Captured Attributes                                                      |
| ----------------------- | ------------------------------------------------------------------------ |
| Platform & Environment  | User-Agent, Locales, Platform, Timezone, Cookies                         |
| Hardware Metrics        | Concurrency (Cores), Device Memory (RAM), Screen Dimensions, Pixel Ratio |
| Active Graphics Probe   | HTML5 Canvas 2D Render -> SHA-256 Digest                                 |
| Low-Level Graphics Info | WebGL Driver Vendor & Unmasked Renderer Strings                          |
| Storage Availability    | LocalStorage & SessionStorage Partition Checks                           |

### Active Probing Mechanics:

- **Canvas 2D Hash:** Renders alphanumeric strings with custom font families, overlapping color geometries, winding-rule fills, and arc paths. The pixel buffer is extracted via `canvas.toDataURL()` and hashed into a 64-character hex digest using the native Web Crypto API (`crypto.subtle.digest("SHA-256", ...)`).
- **WebGL Unmasking:** Uses the `WEBGL_debug_renderer_info` extension to bypass standard generic vendor masking and retrieve the raw underlying GPU chipset string.

---

## 3. Empirical Findings

Data was collected on a consistent host system (Intel Arc GPU, 18 logical CPU cores, 16 GB RAM) across three distinct contexts:

- **Environment A:** Google Chrome (Default Session)
- **Environment B:** Google Chrome (Incognito Mode)
- **Environment C:** Microsoft Edge (Default Session)

### Stability Matrix Summary

| Signal / Attribute           | Incognito Resilience | Cross-Browser Resilience | Baseline Value (Chrome)              |
| ---------------------------- | -------------------- | ------------------------ | ------------------------------------ |
| **Canvas 2D Hash (SHA-256)** | **Stable**           | **Stable**               | `8b6f2badf80a6066`                   |
| **WebGL Unmasked Renderer**  | **Stable**           | **Stable**               | `ANGLE (Intel, Intel(R) Arc(TM)...)` |
| **Hardware Concurrency**     | **Stable**           | **Stable**               | `18 logical cores`                   |
| **Device Memory**            | **Stable**           | **Stable**               | `~16 GB`                             |
| **Screen Dimensions**        | **Stable**           | **Stable**               | `1327 x 829`                         |
| **Device Pixel Ratio**       | **Stable**           | **Stable**               | `1.4479166269302368`                 |
| **Timezone**                 | **Stable**           | **Stable**               | `Asia/Calcutta`                      |
| **Host Platform**            | **Stable**           | **Stable**               | `Win32`                              |
| **User Agent**               | **Stable**           | _Variant_                | `Mozilla/5.0... Chrome/154.0.0.0`    |
| **Browser Languages**        | _Variant_            | _Variant_                | `en-IN, en-GB, en-US, en`            |
| **Timestamp**                | _Variant_            | _Variant_                | Runtime-dependent                    |

### Key Observations:

1. **The Incognito Fallacy:** **16 out of 19 attributes** remained completely invariant between Normal and Incognito modes. While private browsing isolates stateful storage upon session termination, it provides zero protection against stateless hardware and rendering identification.
2. **Cross-Browser Linkability:** Because both Chrome and Edge rely on the Chromium rendering pipeline and Direct3D11 ANGLE abstraction, the SHA-256 canvas digest and unmasked GPU string remained identical across both applications, enabling cross-browser device correlation.

---

## 4. Evaluated Defense Mechanisms

1. **Randomization / Farbling (e.g., Brave Browser):**
   - Introduces imperceptible mathematical pseudo-random noise directly into canvas pixel data and audio buffer outputs.
   - _Outcome:_ Breaks temporal stability; the canvas hash shifts on every session, preventing long-term identifier linkage.
2. **Homogenization (e.g., Tor Browser):**
   - Restricts canvas readback behind an explicit user authorization prompt and returns blank canvases to untrusted scripts.
   - Standardizes screen sizes into discrete viewport buckets (letterboxing) and enforces uniform system fonts.
3. **API Deprecation & Entropy Budgets (Privacy Sandbox):**
   - Replaces high-entropy user-agent strings with structured User-Agent Client Hints (`Sec-CH-UA`).
   - Reduces the fidelity of `navigator.deviceMemory` and `navigator.hardwareConcurrency` to broad, capped buckets.

---

## 5. Repository Structure

```text
├── index.html               # Semantic UI dashboard for signal inspection
├── style.css                # Interface styling and layout
├── app.js                   # Client-side collector, Canvas probe, and JSON exporter
├── analyze.js               # Automated Node.js empirical stability evaluation script
├── data/                    # Captured empirical environment profiles (.json)
│   ├── chrome-normal.json
│   ├── chrome-incognito.json
│   └── edge-normal.json
└── docs/                    # Research documentation & literature notes
    ├── literature-notes.md
    └── stability-matrix.md
```

## 6. How to Reproduce

1. Clone the repository:
   git clone https://github.com/supriyasync/Browser-Fingerprinting-Privacy-Study.git
   cd Browser-Fingerprinting-Privacy-Study

2. Inspect the Collector:
   Open index.html directly in any modern browser. Click Download Profile JSON to capture your system profile.

3. Run the Quantitative Analysis Script:
   Ensure Node.js is installed, then run:
   node analyze.js
