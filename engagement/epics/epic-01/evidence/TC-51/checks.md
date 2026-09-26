# TC-51 — boundary — standard discount values

Executed 2026-09-26T21:30:17.936Z → 2026-09-26T21:30:21.833Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| "-1" refused | pass | HTTP 400 {"statusCode":400,"message":"The discount was not changed: not a percentage: \"-1\"."} |
| value after "-1" | pass | null (expected null) |
| "0" accepted | pass | HTTP 201 {"id":1,"name":"Demo Reseller A","standardDiscount":0,"standardDiscountText":"0 %"} |
| value after "0" | pass | 0 (expected 0) |
| "100" accepted | pass | HTTP 201 {"id":1,"name":"Demo Reseller A","standardDiscount":10000,"standardDiscountText":"100 %"} |
| value after "100" | pass | 10000 (expected 10000) |
| "100.01" refused | pass | HTTP 400 {"statusCode":400,"message":"The discount was not changed: a discount cannot be more than 100 %."} |
| value after "100.01" | pass | 10000 (expected 10000) |
| "12.5" accepted | pass | HTTP 201 {"id":1,"name":"Demo Reseller A","standardDiscount":1250,"standardDiscountText":"12.5 %"} |
| value after "12.5" | pass | 1250 (expected 1250) |
| "12.555" refused | pass | HTTP 400 {"statusCode":400,"message":"The discount was not changed: not a percentage: \"12.555\"."} |
| value after "12.555" | pass | 1250 (expected 1250) |
| "" refused | pass | HTTP 400 {"statusCode":400,"message":"The discount was not changed: not a percentage: \"\"."} |
| value after "" | pass | 1250 (expected 1250) |
| "12 %" accepted | pass | HTTP 201 {"id":1,"name":"Demo Reseller A","standardDiscount":1200,"standardDiscountText":"12 %"} |
| value after "12 %" | pass | 1200 (expected 1200) |
| "1e1" refused | pass | HTTP 400 {"statusCode":400,"message":"The discount was not changed: not a percentage: \"1e1\"."} |
| value after "1e1" | pass | 1200 (expected 1200) |
| "101" refused | pass | HTTP 400 {"statusCode":400,"message":"The discount was not changed: a discount cannot be more than 100 %."} |
| value after "101" | pass | 1200 (expected 1200) |
| one history line per accepted change | pass | 4 lines, 4 accepted |

HTTP exchanges: 23 (http-log.json).
