# Literature Notes: Browser Fingerprinting Foundations

**Primary Source:** Laperdrix, P., Bielova, N., Baudry, B., & Avoine, G. (2020). _Browser Fingerprinting: A Survey_. ACM Transactions on the Web (TWEB), 14(2), 1–33.

---

### 1. What is browser fingerprinting?

Browser fingerprinting is a method of collecting software, hardware, and configuration properties exposed by a client's web browser and synthesizing them into a recognizable device profile or hash without storing any persistent state on the client machine.

### 2. How is it different from cookies?

- **Stateful (Cookies / Web Storage):** Relies on the server writing a persistent tracking identifier to the client's local storage or cookie jar. Users can inspect, block, or delete these tokens (e.g., clearing browser cache, opening an Incognito window).
- **Stateless (Fingerprinting):** Does not write or store any data on the client device. It observes read-only environmental quirks (GPU rasterization, system fonts, screen metrics) that the browser reveals during standard web page execution.

### 3. What does "stateless tracking" mean?

Stateless tracking means identifying and re-identifying a client across browsing sessions without leaving any persistent state, tokens, or artifacts on the user's computer.

### 4. What is a fingerprinting attribute?

An attribute is an individual data point or metric queried through browser-exposed web APIs or HTTP headers that reflects an aspect of the client's runtime environment, hardware, or configuration.

### 5. Five key attribute examples:

1. `navigator.userAgent`: Declares the browser engine version and host operating system.
2. `Intl.DateTimeFormat().resolvedOptions().timeZone`: Identifies the local geographic time zone offset.
3. `screen.width` x `screen.height` & `window.devicePixelRatio`: Screen dimensions and display pixel density.
4. **HTML5 Canvas Rendering:** Pixel-level variations generated when rasterizing 2D text and shapes due to differences in GPU hardware, display drivers, and font anti-aliasing engines.
5. **WebGL Renderer String:** Unmasked hardware identifier exposing the physical graphics card model via `WEBGL_debug_renderer_info`.

### 6. What is stability?

Stability describes whether a given attribute remains identical over time on the same machine. Some attributes are highly stable (e.g., CPU architecture, WebGL renderer), while others change frequently (e.g., dynamic IP, window size, or browser version updates).

### 7. What is uniqueness?

Uniqueness measures the degree to which a specific fingerprint or combination of attributes isolates a single device within a population. In information theory, this is quantified using **Shannon Entropy ($H$)**:
$$H = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)$$
Higher entropy indicates greater uniqueness within the observed sample.

### 8. What are privacy defenses trying to do?

Privacy defenses aim to prevent cross-session device identification through two primary strategies:

- **Standardization / Uniformity (e.g., Tor Browser):** Forcing all clients to return identical, generic values (e.g., standard window resolution, generic user agent) so individuals blend into a crowd.
- **Randomization / Poisoning (e.g., Brave, Canvas Defender):** Introducing subtle, dynamic noise into canvas pixels or audio buffers so a persistent hash cannot be formed across visits.

### 9. Why can a small local experiment not estimate global tracking risk?

A small, local experimental setup ($N < 50$) only observes signal variation across a narrow, unrepresentative group of controlled devices. It lacks the statistical distribution needed to calculate global uniqueness or real-world tracking probability across billions of web users. Findings must be reported strictly as descriptive behavioral observations of the tested configurations.
