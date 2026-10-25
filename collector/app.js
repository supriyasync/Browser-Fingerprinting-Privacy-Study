// collector/app.js
import { collectNavigatorSignals } from "./signals/navigatorSignals.js";
import { collectCanvasSignal } from "./signals/canvasSignals.js";
import { collectWebGLSignals } from "./signals/webglSignals.js";
import { collectScreenSignals } from "./signals/screenSignals.js";
import { collectFeatureSignals } from "./signals/featureSignals.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Collect the signals from all modules
  const navigatorSignals = collectNavigatorSignals();
  const canvasHashSignal = await collectCanvasSignal();
  const webglSignals = collectWebGLSignals();
  const screenSignals = collectScreenSignals();
  const featureSignals = collectFeatureSignals();

  // 2. Combine all signals
  const allSignals = {
    navigator: navigatorSignals,
    screen: screenSignals,
    canvas: {
      hash: canvasHashSignal,
    },
    webgl: webglSignals,
    features: featureSignals,
  };

  // 3. Render the table in the UI
  const tbody = document.getElementById("signals-body");

  for (const [category, signals] of Object.entries(allSignals)) {
    for (const [key, data] of Object.entries(signals)) {
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.textContent = `${category}.${key}`;

      const statusCell = document.createElement("td");
      statusCell.textContent = data.available ? "Available" : "Restricted";
      statusCell.style.color = data.available ? "green" : "red";

      const valCell = document.createElement("td");
      // Truncate long hashes for cleaner display
      if (data.value && String(data.value).length > 30) {
        valCell.textContent = String(data.value).substring(0, 16) + "...";
      } else {
        valCell.textContent = data.value !== null ? data.value : "N/A";
      }

      const errorCell = document.createElement("td");
      errorCell.textContent = data.error || data.collectionMethod;

      row.appendChild(nameCell);
      row.appendChild(statusCell);
      row.appendChild(valCell);
      row.appendChild(errorCell);
      tbody.appendChild(row);
    }
  }

  // 4. JSON Export Handler with Experimental Metadata
  function exportProfileJSON() {
    const configId = document.getElementById("config-id").value || "unknown";
    const runNumber = document.getElementById("run-number").value || "1";

    const payload = {
      schemaVersion: "2.0",
      recordId: "rec-" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      configuration: {
        configurationId: configId,
        browserName: document.getElementById("browser-name").value || "unknown",
        browserVersion:
          document.getElementById("browser-version").value || "unknown",
        operatingSystem: document.getElementById("os-name").value || "unknown",
        mode: document.getElementById("mode-name").value || "unknown",
        runNumber: parseInt(runNumber, 10),
        notes: "",
      },
      signals: allSignals,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${configId}-run-0${runNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 5. Bind UI buttons
  document
    .getElementById("btn-export")
    .addEventListener("click", exportProfileJSON);
  document
    .getElementById("btn-recollect")
    .addEventListener("click", () => window.location.reload());
});
