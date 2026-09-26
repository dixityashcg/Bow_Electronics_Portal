# TC-46 — N-09 — role removal takes effect on the next action

Executed 2026-09-26T21:30:13.510Z → 2026-09-26T21:30:17.936Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| both roles work before removal | pass |  |
| Pat’s next price change refused, no grace | pass | HTTP 403 |
| Lee’s next discount change refused, no grace | pass | HTTP 403 |
| values unchanged (2.10, 11 %) | pass | {"id":3,"name":"Demo Reseller C","standardDiscount":1100,"standardDiscountText":"11 %"} |

HTTP exchanges: 16 (http-log.json).
