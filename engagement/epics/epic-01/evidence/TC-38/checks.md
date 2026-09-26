# TC-38 — the two named lists are separate

Executed 2026-09-26T21:29:34.551Z → 2026-09-26T21:29:34.572Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| price maintainer refused a discount | pass | HTTP 403 |
| discount setter refused a price change | pass | HTTP 403 |
| discount setter refused add | pass | HTTP 403 |
| discount setter refused close | pass | HTTP 403 |
| discount setter refused the load | pass | HTTP 403 |
| nothing changed | pass |  |

HTTP exchanges: 5 (http-log.json).
