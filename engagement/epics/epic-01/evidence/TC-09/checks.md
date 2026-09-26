# TC-09 — story-01-03 #1 — closed product shows Closed

Executed 2026-09-26T21:29:34.387Z → 2026-09-26T21:29:34.393Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| product starts Open for quoting | pass | Open for quoting |
| close accepted | pass | HTTP 201 {"id":2,"partNumber":"BWE-L1R0-2","description":"Inductor, 1 µH, 2 A, shielded","price":8400,"priceText":"0.84","status":"Closed"} |
| product shows status Closed | pass | Closed |
| product page is served to the maintainer | pass | HTTP 200 |

## Notes

- The status is read from the interface the product page renders; the rendered badge itself was not seen (no browser in this session).

HTTP exchanges: 3 (http-log.json).
