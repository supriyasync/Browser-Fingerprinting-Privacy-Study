# Browser Fingerprinting & Privacy Study

An empirical study and client-side profiling tool designed to evaluate stateless browser identification techniques, entropy distribution, and cross-context tracking persistence.

---

## 1. Abstract & Threat Model

Modern web tracking has evolved beyond stateful client-side mechanisms (such as HTTP cookies and `localStorage`). **Stateless browser fingerprinting** operates by extracting passive hardware, operating system, and rendering-engine characteristics exposed through standard Web APIs. These attributes require no explicit user permissions and enable third-party trackers to construct persistent, probabilistically unique device identifiers.

This study investigates:

1. The real-world stability of active rendering probes (HTML5 Canvas 2D and WebGL unmasking).
2. The privacy boundary of private browsing modes (e.g., Google Chrome Incognito).
3. Cross-browser linkability and the efficacy of active spoofing and API blocking in privacy-focused browsers (Brave, Firefox).

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

Data was collected on a consistent host system across multiple browsers and contexts to evaluate the stability of fingerprinting vectors and the effectiveness of built-in defenses.

### Stability & Spoofing Matrix

| Signal / Attribute       | Chrome (Incognito) | Edge (InPrivate) | Opera (Secured)  | Brave (Strict)   | Firefox (Strict) |
| ------------------------ | ------------------ | ---------------- | ---------------- | ---------------- | ---------------- |
| **Canvas 2D Hash**       | `defacdc02f0...`   | `defacdc02f0...` | `defacdc02f0...` | `6c6863d05ca...` | `74b010175df...` |
| **WebGL Renderer**       | Google Inc....     | Google Inc....   | Google Inc....   | Brave ~ Brave    | Google Inc....   |
| **Hardware Concurrency** | 18 Cores           | 18 Cores         | 18 Cores         | 15 Cores         | 8 Cores          |
| **Device Memory**        | 16 GB              | 16 GB            | 16 GB            | 16 GB            | N/A (Blocked)    |

### Key Observations:

1. **The Incognito Fallacy:** Standard private browsing modes (Chrome Incognito, Edge InPrivate, Opera Secured) provide zero protection against stateless hardware and rendering identification. They exposed the exact same underlying hardware (18 cores, 16 GB RAM) and generated identical Canvas hashes (`defacdc02f0...`), allowing trivial cross-session linkage.
2. **Active Spoofing (Noise Injection):** Brave (Strict mode) actively defends against identification by injecting mathematical noise into APIs. It dynamically altered the Canvas hash (`6c6863d05ca...`), overwrote the WebGL unmasked vendor string (`Brave ~ Brave`), and spoofed the hardware concurrency (reporting 15 cores instead of 18).
3. **API Masking & Blocking:** Firefox (Strict mode) employs a homogenization strategy. It strictly capped the reported hardware concurrency at 8 cores to blend into a broader device pool, completely blocked access to the `navigator.deviceMemory` API, and isolated the Canvas output (`74b010175df...`).

---

## 4. Evaluated Defense Mechanisms

1. **Randomization / Farbling (e.g., Brave Browser):**
   - Introduces imperceptible pseudo-random noise directly into canvas pixel data and audio buffer outputs.
   - _Outcome:_ Breaks temporal stability; the canvas hash shifts on every session, preventing long-term identifier linkage.
2. **Homogenization (e.g., Tor Browser, Firefox Strict):**
   - Restricts high-entropy APIs or standardizes outputs to blend users into a large anonymity set.
   - _Outcome:_ Caps hardware metrics (e.g., CPU cores) and blocks sensitive memory APIs to reduce the uniqueness of the fingerprint.
3. **API Deprecation & Entropy Budgets (Privacy Sandbox):**
   - Replaces high-entropy user-agent strings with structured User-Agent Client Hints (`Sec-CH-UA`).

---

## 5. Literature Review & Theoretical Grounding

This study contextualizes local empirical observations against three foundation papers in modern fingerprinting literature:

1. **Empirical Attribute Instability [Application Layer]:**
   - _Paper:_ Eadem, Sed Aliter: A Large-Scale Longitudinal Study on Browser Fingerprint Instability [IMC '26].
   - _Documentation:_ `docs/paper-1-notes.md`
   - _Relevance:_ Explains real-world attribute churn and why static browser baselines exhibit non-deterministic feature flips.

2. **Adversarial Resilience & Defensive Modeling [Security Perspective]:**
   - _Paper:_ An Explainable and Adversarially Resilient Deep Learning Framework for Secure Browser Fingerprinting and User Identification [IJCSIS '26].
   - _Documentation:_ `docs/paper-2-notes.md`
   - _Relevance:_ Explores the dual-use nature of fingerprinting for fraud detection and risk-based authentication against intentional client spoofing.

3. **Network-Level Traffic Analysis [Transport Layer]:**
   - _Paper:_ Website Fingerprinting Attacks and Defense Techniques: A Survey [ACM Computing Surveys].
   - _Documentation:_ `docs/paper-3-notes.md`
   - _Relevance:_ Maps the broader privacy landscape, distinguishing client-side JavaScript Web API tracking from encrypted network traffic side-channel leakage.

---

## 6. Repository Structure

```text
├── index.html               # Semantic UI dashboard for signal inspection
├── style.css                # Interface styling and layout
├── app.js                   # Client-side collector, Canvas probe, and JSON exporter
├── analyze.js               # Automated Node.js empirical stability evaluation script
├── data/                    # Captured empirical environment profiles [.json]
└── docs/                    # Research documentation & literature notes
    ├── literature-notes.md
    ├── stability-matrix.md
    ├── paper-1-notes.md
    ├── paper-2-notes.md
    └── paper-3-notes.md
```

## 7. How to Reproduce

1. Clone the repository:
   git clone https://github.com/supriyasync/Browser-Fingerprinting-Privacy-Study.git
   cd Browser-Fingerprinting-Privacy-Study

2. Inspect the Collector:
   Open index.html directly in any modern browser. Click Download Profile JSON to capture your system profile.

3. Run the Quantitative Analysis Script:
   Ensure Node.js is installed, then run:
   node analyze.js
