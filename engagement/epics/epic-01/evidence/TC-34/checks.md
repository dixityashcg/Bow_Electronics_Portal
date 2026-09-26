# TC-34 — cross-story: add → change price → close → change price → look up

Executed 2026-09-26T21:29:34.536Z → 2026-09-26T21:29:34.551Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| add accepted | pass | HTTP 201 {"id":2001,"partNumber":"QA-SEQ-0001","description":"QA product QA-SEQ-0001","price":50000,"priceText":"5.00","status":"Open for quoting"} |
| price change accepted | pass | HTTP 201 |
| close accepted | pass | HTTP 201 |
| price change on a closed product answers without a server error | pass | HTTP 201 |
| still Closed after the price action | pass | Closed |
| history agrees with the price | pass | history [{"oldPrice":"5.00","newPrice":"6.00","changedBy":"Pat (rep)","changedAt":"2026-09-26T21:29:34.540Z"},{"oldPrice":"6.00","newPrice":"7.00","changedBy":"Pat (rep)","changedAt":"2026-09-26T21:29:34.543Z"}]; price 7.00 |
| history chains old → new | pass | [{"oldPrice":"5.00","newPrice":"6.00","changedBy":"Pat (rep)","changedAt":"2026-09-26T21:29:34.540Z"},{"oldPrice":"6.00","newPrice":"7.00","changedBy":"Pat (rep)","changedAt":"2026-09-26T21:29:34.543Z"}] |

## Notes

- Price change on a closed product: HTTP 201 {"id":2001,"partNumber":"QA-SEQ-0001","description":"QA product QA-SEQ-0001","price":70000,"priceText":"7.00","status":"Closed"} (no criterion states either way)
- Internal store search for the closed product returns 1 result(s): [{"id":2001,"partNumber":"QA-SEQ-0001","description":"QA product QA-SEQ-0001","price":70000,"priceText":"7.00","status":"Closed"}]

HTTP exchanges: 6 (http-log.json).
