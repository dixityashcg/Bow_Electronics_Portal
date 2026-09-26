# TC-31 — price change transitions — same, invalid, unknown and malformed product

Executed 2026-09-26T21:29:39.565Z → 2026-09-26T21:29:39.576Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| invalid price refused 4xx | pass | HTTP 400 |
| no history line from a same or invalid price | pass | [] |
| unknown product 404 | pass | HTTP 404 {"statusCode":404,"message":"No product with that id."} |
| malformed id 4xx | pass | HTTP 400 |
| history of an unknown product: 404, not an empty list | pass | HTTP 404 {"statusCode":404,"message":"No product with that id."} |
| unknown product read: 404 | pass | HTTP 404 |
| id beyond integer range: 4xx, not 5xx | pass | HTTP 404 |

## Notes

- same price: HTTP 409 {"statusCode":409,"message":"The price is already 10.00. Nothing was changed."}

HTTP exchanges: 10 (http-log.json).
