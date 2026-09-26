# TC-13 — story-01-04 #4 — refused attempt record holds user, page, date and time

Executed 2026-09-26T21:29:34.415Z → 2026-09-26T21:29:34.419Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| Jo reads the list | pass | HTTP 200 |
| record for Casey /sales: user, page, date and time | pass | {"id":11,"userKind":"reseller","user":"Casey (Reseller A, buyer)","action":"open page /sales/refused-attempts","at":"2026-09-26T21:29:34.414Z"} |
| record for Casey /sales/store: user, page, date and time | pass | {"id":8,"userKind":"reseller","user":"Casey (Reseller A, buyer)","action":"open page /sales/store/products/new","at":"2026-09-26T21:29:34.411Z"} |
| record for Casey /sales/store/load-summary: user, page, date and time | pass | {"id":6,"userKind":"reseller","user":"Casey (Reseller A, buyer)","action":"open page /sales/store/load-summary","at":"2026-09-26T21:29:34.408Z"} |
| record for Casey /sales/store/products/5: user, page, date and time | pass | {"id":7,"userKind":"reseller","user":"Casey (Reseller A, buyer)","action":"open page /sales/store/products/5","at":"2026-09-26T21:29:34.410Z"} |
| record for Casey /sales/store/products/new: user, page, date and time | pass | {"id":8,"userKind":"reseller","user":"Casey (Reseller A, buyer)","action":"open page /sales/store/products/new","at":"2026-09-26T21:29:34.411Z"} |
| record for Casey /sales/named-users: user, page, date and time | pass | {"id":9,"userKind":"reseller","user":"Casey (Reseller A, buyer)","action":"open page /sales/named-users","at":"2026-09-26T21:29:34.412Z"} |
| record for Casey /sales/resellers: user, page, date and time | pass | {"id":10,"userKind":"reseller","user":"Casey (Reseller A, buyer)","action":"open page /sales/resellers","at":"2026-09-26T21:29:34.413Z"} |
| record for Casey /sales/refused-attempts: user, page, date and time | pass | {"id":11,"userKind":"reseller","user":"Casey (Reseller A, buyer)","action":"open page /sales/refused-attempts","at":"2026-09-26T21:29:34.414Z"} |

HTTP exchanges: 1 (http-log.json).
