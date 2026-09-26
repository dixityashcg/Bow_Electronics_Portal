# TC-23 — duplicates in the load

Executed 2026-09-26T21:30:35.220Z → 2026-09-26T21:30:39.365Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| identity: loaded + not loaded = 10 | pass | 10: 1 + 9 |
| all nine duplicate rows listed "duplicate part number" | pass | 2 "QA-D1" duplicate part number; 3 "QA-D1" duplicate part number; 4 "QA-D2" duplicate part number; 5 "qa-d2" duplicate part number; 6 "QA-D3" duplicate part number; 7 " QA-D3 " duplicate part number; 8 "QA-D4" duplicate part number; 9 "QA-D4" duplicate part number; 10 "QA-D4" duplicate part number |
| QA-D1 not in the store (any case) | pass |  |
| QA-D2 not in the store (any case) | pass |  |
| QA-D3 not in the store (any case) | pass |  |
| QA-D4 not in the store (any case) | pass |  |
| the unique row stored | pass |  |

HTTP exchanges: 3 (http-log.json).
