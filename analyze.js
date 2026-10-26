const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));

const profiles = {};
const allSignals = new Set();

files.forEach((file) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, file), "utf8");

    // Skip empty files
    if (!raw.trim()) {
      console.log(`Skipping ${file}: File is completely empty.`);
      return;
    }

    const data = JSON.parse(raw);

    let configId = file.replace(".json", "");
    let signals = [];

    // Support BOTH old data format (arrays) and new format (objects with metadata)
    if (Array.isArray(data)) {
      signals = data;
    } else if (data && data.signals) {
      signals = data.signals;
      if (data.metadata && data.metadata.configId) {
        configId = data.metadata.configId;
      }
    } else {
      console.log(`Skipping ${file}: Unrecognized JSON format.`);
      return;
    }

    profiles[configId] = {};

    signals.forEach((sig) => {
      if (sig && sig.name) {
        allSignals.add(sig.name);
        profiles[configId][sig.name] = {
          status: sig.status || "N/A",
          value: sig.value || "N/A",
        };
      }
    });
  } catch (error) {
    // Print the exact reason JSON.parse failed
    console.error(`Error parsing ${file}: ${error.message}`);
  }
});

console.log("\n--- Fingerprinting Signal Comparison ---");

const signalArray = Array.from(allSignals);

if (signalArray.length === 0) {
  console.log(
    "No valid signals found. Please re-run the collector to generate fresh JSON files.",
  );
} else {
  const header = [
    "Signal".padEnd(25),
    ...Object.keys(profiles).map((p) => p.padEnd(15)),
  ].join(" | ");
  console.log(header);
  console.log("-".repeat(header.length));

  signalArray.forEach((signal) => {
    const row = [signal.padEnd(25)];
    Object.keys(profiles).forEach((profile) => {
      const sigData = profiles[profile][signal];
      let display = sigData ? sigData.status : "N/A";

      if (display === "Blocked") display = "❌ Blocked";
      if (display === "Available") display = "✅ Avail";
      if (display === "Unspecified") display = "⚠️ Unspec";

      row.push(display.padEnd(15));
    });
    console.log(row.join(" | "));
  });
}
console.log("\n");
