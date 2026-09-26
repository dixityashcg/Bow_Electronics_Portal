# TC-33 — close transitions — twice, unknown

Executed 2026-09-26T21:29:39.651Z → 2026-09-26T21:29:39.660Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| first close accepted | pass | HTTP 201 |
| second close refused 4xx | pass | HTTP 409 {"statusCode":409,"message":"This product is already closed for quoting."} |
| still Closed | pass |  |
| one earlier version kept (the open state), not two | pass | 1 product_history rows |
| unknown product 404 | pass | HTTP 404 |

HTTP exchanges: 6 (http-log.json).
