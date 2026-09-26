# TC-21 — boundary — part number length on add (63 / 64 / 65)

Executed 2026-09-26T21:29:39.479Z → 2026-09-26T21:29:39.548Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| add 63 characters accepted | pass | HTTP 201 {"id":7,"partNumber":"QA-LEN-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX","description":"QA product QA-LEN-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX |
| 63 characters found by lookup | pass |  |
| add 64 characters accepted | pass | HTTP 201 {"id":8,"partNumber":"QA-LEN-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX","description":"QA product QA-LEN-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX |
| 64 characters found by lookup | pass |  |
| add 65 characters refused | pass | HTTP 400 {"statusCode":400,"message":"A part number is at most 64 characters"} |

HTTP exchanges: 5 (http-log.json).
