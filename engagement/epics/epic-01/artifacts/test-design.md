# Test design — epic-01

Derived from the approved backlog by `raise epic criteria epic-01`. One rule per
acceptance criterion, one case per rule. The rules are the criteria and are
not yours to change — a criterion that is wrong goes back to the Product
Owner as a change request. The cases are yours to write.

A blank pre- or post-condition means the criterion does not state one. That
is a question for the operator, not a gap for you to fill in from context.

## Rule 1 — `story-01-01#1-01db1a3d`

> Given the ERP holds N product rows, when the load completes, then the number loaded plus the number listed as not loaded equals N.

- **Given** (pre-condition): the ERP holds N product rows
- **When** (action): the load completes
- **Then** (post-condition): the number loaded plus the number listed as not loaded equals N.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-01 | | | |

## Rule 2 — `story-01-01#2-cdbbb004`

> Given a product in the ERP, when its full part number is looked up in the store after the load, then the fields in the first table below match the ERP row.

- **Given** (pre-condition): a product in the ERP
- **When** (action): its full part number is looked up in the store after the load
- **Then** (post-condition): the fields in the first table below match the ERP row.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-02 | | | |

## Rule 3 — `story-01-01#3-ca706188`

> Given an ERP row that has no part number or no price, when the load completes, then the load summary lists that row as not loaded, with the reason.

- **Given** (pre-condition): an ERP row that has no part number or no price
- **When** (action): the load completes
- **Then** (post-condition): the load summary lists that row as not loaded, with the reason.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-03 | | | |

## Rule 4 — `story-01-01#4-5093fdb4`

> Given two ERP rows with the same part number and different prices, when the load completes, then the load summary lists both rows as not loaded, with the reason "duplicate part number".

- **Given** (pre-condition): two ERP rows with the same part number and different prices
- **When** (action): the load completes
- **Then** (post-condition): the load summary lists both rows as not loaded, with the reason "duplicate part number".

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-04 | | | |

## Rule 5 — `story-01-01#5-a93537da`

> Given the load summary lists any row not loaded, when the summary is viewed, then it does not report the load as complete.

- **Given** (pre-condition): the load summary lists any row not loaded
- **When** (action): the summary is viewed
- **Then** (post-condition): it does not report the load as complete.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-05 | | | |

## Rule 6 — `story-01-02#1-939f4e12`

> Given a named user adds a product with a part number, description and price, when they save it, then the product can be found in the store by its part number.

- **Given** (pre-condition): a named user adds a product with a part number, description and price
- **When** (action): they save it
- **Then** (post-condition): the product can be found in the store by its part number.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-06 | | | |

## Rule 7 — `story-01-02#2-5439c08c`

> Given a product priced at 10.00, when a named user changes the price to 12.00, then the product's price history gains one line holding the fields in the table below.

- **Given** (pre-condition): a product priced at 10.00
- **When** (action): a named user changes the price to 12.00
- **Then** (post-condition): the product's price history gains one line holding the fields in the table below.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-07 | | | |

## Rule 8 — `story-01-02#3-8d00a13c`

> Given a product whose price has been changed three times, when its price history is opened, then it shows three lines, oldest first.

- **Given** (pre-condition): a product whose price has been changed three times
- **When** (action): its price history is opened
- **Then** (post-condition): it shows three lines, oldest first.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-08 | | | |

## Rule 9 — `story-01-03#1-43197407`

> Given a product that is open for quoting, when a named user closes it for quoting, then the product page shows its status as Closed.

- **Given** (pre-condition): a product that is open for quoting
- **When** (action): a named user closes it for quoting
- **Then** (post-condition): the product page shows its status as Closed.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-09 | | | |

## Rule 10 — `story-01-04#1-d242d801`

> Given a rep who is not named to maintain prices, when they try to change a product's price, then the change is refused and the product's price is unchanged.

- **Given** (pre-condition): a rep who is not named to maintain prices
- **When** (action): they try to change a product's price
- **Then** (post-condition): the change is refused and the product's price is unchanged.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-10 | | | |

## Rule 11 — `story-01-04#2-be030b5c`

> Given a rep who is not named to maintain prices, when they try to add a product or close one for quoting, then the action is refused and the store is unchanged.

- **Given** (pre-condition): a rep who is not named to maintain prices
- **When** (action): they try to add a product or close one for quoting
- **Then** (post-condition): the action is refused and the store is unchanged.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-11 | | | |

## Rule 12 — `story-01-04#3-4acf0d15`

> Given a reseller user, when they try to open any page of the catalog and pricing store, then access is refused.

- **Given** (pre-condition): a reseller user
- **When** (action): they try to open any page of the catalog and pricing store
- **Then** (post-condition): access is refused.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-12 | | | |

## Rule 13 — `story-01-04#4-99a133ea`

> Given a reseller user was refused a store page, when the record of refused attempts is checked, then it holds the fields in the table below.

- **Given** (pre-condition): a reseller user was refused a store page
- **When** (action): the record of refused attempts is checked
- **Then** (post-condition): it holds the fields in the table below.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-13 | | | |

## Rule 14 — `story-01-04#5-59d54900`

> Given a rep who is not named, when they send a price change directly without using the product page, then it is refused and the price is unchanged.

- **Given** (pre-condition): a rep who is not named
- **When** (action): they send a price change directly without using the product page
- **Then** (post-condition): it is refused and the price is unchanged.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-14 | | | |

## Rule 15 — `story-01-05#1-98851829`

> Given Jensen Huang names rep Pat to maintain prices, when Pat is recorded as named, then Pat can change a product's price.

- **Given** (pre-condition): Jensen Huang names rep Pat to maintain prices
- **When** (action): Pat is recorded as named
- **Then** (post-condition): Pat can change a product's price.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-15 | | | |

## Rule 16 — `story-01-05#2-e9ee8fdc`

> Given Pat is no longer named to maintain prices, when Pat tries to change a price, then it is refused and the price is unchanged.

- **Given** (pre-condition): Pat is no longer named to maintain prices
- **When** (action): Pat tries to change a price
- **Then** (post-condition): it is refused and the price is unchanged.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-16 | | | |

## Rule 17 — `story-01-05#3-21e37313`

> Given Jensen Huang names rep Lee to set discounts, when Lee is recorded as named, then Lee can set a reseller's standard discount.

- **Given** (pre-condition): Jensen Huang names rep Lee to set discounts
- **When** (action): Lee is recorded as named
- **Then** (post-condition): Lee can set a reseller's standard discount.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-17 | | | |

## Rule 18 — `story-01-05#4-261e4cb3`

> Given Lee is no longer named to set discounts, when Lee tries to change a standard discount, then it is refused and the discount is unchanged.

- **Given** (pre-condition): Lee is no longer named to set discounts
- **When** (action): Lee tries to change a standard discount
- **Then** (post-condition): it is refused and the discount is unchanged.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-18 | | | |

## Rule 19 — `story-01-05#5-e9b96b4f`

> Given a rep who is not named for either, when they try to change who is named, then it is refused.

- **Given** (pre-condition): a rep who is not named for either
- **When** (action): they try to change who is named
- **Then** (post-condition): it is refused.

| Case | Steps | Expected | Result |
|---|---|---|---|
| TC-19 | | | |
