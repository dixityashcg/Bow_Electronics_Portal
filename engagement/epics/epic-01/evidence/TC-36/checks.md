# TC-36 — naming and removing twice

Executed 2026-09-26T21:30:04.657Z → 2026-09-26T21:30:08.592Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| first naming accepted | pass | HTTP 204 |
| second naming: no server error | pass | HTTP 409 {"statusCode":409,"message":"That user is already named price maintainer."} |
| one live assignment | pass |  |
| first removal accepted | pass | HTTP 204 |
| second removal: no server error | pass | HTTP 409 {"statusCode":409,"message":"That user is not named price maintainer."} |
| removing someone never named: no server error | pass | HTTP 409 {"statusCode":409,"message":"That user is not named discount setter."} |
| removing an unknown role: 4xx | pass | HTTP 400 |
| list right afterwards: Sam named for nothing, Alex for nothing | pass | [{"id":2,"name":"Alex (rep)","email":"alex@bow.example","roles":[]},{"id":5,"name":"Jo (internal admin)","email":"jo@bow.example","roles":["internal admin"]},{"id":4,"name":"Lee (rep)","email":"lee@bow.example","roles":["discount setter"]},{"id":6,"name":"Morgan (role manager)","email":"morgan@bow.example","roles":["role manager"]},{"id":3,"name":"Pat (rep)","email":"pat@bow.example","roles":["price maintainer"]},{"id":1,"name":"Sam (rep)","email":"sam@bow.example","roles":[]}] |

HTTP exchanges: 9 (http-log.json).
