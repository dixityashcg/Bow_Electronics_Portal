# TC-49 — N-01 (partly) — search response on the loaded store

Executed 2026-09-26T21:29:34.731Z → 2026-09-26T21:29:34.849Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| no search failed | pass | 0 errors |
| p95 ≤ 1.0 s at 2,000 products (the committed scale is 250,000 — see TC-49 note and TC-49B) | pass | 34.7 ms |

## Notes

- 2,000 products; 200 searches in 4 waves of 50 concurrent; client-measured over loopback (≥ server time). p50 16.0 ms, p95 34.7 ms, max 37.0 ms, wall 117 ms.

HTTP exchanges: 10 (http-log.json).
