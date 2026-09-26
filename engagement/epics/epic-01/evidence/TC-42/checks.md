# TC-42 — T-21 — anti-forgery token and cookie

Executed 2026-09-26T21:29:39.661Z → 2026-09-26T21:29:39.722Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| no token: refused | pass | HTTP 403 |
| wrong token: refused | pass | HTTP 403 |
| another user’s token: refused | pass | HTTP 403 |
| a plain form post (what a cross-site form sends): refused | pass | HTTP 403 |
| price unchanged at 5.00 | pass |  |
| session cookie HttpOnly and SameSite=Strict | pass | bow_session=<redacted>; Path=/; HttpOnly; SameSite=Strict |
| with the right token: accepted (the refusals are not a broken route) | pass | HTTP 201 |

HTTP exchanges: 8 (http-log.json).
