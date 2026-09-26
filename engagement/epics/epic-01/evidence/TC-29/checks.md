# TC-29 — boundary — prices entered on add

Executed 2026-09-26T21:29:39.457Z → 2026-09-26T21:29:39.478Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| price "0" refused | pass | HTTP 400 {"statusCode":400,"message":"The price was not saved: price is not positive: \"0\"."} |
| price "0" left nothing in the store | pass |  |
| price "0.0001" accepted | pass | HTTP 201 {"id":4,"partNumber":"QA-PRICE-2","description":"QA product QA-PRICE-2","price":1,"priceText":"0.0001","status":"Open for quoting"} |
| price "0.0001" held exactly | pass | {"price":1} |
| price "0.00001" refused | pass | HTTP 400 {"statusCode":400,"message":"The price was not saved: price has more than 4 decimal places: \"0.00001\"."} |
| price "0.00001" left nothing in the store | pass |  |
| price "-1" refused | pass | HTTP 400 {"statusCode":400,"message":"The price was not saved: price is not positive: \"-1\"."} |
| price "-1" left nothing in the store | pass |  |
| price "12,50" refused | pass | HTTP 400 {"statusCode":400,"message":"The price was not saved: price is not a plain number: \"12,50\"."} |
| price "12,50" left nothing in the store | pass |  |
| price "" refused | pass | HTTP 400 {"statusCode":400,"message":"The price was not saved: no price."} |
| price "" left nothing in the store | pass |  |
| price "1e3" refused | pass | HTTP 400 {"statusCode":400,"message":"The price was not saved: price is not a plain number: \"1e3\"."} |
| price "1e3" left nothing in the store | pass |  |
| price "900719925474.0991" accepted | pass | HTTP 201 {"id":5,"partNumber":"QA-PRICE-8","description":"QA product QA-PRICE-8","price":9007199254740991,"priceText":"900719925474.0991","status":"Open for quoting"} |
| price "900719925474.0991" held exactly | pass | {"price":9007199254740991} |
| price "900719925474.0992" refused | pass | HTTP 400 {"statusCode":400,"message":"The price was not saved: price is too large: \"900719925474.0992\"."} |
| price "900719925474.0992" left nothing in the store | pass |  |
| price " 7.50 " accepted | pass | HTTP 201 {"id":6,"partNumber":"QA-PRICE-10","description":"QA product QA-PRICE-10","price":75000,"priceText":"7.50","status":"Open for quoting"} |
| price " 7.50 " held exactly | pass | {"price":75000} |

HTTP exchanges: 17 (http-log.json).
