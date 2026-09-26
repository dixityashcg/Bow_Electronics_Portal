# TC-17 — story-01-05 #3 — named discount setter sets a standard discount

Executed 2026-09-26T21:29:48.781Z → 2026-09-26T21:29:53.459Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| Alex refused before being named | pass | HTTP 403 |
| Morgan names Alex discount setter | pass | HTTP 204 |
| Alex sets Demo Reseller A to 12 | pass | HTTP 201 {"id":1,"name":"Demo Reseller A","standardDiscount":1200,"standardDiscountText":"12 %"} |
| Demo Reseller A shows 12 % | pass | {"id":1,"name":"Demo Reseller A","standardDiscount":1200,"standardDiscountText":"12 %"} |
| one discount history line, none → 12 %, by Alex | pass | [{"oldPercent":"None","newPercent":"12 %","changedBy":"Alex (rep)","changedAt":"2026-09-26T21:29:53.452Z"}] |

HTTP exchanges: 9 (http-log.json).
