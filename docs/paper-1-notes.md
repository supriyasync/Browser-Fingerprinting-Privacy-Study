# Comprehensive Literature Analysis: Eadem, Sed Aliter — Investigating the Instability of Browser Fingerprinting

## 1. Bibliographic Information

- **Title:** Eadem, Sed Aliter: Investigating the Instability of Browser Fingerprinting
- **Authors:** Xu Lin, Shujiang Wu, Jacob Anthony Eckfeldt, Pengfei Sun, Jason Polakis
- **Institutions:** Washington State University, F5 Inc., University of Illinois Chicago
- **Publication Venue:** Proceedings of the 2026 ACM Internet Measurement Conference (IMC '26), October 12–16, 2026, Karlsruhe, Germany
- **Digital Object Identifier (DOI):** https://doi.org/10.1145/3777912.3809154
- **Open Source Artifact:** https://github.com/xlin29/predictive-fp

---

## 2. Executive Summary & Foundational Paradigm Shift

- **Historical Baseline:** For over a decade (starting with Eckersley’s EFF Panopticlick in 2010), research assumed that browser fingerprints remain invariant across sessions unless a software update or hardware modification occurs. Past linking strategies (like Vastel et al.’s _FP-Stalker_) modeled fingerprint changes strictly around software evolution timelines.
- **Core Paradigm Shift:** This paper demonstrates that **fingerprinting attributes suffer from inherent instability even within identical, unchanged execution environments**. A browser restarted minutes later without updates can expose completely different values for primary entropy vectors.
- **Core Contribution:**
  1. The first large-scale empirical audit quantifying within-environment attribute instability and uncovering "FP-flips".
  2. Root-cause reverse engineering of browser engine mechanics behind these fluctuations.
  3. `Predictive-FP`: An adaptive re-identification framework anticipating flip-flop values.
  4. A client-side privacy extension that randomizes attributes without causing severe functional web breakage.

---

## 3. Dataset Characteristics & Empirical Scale

- **Data Origin:** Real-world authentication flows from 5 major commercial enterprises protected by F5, Inc. (Bank-A, Bank-B, Credit-A, Retail-A, Bank-C).
- **Dataset Scale:**
  - **Total Sessions:** Exceeds 184 million HTTP POST authentication transactions.
  - **Bank-A Primary Corpus:** 169,219,670 sessions across 7,449,311 recurring user accounts (`LoginID`).
  - **Longitudinal Window:** August 2023 through February 2024 (6 months).
- **Integrity & Ground Truth:**
  - Sessions represent benign, authenticated traffic cleared by anti-bot and anti-fraud systems.
  - Ground truth is isolated per physical device using recurring cookie identifiers (`Cookie`) rather than user accounts, preventing multi-device logins from confounding single-machine measurements.

---

## 4. Empirical Characterization of Instability

### A. Temporal Growth of Instability

- **Month 1:** ~40% of unique devices show attribute divergence with an average of 3.6 changes per device.
- **Month 6:** Divergence rises to over 75% of devices, averaging 9 distinct attribute shifts per device.
- **Stable Window:** Most individual attributes hold their values for only **2 to 5 days** before varying.

### B. Attribute Vulnerability Breakdown (Even When User-Agent Remains Identical)

- **Display Metrics:**
  - `screen.availHeight` / `screen.availWidth` is by far the most erratic vector (up to 9.10% divergence within a single month at Bank-A, remaining >3% across all services).
  - Nominal `screen.width` / `screen.height` exhibits ~2.7% instability.
- **Rendering & Hardware Vectors:**
  - `Canvas 2D` rendering digests diverge in up to 5.88% of devices within a month (Bank-B).
  - `devicePixelRatio` shifts in ~2.02% of devices.
  - System font lists (`Fonts`) diverge in ~1.25% of devices.
  - `WebGL` vendor and renderer strings fluctuate in <1% of devices, but exhibit severe qualitative shifts when they do.

---

## 5. Root-Cause Analysis & Engine Mechanics

The authors reproduced and isolated the exact runtime causes behind these variations:

### 1. Canvas Micro-Shifts & Anti-Fingerprinting Noise

- **Samsung Internet Browser:** Shows extreme Canvas instability (>85% on Linux `aarch64` / Android).
- **Mechanism:** Tested with 6 progressive canvas images (from plain text to complex paths and shadows). Samsung Internet's native anti-tracking feature injects deliberate micro-deviations:
  - Individual RGB and alpha channel values randomly shift by 1–2 units (e.g., `(0, 0, 0, 0)` shifts to `(0, 2, 0, 0)`) across consecutive sessions.
  - Because cryptographic hashing (e.g., SHA-256) exhibits an avalanche effect, a single subpixel bit shift completely changes the final fingerprint hash.

### 2. Available Resolution & Operating System UI Geometry

- **Observation:** macOS devices frequently shift `availHeight` by 1 to 4 pixels (e.g., 1440x807 to 1440x809 or 1440x813) without monitor swaps.
- **Mechanism:** Instrumenting Chromium 132 source code on macOS revealed that the browser queries system dock metrics during launch. The OS dock height dynamically calculates to 67, 68, or 70 pixels across restarts without manual user resizing, causing the JavaScript-accessible available screen boundary to fluctuate.

### 3. Font Inconsistencies & Startup Asynchrony

- **Observation:** Firefox on Windows 11 inconsistently exposes installed system fonts (e.g., `Arial Black`, `Calibri Light`, `Segoe UI Semilight`, `Sitka`).
- **Mechanism:**
  - Common fingerprint probes measure font existence by rendering text offscreen using fallback triplets (`monospace`, `sans-serif`, `serif`) and detecting width offsets.
  - Firefox applies internal font substitutions (mapping `Helvetica` to `Arial`, or `Times New Roman Baltic` to `Times New Roman`).
  - Additionally, Windows DirectWrite font subsystems introduce a **font readiness delay**: Firefox does not expose certain system fonts to the DOM/JS API until the browser has been active for ~60 seconds or until an HTML element explicitly requests that font family to trigger rasterizer initialization. Probes executing immediately on page load read fallback dimensions instead.

### 4. WebGL Layer Toggling

- **Observation:** WebGL renderer values oscillate significantly with similarity ratios dropping to 0.23 (traditionally, literature assumed similarity > 0.75 under software updates).
- **Mechanism:** On Windows and ChromeOS, browsers alternate between hardware driver strings and translation wrappers (e.g., toggling between `Mesa DRI Intel(R) UHD Graphics` and `ANGLE (Intel Mesa DRI UHD Graphics)`) based on background GPU driver contexts, power-saving states, or thread sandboxing.

---

## 6. The "FP-Flip" Phenomenon & `Predictive-FP`

### The Flip-Flop Dynamic

- Instability is **not uniformly distributed entropy**.
- Attributes alternate back and forth within a closed set of value pairs:
  - **Reversion Rates:** Over 84% of devices that changed screen resolution, 89% that changed canvas digests, and 86% that changed font hashes eventually flipped back to their original baseline value.
  - **High Pair Concentration:** For 11 out of 13 attributes, fewer than 1% of unique value pairs account for more than 50% of all real-world fluctuations.

### Predictive-FP System Architecture

- **Design:** Replaces rigid single-hash equality checks with an adaptive knowledge base derived from population-level flip pairs.
- **Feature Optimization:** Extracts 28 normalized features from raw attributes (e.g., stripping minor version numbers from User-Agent while preserving browser and OS family).
- **Verification Workflow:** If an incoming attribute matches an anticipated flip value within the knowledge base, it is mapped into the device's permissible value set rather than classified as a new device.
- **Empirical Performance (Bank-A at 6 Months):**
  - **Consistent Re-Identification:** Achieves **94.37%** user re-identification compared to only **31.15%** for standard non-adaptive baselines and **43.44%** for FP-Stalker.
  - **The Canvas Counter-Intuition:** Dropping Canvas from the fingerprint set improved 6-month re-identification from 67.66% to 94.37%. Canvas updates across browser releases (e.g., Chrome 120 changing rendering output globally) created excessive entropy that fragmented device persistence.

---

## 7. The Defensive Client-Side Extension & Usability Trade-Offs

The authors developed and evaluated a defensive Chrome extension to counteract both standard fingerprinting and predictive linkability:

### Randomization Architecture

- **Canvas:** Shifts RGB values by ±3 across 5% of pixels on `<canvas>` export calls (`toDataURL`, `toBlob`, `getImageData`), maintaining visual fidelity while breaking hash determinism.
- **Display Geometry:** Coordinates subtle ±5 pixel offsets across `screen.width`, `height`, `availWidth`, and `availHeight` to maintain internal mathematical consistency.
- **Fonts:** Perturbs layout dimensions (`offsetWidth`, `offsetHeight`) by 1 pixel via a stable per-element session delta.
- **WebGL:** Intercepts `getParameter()` calls to append plausible synthetic vendor/renderer tokens.
- **User-Agent:** Appends randomized 3–10 character synthetic tokens into the UA string while keeping HTTP request headers and JS properties synchronized.

### Usability & Compatibility Evaluation (Tranco Top 30 + Chase Bank)

- **General Browsing:** Flawlessly rendered and executed on 24 of 30 top domains.
- **Account Creation Breakage:**
  - Facebook and Netflix flagged the browser as abnormal and triggered CAPTCHAs/verification challenges (caused specifically by the User-Agent token manipulation).
  - Google completely blocked account creation with an "unsecure browser" warning.
- **Finding:** Client-side randomization defenses must prioritize **domain allowlisting** and coordinate cross-attribute consistency to avoid triggering aggressive anti-bot/fraud heuristics.

---

## 8. Direct Strategic Relevance to My Independent Study

1. **API Selection Validation:** Confirms that the 19 attributes targeted in my vanilla JS collector (Canvas 2D SHA-256, unmasked WebGL parameters, display metrics, concurrency/memory) represent the highest-entropy core examined in top-tier research venues (IMC '26)[cite: 4, 6, 133, 143].
2. **Threat Model Calibration:** Proves why a naive single-string hash is scientifically flawed for device tracking, establishing the need to evaluate individual signal stability ($S=1$) and understand variance[cite: 21, 133, 139].
3. **Defense Evaluation Justification:** Provides the baseline rationale for testing how privacy configurations (Firefox Strict Tracking Protection and `privacy.resistFingerprinting`) alter signal stability compared to baseline Chromium runs[cite: 20, 138, 149].
4. **Research Balance:** Establishes the real-world tension between privacy preservation (randomization/noise) and web compatibility/fraud prevention[cite: 133, 144].

---
