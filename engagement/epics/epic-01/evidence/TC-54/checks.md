# TC-54 — cross-story: a product added before the ERP load

Executed 2026-09-26T21:31:05.337Z → 2026-09-26T21:31:10.312Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| a maintainer can add a product to the empty store before any load | pass | HTTP 201 |
| the load answers without a server error | pass | HTTP 409 |
| the ERP was loaded, or the load was refused with a reason a maintainer can act on | pass | {"statusCode":409,"message":"The store already holds 1 products, so the ERP load was refused and nothing changed. The load runs once, into an empty store."} |

## Notes

- the go-live load after one early add: HTTP 409 {"statusCode":409,"message":"The store already holds 1 products, so the ERP load was refused and nothing changed. The load runs once, into an empty store."}
- store after the load attempt: 1 product(s). ERP rows: 2008. Removing the early product with the application's own database identity: refused: product rows cannot be deleted. No screen or route removes a product.

HTTP exchanges: 4 (http-log.json).
