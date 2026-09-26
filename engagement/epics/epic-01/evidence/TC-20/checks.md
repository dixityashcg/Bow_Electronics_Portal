# TC-20 — boundary — prices in the load

Executed 2026-09-26T21:30:21.834Z → 2026-09-26T21:30:26.458Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| load answered | pass | HTTP 201 {"summary":{"loadRunId":1,"fileName":"erp.xlsx","runBy":"Pat (rep)","runAt":"2026-09-26T21:30:26.449Z","rowsInErp":11,"rowsLoaded":5,"rowsNotLoaded":6,"complete":false,"statusText":"Load not complete: |
| identity: loaded + not loaded = 11 | pass | 11: 5 + 6 |
| QA-P-0N listed with a reason, not stored | pass | {"rowNumber":2,"partNumber":"QA-P-0N","price":"0","reason":"price is not positive: \"0\""} |
| QA-P-0T listed with a reason, not stored | pass | {"rowNumber":3,"partNumber":"QA-P-0T","price":"0","reason":"price is not positive: \"0\""} |
| QA-P-5DN listed with a reason, not stored | pass | {"rowNumber":6,"partNumber":"QA-P-5DN","price":"0.00015","reason":"price has more than 4 decimal places: \"0.00015\""} |
| QA-P-5DT listed with a reason, not stored | pass | {"rowNumber":7,"partNumber":"QA-P-5DT","price":"0.00015","reason":"price has more than 4 decimal places: \"0.00015\""} |
| QA-P-OVT listed with a reason, not stored | pass | {"rowNumber":11,"partNumber":"QA-P-OVT","price":"900719925474.0992","reason":"price is too large: \"900719925474.0992\""} |
| QA-P-MINN stored exactly (1) | pass | {"part_number":"QA-P-MINN","description":"smallest, number","price":1} |
| QA-P-MINT stored exactly (1) | pass | {"part_number":"QA-P-MINT","description":"smallest, text","price":1} |
| QA-P-MAXT stored exactly (9007199254740991) | pass | {"part_number":"QA-P-MAXT","description":"largest exact, text","price":9007199254740991} |
| QA-P-OK stored exactly (125000) | pass | {"part_number":"QA-P-OK","description":"ordinary","price":125000} |
| QA-P-MAXN: listed, or stored as exactly the value the cell holds (900719925474.0991) | pass | stored 9007199254740991 |
| QA-P-OVN: listed, or stored as exactly the value the cell holds (900719925474.0992) | pass | {"rowNumber":10,"partNumber":"QA-P-OVN","price":"900719925474.0992","reason":"price is too large: \"900719925474.0992\""} |

## Notes

- QA-P-MAXN (a number cell, 900719925474.0991): stored 9007199254740991
- QA-P-OVN (a number cell, 900719925474.0992): listed: price is too large: "900719925474.0992"

HTTP exchanges: 3 (http-log.json).
