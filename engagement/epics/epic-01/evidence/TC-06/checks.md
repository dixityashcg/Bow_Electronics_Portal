# TC-06 — story-01-02 #1 — added product found by part number

Executed 2026-09-26T21:29:39.387Z → 2026-09-26T21:29:39.394Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| save accepted | pass | HTTP 201 {"id":1,"partNumber":"QA-ADD-0001","description":"QA resistor 4k7 0603","price":42500,"priceText":"4.25","status":"Open for quoting"} |
| found by part number with the fields entered | pass | {"id":1,"partNumber":"QA-ADD-0001","description":"QA resistor 4k7 0603","price":42500,"priceText":"4.25","status":"Open for quoting"} |
| found by store search on the part number | pass | [{"id":1,"partNumber":"QA-ADD-0001","description":"QA resistor 4k7 0603","price":42500,"priceText":"4.25","status":"Open for quoting"}] |

HTTP exchanges: 3 (http-log.json).
