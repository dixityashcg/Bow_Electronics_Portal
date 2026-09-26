# TC-15 — story-01-05 #1 — named user can change a price

Executed 2026-09-26T21:29:39.723Z → 2026-09-26T21:29:44.327Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| Sam refused before being named | pass | HTTP 403 |
| Morgan names Sam | pass | HTTP 204  |
| Sam recorded as named | pass |  |
| Sam (same session) changes the price | pass | HTTP 201 |
| price is 3.00 | pass |  |

HTTP exchanges: 13 (http-log.json).
