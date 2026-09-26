# TC-10 — story-01-04 #1 — rep not named refused a price change

Executed 2026-09-26T21:29:34.394Z → 2026-09-26T21:29:34.398Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| change refused | pass | HTTP 403 {"statusCode":403,"message":"Only a price maintainer can change a price."} |
| price unchanged | pass | 0.19 → 0.19 |
| price history unchanged | pass | 0 → 0 |

HTTP exchanges: 3 (http-log.json).
