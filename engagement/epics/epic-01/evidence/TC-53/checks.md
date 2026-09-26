# TC-53 — four-place prices read back without losing places

Executed 2026-09-26T21:30:26.458Z → 2026-09-26T21:30:26.465Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| 0.0001 reads back as 0.0001 | pass | {"id":2,"partNumber":"QA-P-MINT","description":"smallest, text","price":1,"priceText":"0.0001","status":"Open for quoting"} |
| 0.0040 reads back as 0.0040 | pass | {"id":6,"partNumber":"QA-FOURPLACE","description":"QA product QA-FOURPLACE","price":40,"priceText":"0.0040","status":"Open for quoting"} |
| largest price reads back as 900719925474.0991 | pass | {"id":4,"partNumber":"QA-P-MAXT","description":"largest exact, text","price":9007199254740991,"priceText":"900719925474.0991","status":"Open for quoting"} |

HTTP exchanges: 4 (http-log.json).
