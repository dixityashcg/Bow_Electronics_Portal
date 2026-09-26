# TC-14 — story-01-04 #5 — direct price change by a rep not named

Executed 2026-09-26T21:29:34.420Z → 2026-09-26T21:29:34.461Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| Sam holds a valid session and anti-forgery token | pass |  |
| refused | pass | HTTP 403 {"statusCode":403,"message":"Only a price maintainer can change a price."} |
| price unchanged | pass |  |
| refusal recorded with the route | pass | {"id":13,"userKind":"internal","user":"Sam (rep)","action":"change a price (POST /api/sales/store/products/6/price)","at":"2026-09-26T21:29:34.459Z"} |

HTTP exchanges: 2 (http-log.json).
