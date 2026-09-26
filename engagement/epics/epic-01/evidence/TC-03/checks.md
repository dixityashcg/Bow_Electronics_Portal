# TC-03 — story-01-01 #3 — no part number / no price listed with reason

Executed 2026-09-26T21:29:34.364Z → 2026-09-26T21:29:34.366Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| sample has at least one row with no part number and one with no price | pass | no part number: rows 37; no price: rows 211 |
| row 37 listed with a reason | pass | {"rowNumber":37,"partNumber":"","price":"0.004","reason":"no part number"} |
| row 211 listed with a reason | pass | {"rowNumber":211,"partNumber":"BWE-R0603-100419","price":null,"reason":"no price"} |
| row 211 (BWE-R0603-100419) not in the store | pass | HTTP 404 |

HTTP exchanges: 1 (http-log.json).
