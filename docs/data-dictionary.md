# Data Dictionary

| Field                                          | Meaning                                   | Example                    |
| :--------------------------------------------- | :---------------------------------------- | :------------------------- |
| `schemaVersion`                                | Version of your record format             | `2.0`                      |
| `recordId`                                     | Random local identifier                   | `rec-a1b2c3d4`             |
| `timestamp`                                    | Collection time in ISO format             | `2026-10-25T08:45:00.000Z` |
| `configuration.configurationId`                | Controlled condition label                | `firefox-strict`           |
| `configuration.runNumber`                      | Repeated-run number                       | `1`                        |
| `signals.<category>.<signal>.value`            | The actual extracted fingerprint value    | `1920` or `abc...`         |
| `signals.<category>.<signal>.available`        | Whether collection succeeded (true/false) | `true`                     |
| `signals.<category>.<signal>.error`            | Error or restriction reason if blocked    | `SecurityError`            |
| `signals.<category>.<signal>.collectionMethod` | The JavaScript API used                   | `navigator.userAgent`      |
