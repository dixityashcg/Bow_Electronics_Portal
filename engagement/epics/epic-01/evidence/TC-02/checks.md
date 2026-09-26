# TC-02 — story-01-01 #2 — every loaded ERP row matches its store product

Executed 2026-09-26T21:29:34.324Z → 2026-09-26T21:29:34.363Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| every ERP row is either in the store (exact part number bytes) or listed not loaded | pass | 2000 loaded rows found, 8 listed |
| part number, description, price and Open match the ERP row, database bytes, every loaded row | pass | 2000 rows compared |
| lookup by full part number through the interface matches (42 rows incl. first and last) | pass | 42 lookups matched |

HTTP exchanges: 42 (http-log.json).
