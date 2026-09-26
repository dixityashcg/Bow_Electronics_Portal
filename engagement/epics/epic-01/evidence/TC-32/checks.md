# TC-32 — concurrency — 10 price changes on one product at once

Executed 2026-09-26T21:29:39.577Z → 2026-09-26T21:29:39.651Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| no server error | pass |  |
| one history line per accepted change | pass | 10 lines, 10 accepted |
| each line’s old price is the previous line’s new price | pass | 1.00→2.00, 2.00→3.00, 3.00→5.00, 5.00→6.00, 6.00→7.00, 7.00→4.00, 4.00→9.00, 9.00→10.00, 10.00→8.00, 8.00→11.00 |
| final price is the last line’s new price | pass | 11.00 vs 11.00 |

## Notes

- statuses: 201, 201, 201, 201, 201, 201, 201, 201, 201, 201

HTTP exchanges: 14 (http-log.json).
