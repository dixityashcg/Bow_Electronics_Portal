# TC-30 — failure modes on add — duplicates, blank and long descriptions

Executed 2026-09-26T21:29:39.549Z → 2026-09-26T21:29:39.565Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| add "QA-DUP-0001" refused as a duplicate | pass | HTTP 409 {"statusCode":409,"message":"A product with part number QA-DUP-0001 is already in the store."} |
| add "qa-dup-0001" refused as a duplicate | pass | HTTP 409 {"statusCode":409,"message":"A product with part number qa-dup-0001 is already in the store."} |
| add " QA-DUP-0001 " refused as a duplicate | pass | HTTP 409 {"statusCode":409,"message":"A product with part number QA-DUP-0001 is already in the store."} |
| one QA-DUP-0001 in the store, still 1.00 | pass |  |
| blank description refused | pass | HTTP 400 |
| 500-character description accepted | pass | HTTP 201 |
| 501-character description refused | pass | HTTP 400 |
| empty body refused with 4xx | pass | HTTP 400 |
| wrong types refused with 4xx | pass | HTTP 400 |

HTTP exchanges: 10 (http-log.json).
