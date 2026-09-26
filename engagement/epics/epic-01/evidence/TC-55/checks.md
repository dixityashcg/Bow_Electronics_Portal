# TC-55 — concurrency: adds racing the ERP load on an empty store

Executed 2026-09-26T21:31:10.313Z → 2026-09-26T21:31:14.769Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| no server error | pass | load 201; adds 409,409,409,409,409,201,201,201 |
| store count = products loaded + adds accepted | pass | 2003 in store; 2000 loaded + 3 added |
| no ERP part number holds a racing add’s price while the summary counts it as loaded | pass | [] |

## Notes

- load answered after 376 ms
- add BWE-Y25M-1495 sent at 110 ms → HTTP 409 after 381 ms
- add BWE-L1R0-1496 sent at 140 ms → HTTP 409 after 382 ms
- add BWE-C0402X7R105K-1497 sent at 160 ms → HTTP 409 after 382 ms
- add BWE-ULDO50-1498 sent at 175 ms → HTTP 409 after 383 ms
- add BWE-DSOD123-1499 sent at 185 ms → HTTP 409 after 383 ms
- add QA-RACE-1 sent at 195 ms → HTTP 201 after 384 ms
- add QA-RACE-2 sent at 210 ms → HTTP 201 after 384 ms
- add QA-RACE-3 sent at 260 ms → HTTP 201 after 386 ms
- load HTTP 201; adds 409, 409, 409, 409, 409, 201, 201, 201

HTTP exchanges: 11 (http-log.json).
