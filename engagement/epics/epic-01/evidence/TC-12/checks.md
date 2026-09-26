# TC-12 — story-01-04 #3 — reseller refused every store page

Executed 2026-09-26T21:29:34.405Z → 2026-09-26T21:29:34.415Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| Casey refused /sales | pass | HTTP 403 |
| Pat answered /sales (the route answers) | pass | HTTP 200 |
| Casey refused /sales/store | pass | HTTP 403 |
| Pat answered /sales/store (the route answers) | pass | HTTP 200 |
| Casey refused /sales/store/load-summary | pass | HTTP 403 |
| Pat answered /sales/store/load-summary (the route answers) | pass | HTTP 200 |
| Casey refused /sales/store/products/5 | pass | HTTP 403 |
| Pat answered /sales/store/products/5 (the route answers) | pass | HTTP 200 |
| Casey refused /sales/store/products/new | pass | HTTP 403 |
| Pat answered /sales/store/products/new (the route answers) | pass | HTTP 200 |
| Casey refused /sales/named-users | pass | HTTP 403 |
| Pat answered /sales/named-users (the route answers) | pass | HTTP 200 |
| Casey refused /sales/resellers | pass | HTTP 403 |
| Pat answered /sales/resellers (the route answers) | pass | HTTP 200 |
| Casey refused /sales/refused-attempts | pass | HTTP 403 |
| Pat answered /sales/refused-attempts (the route answers) | pass | HTTP 200 |
| Riley (Reseller A admin) refused /sales/store | pass | HTTP 403 |

HTTP exchanges: 17 (http-log.json).
