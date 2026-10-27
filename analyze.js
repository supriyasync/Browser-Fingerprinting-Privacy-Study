const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));

const profiles = {};
const allSignals = new Set();

files.forEach((file) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, file), "utf8");
    if (!raw.trim()) return;

    const data = JSON.parse(raw);
    let configId = file.replace(".json", "");
    let signals = [];

    if (Array.isArray(data)) {
      signals = data;
    } else if (data && data.signals) {
      signals = data.signals;
      if (data.metadata && data.metadata.configId) {
        configId = data.metadata.configId;
      }
    } else return;

    profiles[configId] = {};

    signals.forEach((sig) => {
      if (sig && sig.name) {
        allSignals.add(sig.name);
        // Extracting actual values instead of status
        profiles[configId][sig.name] = sig.value || "N/A";
      }
    });
  } catch (error) {}
});

console.log("\n--- Actual Signal Values (Proof of Spoofing) ---");

const signalArray = Array.from(allSignals);

if (signalArray.length > 0) {
  const targetSignals = [
    "Canvas Fingerprint",
    "WebGL Renderer",
    "Hardware Concurrency",
    "Device Memory",
  ];

  const header = [
    "Signal".padEnd(22),
    ...Object.keys(profiles).map((p) => p.substring(0, 14).padEnd(14)),
  ].join(" | ");
  console.log(header);
  console.log("-".repeat(header.length));

  targetSignals.forEach((signal) => {
    if (!signalArray.includes(signal)) return;

    const row = [signal.padEnd(22)];
    Object.keys(profiles).forEach((profile) => {
      let val = profiles[profile][signal] || "N/A";

      // Truncating so the table doesn't break in terminal
      if (typeof val === "string" && val.length > 14) {
        val = val.substring(0, 11) + "...";
      } else if (typeof val !== "string") {
        val = String(val);
      }
      row.push(val.padEnd(14));
    });
    console.log(row.join(" | "));
  });
}
console.log("\n");
