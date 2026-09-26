# TC-16 — story-01-05 #2 — no longer named, refused

Executed 2026-09-26T21:29:44.327Z → 2026-09-26T21:29:48.781Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| Pat changes a price while named | pass |  |
| Morgan removes Pat | pass | HTTP 204  |
| Pat (same session) refused | pass | HTTP 403 {"statusCode":403,"message":"Only a price maintainer can change a price."} |
| price unchanged at 2.50 | pass | 2.50 |
| history unchanged | pass |  |

HTTP exchanges: 12 (http-log.json).
