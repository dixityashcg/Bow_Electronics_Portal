# TC-07 — story-01-02 #2 — 10.00 → 12.00 adds one history line

Executed 2026-09-26T21:29:39.394Z → 2026-09-26T21:29:39.408Z · result **PASS**

| Check | Result | Observed |
|---|---|---|
| change accepted | pass | HTTP 201 |
| exactly one line gained | pass | 0 → 1 |
| old price 10.00 | pass | 10.00 |
| new price 12.00 | pass | 12.00 |
| who made the change: Pat | pass | Pat (rep) |
| date and time within the call | pass | 2026-09-26T21:29:39.401Z ≤ 2026-09-26T21:29:39.404Z ≤ 2026-09-26T21:29:39.405Z |
| database row holds old 100000, new 120000 ten-thousandths | pass | [{"price_change_id":1,"product_id":2,"old_price":100000,"new_price":120000,"changed_by":3,"changed_at":"2026-09-26T21:29:39.404Z"}] |

HTTP exchanges: 5 (http-log.json).
