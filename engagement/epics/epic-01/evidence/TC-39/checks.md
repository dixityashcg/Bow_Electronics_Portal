# TC-39 — T-06 — a reseller calls every internal route directly

Executed 2026-09-26T21:29:34.573Z → 2026-09-26T21:29:34.688Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| Casey refused GET /api/sales/store/products?q=capacitor | pass | HTTP 403 |
| Casey's answer carries no store data (GET /api/sales/store/products?q=capacitor) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused GET /api/sales/store/part-numbers/BWE-C1206X7R475K-9 | pass | HTTP 403 |
| Casey's answer carries no store data (GET /api/sales/store/part-numbers/BWE-C1206X7R475K-9) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused GET /api/sales/store/products/9 | pass | HTTP 403 |
| Casey's answer carries no store data (GET /api/sales/store/products/9) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused GET /api/sales/store/products/9/price-history | pass | HTTP 403 |
| Casey's answer carries no store data (GET /api/sales/store/products/9/price-history) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused POST /api/sales/store/products | pass | HTTP 403 |
| Casey's answer carries no store data (POST /api/sales/store/products) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused POST /api/sales/store/products/9/price | pass | HTTP 403 |
| Casey's answer carries no store data (POST /api/sales/store/products/9/price) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused POST /api/sales/store/products/9/close | pass | HTTP 403 |
| Casey's answer carries no store data (POST /api/sales/store/products/9/close) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused GET /api/sales/store/load-summary | pass | HTTP 403 |
| Casey's answer carries no store data (GET /api/sales/store/load-summary) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused POST /api/sales/store/load | pass | HTTP 403 |
| Casey's answer carries no store data (POST /api/sales/store/load) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused GET /api/sales/resellers | pass | HTTP 403 |
| Casey's answer carries no store data (GET /api/sales/resellers) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused GET /api/sales/resellers/1/discount-history | pass | HTTP 403 |
| Casey's answer carries no store data (GET /api/sales/resellers/1/discount-history) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused POST /api/sales/resellers/1/standard-discount | pass | HTTP 403 |
| Casey's answer carries no store data (POST /api/sales/resellers/1/standard-discount) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused GET /api/sales/named-users | pass | HTTP 403 |
| Casey's answer carries no store data (GET /api/sales/named-users) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused POST /api/sales/named-users | pass | HTTP 403 |
| Casey's answer carries no store data (POST /api/sales/named-users) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused DELETE /api/sales/named-users/2/discount%20setter | pass | HTTP 403 |
| Casey's answer carries no store data (DELETE /api/sales/named-users/2/discount%20setter) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| Casey refused GET /api/sales/refused-attempts | pass | HTTP 403 |
| Casey's answer carries no store data (GET /api/sales/refused-attempts) | pass | {"statusCode":403,"message":"You do not have access to this."} |
| nothing changed after Casey’s calls | pass |  |
| every refusal recorded | pass | 16 new records for 16 refusals |
| entitled caller answered GET /api/sales/store/products?q=capacitor | pass | Sam (rep, named for nothing): HTTP 200 [{"id":1563,"partNumber":"BWE-C0201C0G103K-1563","description":"Capacitor, ceramic, 10 nF, 50 V, C0G, 0201","price":595, |
| entitled caller answered GET /api/sales/store/part-numbers/BWE-C1206X7R475K-9 | pass | Sam (rep, named for nothing): HTTP 200 {"id":9,"partNumber":"BWE-C1206X7R475K-9","description":"Capacitor, ceramic, 4.7 µF, 25 V, X7R, 1206","price":615,"price |
| entitled caller answered GET /api/sales/store/products/9 | pass | Sam (rep, named for nothing): HTTP 200 {"id":9,"partNumber":"BWE-C1206X7R475K-9","description":"Capacitor, ceramic, 4.7 µF, 25 V, X7R, 1206","price":615,"price |
| entitled caller answered GET /api/sales/store/products/9/price-history | pass | Sam (rep, named for nothing): HTTP 200 [] |
| entitled caller answered POST /api/sales/store/products | pass | Pat (rep, price maintainer): HTTP 201 {"id":2002,"partNumber":"QA-ROUTE-ADD","description":"route probe","price":10000,"priceText":"1.00","status":"Open for q |
| entitled caller answered POST /api/sales/store/products/9/price | pass | Pat (rep, price maintainer): HTTP 201 {"id":9,"partNumber":"BWE-C1206X7R475K-9","description":"Capacitor, ceramic, 4.7 µF, 25 V, X7R, 1206","price":33300,"pri |
| entitled caller answered POST /api/sales/store/products/9/close | pass | Pat (rep, price maintainer): HTTP 201 {"id":9,"partNumber":"BWE-C1206X7R475K-9","description":"Capacitor, ceramic, 4.7 µF, 25 V, X7R, 1206","price":33300,"pri |
| entitled caller answered GET /api/sales/store/load-summary | pass | Sam (rep, named for nothing): HTTP 200 {"summary":{"loadRunId":1,"fileName":"sample-erp.xlsx","runBy":"Pat (rep)","runAt":"2026-09-26T21:29:34.313Z","rowsInErp |
| entitled caller answered POST /api/sales/store/load | pass | Pat (rep, price maintainer): HTTP 409 {"statusCode":409,"message":"The store already holds 2002 products, so the ERP load was refused and nothing changed. The |
| entitled caller answered GET /api/sales/resellers | pass | Sam (rep, named for nothing): HTTP 200 [{"id":1,"name":"Demo Reseller A","standardDiscount":null,"standardDiscountText":"No standard discount"},{"id":2,"name": |
| entitled caller answered GET /api/sales/resellers/1/discount-history | pass | Sam (rep, named for nothing): HTTP 200 [] |
| entitled caller answered POST /api/sales/resellers/1/standard-discount | pass | Lee (rep, discount setter): HTTP 201 {"id":1,"name":"Demo Reseller A","standardDiscount":700,"standardDiscountText":"7 %"} |
| entitled caller answered GET /api/sales/named-users | pass | Sam (rep, named for nothing): HTTP 200 {"roles":["price maintainer","discount setter"],"users":[{"id":2,"name":"Alex (rep)","email":"alex@bow.example","roles": |
| entitled caller answered POST /api/sales/named-users | pass | Morgan (role manager): HTTP 204  |
| entitled caller answered DELETE /api/sales/named-users/2/discount%20setter | pass | Morgan (role manager): HTTP 204  |
| entitled caller answered GET /api/sales/refused-attempts | pass | Jo (internal admin): HTTP 200 [{"id":34,"userKind":"reseller","user":"Casey (Reseller A, buyer)","action":"read the refused attempts list (GET /api/sa |

HTTP exchanges: 32 (http-log.json).
