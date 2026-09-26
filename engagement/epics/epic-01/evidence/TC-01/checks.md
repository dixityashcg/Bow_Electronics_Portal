# TC-01 — story-01-01 #1 — loaded + not loaded = N

Executed 2026-09-26T21:29:33.453Z → 2026-09-26T21:29:34.323Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| load accepted | pass | HTTP 201 |
| summary: product rows in the ERP = N | pass | rowsInErp 2008, N 2008 |
| loaded + not loaded = N | pass | 2000 + 8 = 2008; N 2008 |
| rows listed = rows counted as not loaded | pass | 8 listed |
| store holds exactly the number reported loaded | pass | product table 2000, reported 2000 |

## Notes

- N counted independently from seed/sample-erp.xlsx (every non-empty row below the heading row of the first worksheet): 2008

HTTP exchanges: 1 (http-log.json).
