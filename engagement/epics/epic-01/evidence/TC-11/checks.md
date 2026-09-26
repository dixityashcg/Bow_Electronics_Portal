# TC-11 — story-01-04 #2 — rep not named refused add and close

Executed 2026-09-26T21:29:34.398Z → 2026-09-26T21:29:34.404Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| add refused | pass | HTTP 403 {"statusCode":403,"message":"Only a price maintainer can add a product."} |
| part number not in the store | pass | HTTP 404 |
| close refused | pass | HTTP 403 {"statusCode":403,"message":"Only a price maintainer can close a product for quoting."} |
| product still Open for quoting | pass |  |
| product count unchanged | pass | 2000 → 2000 |
| no product closed beyond TC-09’s one | pass | 1 closed |

HTTP exchanges: 3 (http-log.json).
