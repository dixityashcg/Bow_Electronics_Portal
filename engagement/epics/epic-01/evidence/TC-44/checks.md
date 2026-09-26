# TC-44 — store page under other spellings, as a reseller

Executed 2026-09-26T21:29:34.712Z → 2026-09-26T21:29:34.721Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| /SALES/Store: no application page, no server error | pass | HTTP 308 → /sales/store → HTTP 403 |
| //sales/store: no application page, no server error | pass | HTTP 308 → /sales/store → HTTP 403 |
| /sales/%2e%2e/sales/store: no application page, no server error | pass | HTTP 403 |
| /sales%2Fstore: no application page, no server error | pass | HTTP 308 → /sales/store → HTTP 403 |
| /sales/store?x=1: no application page, no server error | pass | HTTP 403 |
| /%73ales/store: no application page, no server error | pass | HTTP 403 |
| /sales/./store: no application page, no server error | pass | HTTP 403 |
| /sales/store/: no application page, no server error | pass | HTTP 403 |
| /Sales: no application page, no server error | pass | HTTP 308 → /sales → HTTP 403 |
| /sales/store%00: no application page, no server error | pass | HTTP 403 |
| /sales/store;x: no application page, no server error | pass | HTTP 403 |

HTTP exchanges: 15 (http-log.json).
