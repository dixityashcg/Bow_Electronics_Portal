# TC-40 — no session: every internal route

Executed 2026-09-26T21:29:34.689Z → 2026-09-26T21:29:34.704Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| 401 GET /api/sales/store/products?q=capacitor | pass | HTTP 401 |
| 401 GET /api/sales/store/part-numbers/BWE-R0603-10 | pass | HTTP 401 |
| 401 GET /api/sales/store/products/10 | pass | HTTP 401 |
| 401 GET /api/sales/store/products/10/price-history | pass | HTTP 401 |
| 401 POST /api/sales/store/products | pass | HTTP 401 |
| 401 POST /api/sales/store/products/10/price | pass | HTTP 401 |
| 401 POST /api/sales/store/products/10/close | pass | HTTP 401 |
| 401 GET /api/sales/store/load-summary | pass | HTTP 401 |
| 401 POST /api/sales/store/load | pass | HTTP 401 |
| 401 GET /api/sales/resellers | pass | HTTP 401 |
| 401 GET /api/sales/resellers/1/discount-history | pass | HTTP 401 |
| 401 POST /api/sales/resellers/1/standard-discount | pass | HTTP 401 |
| 401 GET /api/sales/named-users | pass | HTTP 401 |
| 401 POST /api/sales/named-users | pass | HTTP 401 |
| 401 DELETE /api/sales/named-users/2/discount%20setter | pass | HTTP 401 |
| 401 GET /api/sales/refused-attempts | pass | HTTP 401 |
| /sales/store sends an anonymous visitor to sign in, with no page | pass | HTTP 302 → /sign-in?next=%2Fsales%2Fstore |

HTTP exchanges: 17 (http-log.json).
