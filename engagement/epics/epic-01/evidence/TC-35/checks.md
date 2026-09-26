# TC-35 — cross-story: grant → revoke → grant

Executed 2026-09-26T21:30:01.086Z → 2026-09-26T21:30:04.657Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| removed Pat refused add | pass |  |
| removed Pat refused close | pass |  |
| removed Pat refused price | pass |  |
| removed Pat refused the load | pass |  |
| store unchanged | pass |  |
| Morgan names Pat again | pass | HTTP 204  |
| Pat changes the price again | pass | HTTP 201 |
| role history keeps the earlier grant and the revocation | pass | [{"history_id":1,"internal_user_id":3,"role":"price maintainer","granted_by":null,"granted_at":"2026-09-26T21:30:02.516Z","revoked_by":null,"revoked_at":null,"superseded_at":"2026-09-26T21:30:04.634Z"},{"history_id":2,"internal_user_id":3,"role":"price maintainer","granted_by":null,"granted_at":"2026-09-26T21:30:02.516Z","revoked_by":6,"revoked_at":"2026-09-26T21:30:04.634Z","superseded_at":"2026-09-26T21:30:04.653Z"}] |

## Notes

- role_assignment now: [{"internal_user_id":3,"role":"price maintainer","granted_by":6,"granted_at":"2026-09-26T21:30:04.653Z","revoked_by":null,"revoked_at":null}]

HTTP exchanges: 14 (http-log.json).
