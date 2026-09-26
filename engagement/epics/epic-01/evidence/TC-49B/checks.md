# TC-49B — N-01 — search response at 250,000 products (local)

Executed 2026-09-26T21:28:21.474Z → 2026-09-26T21:29:03.623Z · result **FAIL**

| Check | Result | Observed |
|---|---|---|
| 250,000 rows loaded | pass | HTTP 201 |
| no search failed | pass | 0 |
| p95 ≤ 1.0 s (N-01), measured locally on SQLite, not the committed Azure tier | FAIL | 2288 ms |

## Notes

- workbook 5.1 MB
- load: HTTP 201 in 27.8 s; {"summary":{"loadRunId":1,"fileName":"scale.xlsx","runBy":"Pat (rep)","runAt":"2026-09-26T21:28:52.660Z","rowsInErp":250000,"rowsLoaded":250000,"rowsNotLoaded":0,"complete":true,"statusText":"Load com
- one search at a time, 5 runs each: "capacitor" median 15 ms (50 results); "resistor" median 13 ms (50 results); "QA-SCALE-12345" median 1 ms (10 results); "MOSFET" median 14 ms (50 results); "ceramic 0402" median 10 ms (50 results); "inductor" median 37 ms (50 results); "connector" median 13 ms (50 results); "SO-8" median 24 ms (50 results); "Schottky" median 21 ms (50 results); "thick film" median 51 ms (50 results)
- 200 searches, 4 waves of 50 concurrent, client-measured over loopback: p50 1107 ms, p95 2288 ms, max 2459 ms

HTTP exchanges: 15 (http-log.json).
- See runs.md: three runs, p95 256 ms to 2,288 ms depending on host load (load average 20–25 from processes outside this QA run).
