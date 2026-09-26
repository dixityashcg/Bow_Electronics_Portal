# TC-25 — boundary — an ERP of zero rows and of one row

Executed 2026-09-26T21:30:39.366Z → 2026-09-26T21:30:49.782Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| N = 0: identity holds | pass | {"loadRunId":1,"fileName":"erp.xlsx","runBy":"Pat (rep)","runAt":"2026-09-26T21:30:44.352Z","rowsInErp":0,"rowsLoaded":0,"rowsNotLoaded":0,"complete":true,"statusText":"Load complete: all 0 product rows in the ERP were loaded.","notLoaded":[]} |
| an empty load does not block the real load (the store is still empty) | pass | HTTP 201 |
| N = 1: loaded, identity holds, complete | pass | {"loadRunId":1,"fileName":"erp.xlsx","runBy":"Pat (rep)","runAt":"2026-09-26T21:30:49.779Z","rowsInErp":1,"rowsLoaded":1,"rowsNotLoaded":0,"complete":true,"statusText":"Load complete: all 1 product rows in the ERP were loaded.","notLoaded":[]} |

## Notes

- heading-only workbook: HTTP 201 {"summary":{"loadRunId":1,"fileName":"erp.xlsx","runBy":"Pat (rep)","runAt":"2026-09-26T21:30:44.352Z","rowsInErp":0,"rowsLoaded":0,"rowsNotLoaded":0,"complete":true,"statusText":"Load complete: all 0 product rows in the ERP were loaded.","notLoaded":[]}}
- N = 0 reported complete: true — "Load complete: all 0 product rows in the ERP were loaded."
- after an empty load, the real load: HTTP 201 {"summary":{"loadRunId":2,"fileName":"sample-erp.xlsx","runBy":"Pat (rep)","runAt":"2026-09-26T21:30:45.239Z","rowsInErp":2008,"rowsLoaded":2000,"rowsNotLoaded":8,"complete":false,"statusText":"Load n

HTTP exchanges: 7 (http-log.json).
