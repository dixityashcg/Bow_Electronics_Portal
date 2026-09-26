# TC-22 — T-14 — bad values in the load

Executed 2026-09-26T21:30:31.158Z → 2026-09-26T21:30:35.220Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| load answered | pass | HTTP 201 {"summary":{"loadRunId":1,"fileName":"erp.xlsx","runBy":"Pat (rep)","runAt":"2026-09-26T21:30:35.210Z","rowsInErp":14,"rowsLoaded":3,"rowsNotLoaded":11,"complete":false,"statusText":"Load not complete |
| identity: loaded + not loaded = 14 | pass | 14: 3 + 11 |
| QA-B-COMMA listed with a reason, not stored | pass | {"rowNumber":3,"partNumber":"QA-B-COMMA","price":"1,234.50","reason":"price is not a plain number: \"1,234.50\""} |
| QA-B-DOLLAR listed with a reason, not stored | pass | {"rowNumber":4,"partNumber":"QA-B-DOLLAR","price":"$12","reason":"price is not a plain number: \"$12\""} |
| QA-B-REF listed with a reason, not stored | pass | {"rowNumber":5,"partNumber":"QA-B-REF","price":"#REF!","reason":"price is an error value: \"#REF!\""} |
| QA-B-FORMULA listed with a reason, not stored | pass | {"rowNumber":6,"partNumber":"QA-B-FORMULA","price":"=1+1","reason":"price is a formula"} |
| QA-B-BLANK listed with a reason, not stored | pass | {"rowNumber":7,"partNumber":"QA-B-BLANK","price":null,"reason":"no price"} |
| QA-B-NEG listed with a reason, not stored | pass | {"rowNumber":8,"partNumber":"QA-B-NEG","price":"-5","reason":"price is not positive: \"-5\""} |
| QA-B-NEGT listed with a reason, not stored | pass | {"rowNumber":11,"partNumber":"QA-B-NEGT","price":"-5","reason":"price is not positive: \"-5\""} |
| QA-B-WORD listed with a reason, not stored | pass | {"rowNumber":13,"partNumber":"QA-B-WORD","price":"TBA","reason":"price is not a plain number: \"TBA\""} |
| QA-B-NA listed with a reason, not stored | pass | {"rowNumber":14,"partNumber":"QA-B-NA","price":"#N/A","reason":"price is an error value: \"#N/A\""} |
| both rows without a part number listed | pass | [{"rowNumber":9,"partNumber":"","price":"3.5","reason":"no part number"},{"rowNumber":10,"partNumber":"   ","price":"3.5","reason":"no part number"}] |
| good rows stored | pass |  |
| not complete | pass | Load not complete: 11 of 14 product rows in the ERP were not loaded. Each is listed below with its reason. |
| store holds exactly the loaded count | pass |  |

## Notes

- ' 12.50 ' as text: stored 125000

HTTP exchanges: 3 (http-log.json).
