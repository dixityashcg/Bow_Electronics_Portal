# TC-04 — story-01-01 #4 — duplicate part number at different prices

Executed 2026-09-26T21:29:34.366Z → 2026-09-26T21:29:34.368Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| sample has a duplicate group at different prices | pass | BWE-C0402X7R104K: rows 1600@0.0045,1601@0.005 |
| row 1600 listed "duplicate part number" | pass | {"rowNumber":1600,"partNumber":"BWE-C0402X7R104K","price":"0.0045","reason":"duplicate part number"} |
| row 1601 listed "duplicate part number" | pass | {"rowNumber":1601,"partNumber":"BWE-C0402X7R104K","price":"0.005","reason":"duplicate part number"} |
| BWE-C0402X7R104K not in the store | pass | HTTP 404 |

HTTP exchanges: 1 (http-log.json).
