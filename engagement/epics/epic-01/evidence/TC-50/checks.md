# TC-50 — T-13 — search text read as plain words

Executed 2026-09-26T21:29:34.722Z → 2026-09-26T21:29:34.730Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| search "\" OR 1=1 --" | pass | HTTP 200 [] |
| search "NEAR((a,b),5)" | pass | HTTP 200 [] |
| search "*" | pass | HTTP 200 [] |
| search "\"" | pass | HTTP 200 [] |
| search "capacitor AND" | pass | HTTP 200 [] |
| search "-" | pass | HTTP 200 [] |
| search "aaaaaaaaaaaaaaaaaaaa… (2000 chars)" | pass | HTTP 200 [] |
| search "%" | pass | HTTP 200 [] |
| search "'; drop table product; --" | pass | HTTP 200 [] |
| store intact after the searches | pass |  |

HTTP exchanges: 9 (http-log.json).
