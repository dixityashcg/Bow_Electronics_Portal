# TC-26 — malformed load requests

Executed 2026-09-26T21:30:49.783Z → 2026-09-26T21:30:55.196Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| no file: 4xx | pass | HTTP 400 {"statusCode":400,"message":"Choose the ERP spreadsheet (.xlsx) to load."} |
| not multipart at all: 4xx | pass | HTTP 406 {"statusCode":406,"message":"the request is not multipart"} |
| a text file named .xlsx: 4xx | pass | HTTP 400 {"statusCode":400,"message":"The file is not an Excel workbook (.xlsx)."} |
| no Price column: 4xx | pass | HTTP 400 {"statusCode":400,"message":"The heading row (row 1) has no column headed \"price\". Nothing was loaded."} |
| a 26 MB file (over the 25 MB limit): 4xx, not 5xx | pass | HTTP 413 {"statusCode":413,"message":"request file too large"} |
| store still empty | pass |  |
| the real load still possible afterwards | pass | HTTP 201 |

## Notes

- erp_load_run rows after the refusals: 0

HTTP exchanges: 8 (http-log.json).
