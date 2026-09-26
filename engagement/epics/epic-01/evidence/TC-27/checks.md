# TC-27 — concurrency — five loads at once on an empty store

Executed 2026-09-26T21:30:55.197Z → 2026-09-26T21:31:00.845Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| exactly one load accepted | pass | 1 accepted |
| no server error | pass |  |
| store holds exactly one load’s products (2000) | pass | [{"n":2000}] |
| one load run recorded as loaded | pass | [{"load_run_id":1,"rows_loaded":2000}] |

## Notes

- statuses: 201, 409, 409, 409, 409

HTTP exchanges: 7 (http-log.json).
