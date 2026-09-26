# TC-24 — T-15 — the load run a second time over a maintained store

Executed 2026-09-26T21:29:34.461Z → 2026-09-26T21:29:34.536Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| maintained price change accepted | pass | HTTP 201 |
| second load refused (4xx) | pass | HTTP 409 {"statusCode":409,"message":"The store already holds 2000 products, so the ERP load was refused and nothing changed. The load runs once, into an empty store."} |
| product count unchanged | pass |  |
| maintained price not overwritten | pass |  |

## Notes

- erp_load_run rows before 1, after 1

HTTP exchanges: 2 (http-log.json).
