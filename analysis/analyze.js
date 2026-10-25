const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const files = [
  "chrome-normal.json",
  "chrome-incognito.json",
  "edge-normal.json",
];

// 1. Ingest datasets
const profiles = {};
files.forEach((file) => {
  const filePath = path.join(DATA_DIR, file);
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf-8");
    profiles[file.replace(".json", "")] = JSON.parse(raw).attributes;
  } else {
    console.error(`Missing dataset file: ${file}`);
  }
});

// 2. Identify all unique attributes across captured datasets
const attributeKeys = Object.keys(profiles["chrome-normal"] || {});

const results = [];

// 3. Quantitative differential evaluation
attributeKeys.forEach((key) => {
  const chromeNormal = profiles["chrome-normal"]
    ? profiles["chrome-normal"][key]
    : "N/A";
  const chromeIncognito = profiles["chrome-incognito"]
    ? profiles["chrome-incognito"][key]
    : "N/A";
  const edgeNormal = profiles["edge-normal"]
    ? profiles["edge-normal"][key]
    : "N/A";

  // Evaluate invariant status
  const incognitoStable = chromeNormal === chromeIncognito;
  const crossBrowserStable = chromeNormal === edgeNormal;
  const isFullyInvariant = incognitoStable && crossBrowserStable;

  results.push({
    attribute: key,
    chromeNormal,
    chromeIncognito,
    edgeNormal,
    incognitoStable,
    crossBrowserStable,
    isFullyInvariant,
  });
});

// 4. Console tabular reporting
console.log(
  "\n=========================================================================================",
);
console.log(
  "                     EMPIRICAL FINGERPRINT STABILITY REPORT                              ",
);
console.log(
  "=========================================================================================\n",
);

console.table(
  results.map((r) => ({
    Attribute: r.attribute,
    "Incognito Invariant": r.incognitoStable ? "YES" : "NO",
    "Cross-Browser Invariant": r.crossBrowserStable ? "YES" : "NO",
    "Overall Stability": r.isFullyInvariant ? "INVARIANT" : "VARIANT",
  })),
);

// 5. Generate Markdown Table for Literature & Seminar Documentation
const markdownRows = results.map((r) => {
  const sanitize = (val) =>
    String(val).replace(/\|/g, "\\|").replace(/\n/g, " ");
  return `| ${r.attribute} | ${r.incognitoStable ? "Stable" : "Variant"} | ${r.crossBrowserStable ? "Stable" : "Variant"} | \`${sanitize(r.chromeNormal)}\` |`;
});

const markdownDoc = `# Empirical Attribute Stability Matrix

| Signal / Attribute | Incognito Resilience | Cross-Browser Resilience | Baseline Value (Chrome) |
|---|---|---|---|
${markdownRows.join("\n")}
`;

fs.writeFileSync(
  path.join(__dirname, "docs", "stability-matrix.md"),
  markdownDoc,
);
console.log(
  "\nDocumentation matrix successfully generated at: docs/stability-matrix.md\n",
);
