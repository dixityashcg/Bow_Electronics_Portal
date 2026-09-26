# TC-45 — N-07 — append-only records refuse update and delete

Executed 2026-09-26T21:29:34.849Z → 2026-09-26T21:29:34.851Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| price_change holds rows to attempt against | pass | 4 rows |
| price_change: UPDATE refused | pass | refused: price_change is append-only: rows cannot be updated |
| price_change: DELETE refused | pass | refused: price_change is append-only: rows cannot be deleted |
| erp_load_run holds rows to attempt against | pass | 1 rows |
| erp_load_run: UPDATE refused | pass | refused: erp_load_run is append-only: rows cannot be updated |
| erp_load_run: DELETE refused | pass | refused: erp_load_run is append-only: rows cannot be deleted |
| erp_load_rejected_row holds rows to attempt against | pass | 8 rows |
| erp_load_rejected_row: UPDATE refused | pass | refused: erp_load_rejected_row is append-only: rows cannot be updated |
| erp_load_rejected_row: DELETE refused | pass | refused: erp_load_rejected_row is append-only: rows cannot be deleted |
| discount_change holds rows to attempt against | pass | 4 rows |
| discount_change: UPDATE refused | pass | refused: discount_change is append-only: rows cannot be updated |
| discount_change: DELETE refused | pass | refused: discount_change is append-only: rows cannot be deleted |
| refused_attempt holds rows to attempt against | pass | 51 rows |
| refused_attempt: UPDATE refused | pass | refused: refused_attempt is append-only: rows cannot be updated |
| refused_attempt: DELETE refused | pass | refused: refused_attempt is append-only: rows cannot be deleted |
| product (ledger, updatable): DELETE refused | pass | refused: product rows cannot be deleted |
| standard_discount (ledger, updatable): DELETE refused | pass | refused: standard_discount rows cannot be deleted |
| role_assignment (ledger, updatable): DELETE refused | pass | refused: role_assignment rows cannot be deleted |
| internal_user (ledger, updatable): DELETE refused | pass | refused: internal_user rows cannot be deleted |
| reseller (ledger, updatable): DELETE refused | pass | refused: reseller rows cannot be deleted |
| reseller_user (ledger, updatable): DELETE refused | pass | refused: reseller_user rows cannot be deleted |

## Notes

- product_history (the kept earlier versions of an updatable ledger, 7 rows): DELETE refused: product_history is append-only: rows cannot be deleted; UPDATE refused: product_history is append-only: rows cannot be updated
- role_assignment_history (the kept earlier versions of an updatable ledger, 1 rows): DELETE refused: role_assignment_history is append-only: rows cannot be deleted; UPDATE refused: role_assignment_history is append-only: rows cannot be updated
- standard_discount_history: empty, nothing to attempt against
- internal_user_history: empty, nothing to attempt against
- reseller_history: empty, nothing to attempt against
- reseller_user_history: empty, nothing to attempt against
- Every attempt ran inside a transaction that was rolled back, so an accepted attempt changed nothing afterwards.

HTTP exchanges: 0 (http-log.json).
