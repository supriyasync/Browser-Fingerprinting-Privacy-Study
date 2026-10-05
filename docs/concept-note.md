# Project Concept Note

## Project Title

Browser Fingerprinting Signals and Privacy Defenses: A Controlled, Consent-Based Measurement Study

## Research Question

How do browser-exposed fingerprinting signals change across browser families, private modes, and selected privacy configurations on a controlled set of devices?

## Motivation

Modern web tracking increasingly bypasses stateful client-side mechanisms (such as HTTP cookies) by relying on passive attributes exposed through standard browser APIs. Stateless browser fingerprinting can support cross-session and cross-context recognition. This study investigates the stability and entropy distribution of selected signals under controlled host and browser configurations.

## Methodology

Data collection is conducted strictly on localhost via a lightweight vanilla JavaScript probe without external tracking dependencies. The collection engine captures 19 discrete attributes across four primary architectural layers:

- Environment & Platform: User-Agent, browser languages, timezone, platform string.
- Hardware Concurrency & Memory: Logical CPU cores and device memory bounds.
- Display Metrics: Screen dimensions, available screen geometry, and device pixel ratio.
- Active Rendering Probes: HTML5 Canvas 2D winding/geometry rendering digested via native Web Crypto SHA-256, and low-level WebGL GPU unmasking (`WEBGL_debug_renderer_info`).

Repeated runs are conducted across baseline sessions, private browsing modes (Incognito), and secondary Chromium engines to evaluate intra-configuration stability and cross-environment variation.

## Ethical Scope

- Localhost testing only on investigator-owned devices.
- No public deployment and no third-party data collection.
- Explicitly excludes IP addresses, geolocation data, browsing history, and persistent device IDs.
- No attempt to identify, profile, or deanonymize real users.
- Educational prototype designed exclusively to observe signal exposure and compare defensive boundaries.

## Expected Outcomes & Limitations

- A reproducible, open-source measurement suite and empirical stability matrix.
- Quantitative evaluation of private browsing boundaries against stateless hardware probes.
- Analysis clearly framed within dataset limitations: local observations cannot be generalized to estimate global tracking prevalence or population-scale uniqueness.
