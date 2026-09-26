# TC-41 — T-05 — a Bow account not on the internal users list

Executed 2026-09-26T21:29:39.382Z → 2026-09-26T21:29:39.386Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| sign-in refused | pass | HTTP 401 {"statusCode":401,"message":"This Bow account is not on the portal’s internal users list."} |
| no session issued | pass |  |
| no store access | pass | HTTP 401 |
| refusal recorded | pass | {"id":1,"userKind":"staff not listed","user":"Chris (Bow, not on the list) <chris@bow.example>","action":"sign in to the internal side","at":"2026-09-26T21:29:39.383Z"} |

HTTP exchanges: 3 (http-log.json).
