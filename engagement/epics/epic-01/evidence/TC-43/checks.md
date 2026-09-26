# TC-43 — who may read the refused attempts list

Executed 2026-09-26T21:29:34.705Z → 2026-09-26T21:29:34.711Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| Sam (rep, named for nothing) refused | pass | HTTP 403 |
| Pat (rep, price maintainer) refused | pass | HTTP 403 |
| Morgan (role manager) refused | pass | HTTP 403 |
| Lee (rep, discount setter) refused | pass | HTTP 403 |
| Casey (Reseller A, buyer) refused | pass | HTTP 403 |
| Riley (Reseller A, admin) refused | pass | HTTP 403 |
| Jo (internal admin) answered | pass | HTTP 200 |

HTTP exchanges: 7 (http-log.json).
