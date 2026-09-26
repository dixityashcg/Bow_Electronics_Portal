# TC-37 — T-08 — nobody names themself; only nameable roles

Executed 2026-09-26T21:30:08.592Z → 2026-09-26T21:30:13.510Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| Jo names self price maintainer: refused | pass | HTTP 403 |
| Morgan names self discount setter: refused | pass | HTTP 403 {"statusCode":403,"message":"Nobody can name themself. Another role manager must do it."} |
| Morgan grants Alex "internal admin" here: refused | pass | HTTP 400 |
| Morgan grants Alex "role manager" here: refused | pass | HTTP 400 |
| unknown user: 4xx | pass | HTTP 404 {"statusCode":404,"message":"No active internal user with that id."} |
| Morgan removes own role manager role through this route: 4xx | pass | HTTP 400 |
| lists unchanged | pass |  |

## Notes

- Chris has no internal_user row, so he cannot be addressed by id.

HTTP exchanges: 10 (http-log.json).
