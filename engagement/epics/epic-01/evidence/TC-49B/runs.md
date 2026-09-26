# TC-49B — three runs at 250,000 products, and why they disagree

Each run used a new store and a new portal process at build 762f093, with the same 250,000-row workbook shape. checks.md holds the last run. The load and search figures are client-measured over loopback, so each is at least the server's time.

| Run (2026-09-26, local time) | Load of 250,000 rows | Searches one at a time (median) | 200 searches, 50 at a time: p50 / p95 / max |
|---|---|---|---|
| 1 (15:25) | 48.9 s | not measured | 1,126 / 1,892 / 2,280 ms |
| 2 (15:27) | 14.1 s | 0–11 ms | 133 / 256 / 277 ms |
| 3 (15:28) | 27.8 s | 1–37 ms | 1,107 / 2,288 / 2,459 ms |

**Environment**: the Mac has 10 cores. Its load average was 20–25 during runs 1 and 3 (`uptime` at 15:28 and 15:29), from other Node.js 20 processes and an `npm pack`. None of those processes belongs to this QA run or to the portal. The same build gave a p95 that varied by nine times between runs, so the host, not the portal, is the dominant variable.

**Triage class**: Needs-clean-retest. The N-01 target is not judged from these runs. N-01 is also committed for the test environment on the production database tier (Azure SQL full-text), with a k6 load test. That environment does not exist in Stage 1.
