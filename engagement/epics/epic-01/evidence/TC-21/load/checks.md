# TC-21/load — boundary — part number length in the load (63 / 64 / 65)

Executed 2026-09-26T21:30:26.465Z → 2026-09-26T21:30:31.157Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| 63 loaded | pass |  |
| 64 loaded | pass |  |
| 65 listed with a reason, not stored | pass | {"rowNumber":4,"partNumber":"QA-LEN-YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY","price":"1","reason":"part number is longer than 64 characters"} |
| identity 3 | pass |  |

HTTP exchanges: 3 (http-log.json).
