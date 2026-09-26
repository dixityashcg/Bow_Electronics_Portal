# TC-18 — story-01-05 #4 — no longer named to set discounts, refused

Executed 2026-09-26T21:29:53.459Z → 2026-09-26T21:29:57.684Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| Morgan removes Lee | pass | HTTP 204 |
| Lee refused | pass | HTTP 403 |
| C unchanged | pass | 10 % → 10 % |

HTTP exchanges: 8 (http-log.json).
