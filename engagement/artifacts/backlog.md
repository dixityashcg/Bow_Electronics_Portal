# Backlog: Bow Electronics Reseller Portal

**Status**: Draft · **Prepared by**: Mark Zuckerberg (BA) · **For approval by**: Jensen Huang (Product Owner) · **Built from**: the approved BRD (g1-brd)

Six Epics, each grouped by what someone at Bow or at a reseller can newly do. Every story names the BRD requirement it delivers. Decisions taken while writing this backlog are listed at the end, with who confirmed them.

<!--
  Structure notes for the tooling: every Epic carries id, demonstrable-via and
  demo-notes; every Story carries id and acceptance criteria. No repositories
  are registered, so no Epic carries a touches line.
-->

## Epic: The catalog and pricing store replaces the Excel ERP

- **id**: `epic-01`
- **objective**: Bow's products and prices live in one maintained place with a record of every price change, so every quote can be priced from it from go-live instead of from the Excel ERP (NF-01; serves O-02).
- **demonstrable-via**: `ui`
- **demo-notes**: Actor: a Bow user named to maintain prices. Before the demo, the ERP has been loaded into the store (story-01-01) — never demo against an empty store. (1) Open the load summary: it shows the number of products in the ERP, the number loaded, and lists any row not loaded with the reason. (2) Search the store for one part number picked at random from the ERP; its description and price match the ERP row. (3) Change that product's price; open its price history and see the old price, new price, the user's name and the time. (4) Add a new product; it appears in the store. (5) Close a product for quoting; it shows as Closed. (6) Remove rep Pat from the price maintainers (story-01-05), log in as Pat and try to change a price: the change is refused and the price is unchanged.

**Demo — what you will see**

You open the load summary and see that every product in the ERP spreadsheet arrived in the catalog and pricing store, with any row that did not arrive listed and explained. You pick a part at random and see the same description and price as in the ERP. You change its price and open its price history, which shows the old price, the new one, who changed it and when. You add a product and close another for quoting. Then you take a rep off the list of people allowed to change prices, and watch that rep try and be refused. Exercises: story-01-01, story-01-02, story-01-03, story-01-04, story-01-05.

### Story: Load the Excel ERP into the store and confirm nothing is missing

- **id**: `story-01-01`
- **screens**: catalog and pricing store — load summary
- **traces to**: BR-17, NF-03

**As a** Bow user named to maintain prices, **I want** every product in the Excel ERP loaded into the catalog and pricing store with a summary of what arrived, **so that** I can sign off that the store is complete before the ERP is frozen.

**Acceptance Criteria**

1. Given the ERP holds N product rows, when the load completes, then the number loaded plus the number listed as not loaded equals N.
2. Given a product in the ERP, when its full part number is looked up in the store after the load, then the fields in the first table below match the ERP row.
3. Given an ERP row that has no part number or no price, when the load completes, then the load summary lists that row as not loaded, with the reason.
4. Given two ERP rows with the same part number and different prices, when the load completes, then the load summary lists both rows as not loaded, with the reason "duplicate part number".
5. Given the load summary lists any row not loaded, when the summary is viewed, then it does not report the load as complete.

| Load summary shows |
|---|
| Product rows in the ERP |
| Products loaded into the store |
| Each row not loaded, with its reason |

| Field held per product | Source in ERP |
|---|---|
| Part number | ERP part number column |
| Description | ERP description column |
| Price | ERP price column |
| Status (Open for quoting / Closed) | Open for every loaded product |

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- Run against a copy of the real ERP spreadsheet supplied by the ERP owner NF-03 names, not a made-up file
- The ERP columns are mapped with the ERP owner; the mapping is kept with the story

**Expected output**: A catalog and pricing store holding every ERP product, and a load summary a person can check against the ERP.

### Story: Add a product and change a price, with the history kept

- **id**: `story-01-02`
- **screens**: catalog and pricing store — product page, price history
- **traces to**: BR-17

**As a** Bow user named to maintain prices, **I want** to add products and change prices in the store, with every price change recorded, **so that** the store stays the single source of price after go-live and anyone can see how a price got to where it is.

**Acceptance Criteria**

1. Given a named user adds a product with a part number, description and price, when they save it, then the product can be found in the store by its part number.
2. Given a product priced at 10.00, when a named user changes the price to 12.00, then the product's price history gains one line holding the fields in the table below.
3. Given a product whose price has been changed three times, when its price history is opened, then it shows three lines, oldest first.

| Price history line |
|---|
| Old price |
| New price |
| Who made the change |
| Date and time |

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit

**Expected output**: A product page in the store with add, change-price and price-history.

### Story: Close a product for quoting

- **id**: `story-01-03`
- **screens**: catalog and pricing store — product page
- **traces to**: BR-17, BR-18

**As a** Bow user named to maintain prices, **I want** to close a product for quoting, **so that** resellers stop requesting parts Bow no longer quotes.

**Acceptance Criteria**

1. Given a product that is open for quoting, when a named user closes it for quoting, then the product page shows its status as Closed.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit

**Expected output**: A close-for-quoting action on the product page. (Removal from product search is checked in story-02-02; the flag in the reps' list in story-03-05.)

### Story: Refuse a price change from anyone not named to make it

- **id**: `story-01-04`
- **screens**: catalog and pricing store — product page
- **traces to**: BR-17, BR-03

**As a** Product Owner accountable for Bow's prices, **I want** only the named users to be able to change the store, **so that** a price cannot move without someone accountable for it.

**Acceptance Criteria**

1. Given a rep who is not named to maintain prices, when they try to change a product's price, then the change is refused and the product's price is unchanged.
2. Given a rep who is not named to maintain prices, when they try to add a product or close one for quoting, then the action is refused and the store is unchanged.
3. Given a reseller user, when they try to open any page of the catalog and pricing store, then access is refused.
4. Given a reseller user was refused a store page, when the record of refused attempts is checked, then it holds the fields in the table below.
5. Given a rep who is not named, when they send a price change directly without using the product page, then it is refused and the price is unchanged.

| Refused attempt record (used by every refusal under BR-03) |
|---|
| The user |
| The page or action attempted |
| Date and time |

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- Criterion 3 needs a reseller user, created in story-02-01; until epic-02 lands, it is tested with a test reseller user
- Where the record of refused attempts is read is decided in Architecture

**Expected output**: Store changes limited to named users; refused attempts recorded.

### Story: Name who may maintain prices and who may set discounts

- **id**: `story-01-05`
- **screens**: named users (internal sales)
- **traces to**: BR-17, BR-20

**As a** Product Owner, **I want** to decide which Bow users may change prices and which may set reseller discounts, and to take that away again, **so that** every price and discount change is made by someone I named.

**Acceptance Criteria**

1. Given Jensen Huang names rep Pat to maintain prices, when Pat is recorded as named, then Pat can change a product's price.
2. Given Pat is no longer named to maintain prices, when Pat tries to change a price, then it is refused and the price is unchanged.
3. Given Jensen Huang names rep Lee to set discounts, when Lee is recorded as named, then Lee can set a reseller's standard discount.
4. Given Lee is no longer named to set discounts, when Lee tries to change a standard discount, then it is refused and the discount is unchanged.
5. Given a rep who is not named for either, when they try to change who is named, then it is refused.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- Whether naming is a screen or configuration is decided in Architecture (NF-02); revocation must work either way
- The two lists are separate: being named for one does not grant the other

**Expected output**: Two lists of named internal users — price maintainers and discount setters — that can be added to and removed from.

---

## Epic: A reseller user requests a quote and gets a request ID

- **id**: `epic-02`
- **objective**: Every quote request a reseller makes has a request ID, a received time and a confirmation email from the moment it is made, instead of existing only in a phone call (O-01; BR-06 feeds O-02).
- **demonstrable-via**: `ui`
- **demo-notes**: Needs the store loaded (story-01-01). Actor 1: a rep. Create reseller "Demo Reseller A" with its first admin, and a second reseller "Demo Reseller B" with one user. Actor 2: the admin of Reseller A, logged in. (1) Search a full part number taken from the ERP; the product is returned, with no price and no stock shown. (2) Search a word from a description; matching products are returned. (3) Search the part number of a product closed in story-01-03; it is not returned. (4) Add two products, set quantity 0 on one and submit: the request is refused and the message names line 2 and the reason. (5) Correct it to 5 and submit: a request ID and received time are shown. (6) Open the mailbox of the admin: within 15 minutes a confirmation email shows the request ID, both products with quantities and the received time. (7) Open My requests: the request shows with status Received. (8) Log in as the Reseller B user: My requests does not show Reseller A's request, and typing its request ID finds nothing. (9) As the Reseller B user, try to open the open requests list: refused. (10) With email sending switched off in the demo environment, submit another request: it is still recorded, and the failed emails list shows it to the rep.

**Demo — what you will see**

A rep sets up a reseller and its first admin. You then log in as that admin, find a part by its part number and another by a word in its description, and see no prices and no stock — only the parts Bow quotes. You submit a request with a mistake in one line and are told exactly which line is wrong; you fix it, submit, and get a request ID straight away and a confirmation email shortly after. You see the request in My requests. A user from a different reseller logs in and cannot see it or find it. Finally, when the email cannot be sent, you see the request still recorded and the failure shown to the internal sales team. Exercises: story-02-01, story-02-02, story-02-03, story-02-04, story-02-05, story-02-06.

### Story: Set up a reseller and its first admin

- **id**: `story-02-01`
- **screens**: resellers page (internal sales)
- **traces to**: BR-02, BR-03, BR-01, NF-04 — decisions D2-Q1, D2-C2

**As a** rep, **I want** to create a reseller and its first admin in the portal, **so that** the reseller can log in and manage its own users from then on.

**Acceptance Criteria**

1. Given a rep enters a reseller name and the first admin's name and email, when they save, then the reseller appears on the resellers page with that person shown as its admin.
2. Given a first admin has been created, when they follow their sign-in invitation and log in, then they see their own reseller's name in the portal.
3. Given a reseller already exists, when a rep adds a user or an admin to it, then that person is shown as a user of that reseller on the resellers page.
4. Given a person is already a user of one reseller, when a rep tries to add the same email to a second reseller, then it is refused with a message that the email already belongs to a reseller.
5. Given a reseller user, when they try to open the resellers page, then access is refused and a refused attempt record is kept (table in story-01-04).
6. Given Reseller A has an admin, when a rep adds a user to Reseller A, then Reseller A's admins receive an email naming the new user and the Bow user who added them.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- There is no way for a reseller to register itself (checked by searching the public pages for a sign-up)
- The sign-in approach is decided in Architecture (NF-02); the criteria hold whatever it is

**Expected output**: A resellers page where internal sales create resellers and their users.

### Story: Find a product by part number or description

- **id**: `story-02-02`
- **screens**: product search
- **traces to**: BR-04, BR-18, A-03, §4.2 stock exclusion

**As a** reseller user, **I want** to find Bow's products by part number or by words in the description, **so that** I can build a quote request without phoning a rep.

**Acceptance Criteria**

1. Given a product open for quoting, when its full part number is searched, then that product is in the results.
2. Given a product open for quoting whose description contains the word "capacitor", when "capacitor" is searched, then that product is in the results.
3. Given a product closed for quoting, when its full part number is searched, then no result is returned for it.
4. Given any search results, when the results page is examined, then no price is shown for any product.
5. Given any search results, when the results page is examined, then no stock level or availability is shown for any product.
6. Given a search matches no product, when the results page loads, then it says no products match.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- Checked against the loaded ERP data, not a handful of test products

**Expected output**: A product search page showing part number and description only.

### Story: Submit a quote request and get a request ID

- **id**: `story-02-03`
- **screens**: quote request, request confirmation
- **traces to**: BR-05, BR-06

**As a** reseller user, **I want** to submit one request for several products with their quantities and get a request ID at once, **so that** I have a reference to track it by instead of phoning to ask.

**Acceptance Criteria**

1. Given a buyer has added three products each with a whole-number quantity above zero, when they submit, then the confirmation page shows a request ID and the date and time received.
2. Given a request has been submitted, when it is opened, then it lists the same three products and quantities that were submitted.
3. Given two requests submitted one after the other, when their request IDs are compared, then they are different.
4. Given a submitted request, when any user — reseller or internal — tries to change its request ID or received time, by screen or directly, then it is refused and both are unchanged.
5. Given a request with one product at quantity 1, when the buyer submits, then it is recorded.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- A test submits many requests at once and finds no two with the same request ID

**Expected output**: A quote request page and a confirmation page showing the request ID and received time.

### Story: Refuse a request with no products or a bad quantity

- **id**: `story-02-04`
- **screens**: quote request
- **traces to**: BR-05

**As a** reseller user, **I want** to be told exactly which line is wrong when my request cannot be accepted, **so that** I can fix it myself rather than phone Bow.

**Acceptance Criteria**

1. Given a request with no products, when the buyer submits, then it is refused with the message that at least one product is needed.
2. Given a request whose second line has quantity 0, when the buyer submits, then it is refused and the message names line 2 and says the quantity must be a whole number greater than zero.
3. Given a request with a quantity of 2.5 or -3 on any line, when the buyer submits, then it is refused and the message names that line.
4. Given a request has been refused, when My requests is opened, then no request was recorded and no request ID was used.
5. Given a request has been refused, when the buyer looks at the quote request page, then the lines they entered are still there to correct.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit

**Expected output**: Line-level refusal messages on the quote request page.

### Story: Send the confirmation email, and show Bow when it fails

- **id**: `story-02-05`
- **screens**: confirmation email; failed emails list (internal sales)
- **traces to**: BR-07, BR-01

**As a** reseller user, **I want** a confirmation email with my request ID and what I asked for, **so that** I have a record of the request outside the portal.

**Acceptance Criteria**

1. Given a request is recorded, when 15 minutes have passed, then the submitting user has received a confirmation email holding the fields in the first table below.
2. Given the confirmation email cannot be sent, when a rep opens the failed emails list, then it shows an entry holding the fields in the second table below.
3. Given the confirmation email cannot be sent, when the buyer opens My requests, then the request is still there with its request ID.
4. Given a request from Reseller A, when its confirmation email is sent, then no user of any other reseller receives it.

| Confirmation email shows |
|---|
| Request ID |
| Each product and its quantity |
| Received date and time |

| Failed emails list entry (also used by story-04-05) |
|---|
| Request ID |
| Which email (confirmation or quote ready) |
| Intended recipient |
| Date and time of the failure |

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- The email platform is decided in Architecture (NF-02); criterion 2 is tested by making sending fail
- "Cannot be sent" means refused when sending; an email that bounces later is not caught (see assumptions)

**Expected output**: A confirmation email and a failed emails list visible to internal sales.

### Story: See only my own reseller's requests

- **id**: `story-02-06`
- **screens**: My requests
- **traces to**: BR-01, BR-03, BR-16

**As a** reseller user, **I want** to see every request my company has made with its status, and nothing belonging to anyone else, **so that** I can check where things stand without calling, and trust that other resellers cannot see our business.

**Acceptance Criteria**

1. Given two users of Reseller A have each submitted a request, when either opens My requests, then both requests are listed with their request ID, received time and status.
2. Given a request belongs to Reseller A, when a user of Reseller B opens My requests, then it is not listed.
3. Given a request belongs to Reseller A, when a user of Reseller B enters its request ID or its web address directly, then access is refused.
4. Given a reseller user, when they try to open the open requests list or any other internal sales page, then access is refused and a refused attempt record is kept (table in story-01-04).

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- There is no page where a reseller can pay, see an invoice or see an account balance (§4.2), checked by searching the reseller pages

**Expected output**: A My requests page limited to the user's own reseller.

---

## Epic: Reps see every open request in one list, including the ones that came by phone

- **id**: `epic-03`
- **objective**: Every open request, however it arrived, is in one list in oldest-first order with its owner, so reps can decide what to work next without a spreadsheet (O-01, O-02; the §3 judgement by Jensen Huang).
- **demonstrable-via**: `ui`
- **demo-notes**: Needs the store loaded (story-01-01), one reseller with a user (story-02-01), the confirmation email (story-02-05) and My requests (story-02-06) — so it follows epic-02. Actor: rep Sam, then rep Alex. (1) Sam enters a phone request for an existing user of Reseller A: it gets a request ID, is marked Phone, and the user receives the confirmation email. (2) Sam enters a phone request for a caller with no account: Sam adds the caller as a user of Reseller A, then enters the request. (3) Open the open requests list: within a minute both requests are there, oldest first, each showing request ID, reseller, received time, time waiting, status and owner (none). (4) Sam takes the oldest; the list shows Sam as owner and status Being quoted. (5) Alex tries to take the same request: refused, told Sam owns it. (6) Sam hands it to Alex; the list shows Alex. (7) Close for quoting a product that is in an open request (story-01-03 action): the request shows a Closed product flag in the list. (8) Log in as internal admin Jo and reassign Alex's request to Sam: the list shows Sam; as Alex (not an admin), try to reassign a request Sam owns: refused. (9) Open Reseller A's admin mailbox: an email names the caller Sam added in step 2.

**Demo — what you will see**

You watch a rep take a phone call and enter the request in the portal while still on the phone; it gets a request ID and the caller gets the same confirmation email as if they had submitted it themselves. You open the open requests list and see every open request, oldest first, with who it is from, how long it has been waiting and who owns it. One rep takes a request; a second rep who tries to take it too is told who already has it. The first rep hands it over, and the list shows the new owner. When a rep has left, an internal admin moves their request to someone else. When a product in an open request is closed for quoting, you see that request flagged. Exercises: story-03-01, story-03-02, story-03-03, story-03-04, story-03-05, story-03-06.

### Story: See every open request, oldest first

- **id**: `story-03-01`
- **screens**: open requests list (internal sales)
- **traces to**: BR-08, BR-09, BR-03, A-04 — decision D2-Q2

**As a** rep, **I want** every open request in one list, oldest first, **so that** I can see what to work on next without opening a spreadsheet or asking anyone.

**Acceptance Criteria**

1. Given a request is recorded, when one minute has passed, then it is in the open requests list.
2. Given three open requests received at 09:00, 10:00 and 11:00, when the open requests list is opened, then they appear in the order 09:00, 10:00, 11:00.
3. Given a request that has been approved or declined, when the open requests list is opened, then it is not listed.
4. Given open requests from different resellers, when a rep opens the list, then requests from every reseller are shown.

| Column shown per request | Meaning |
|---|---|
| Request ID | As issued in story-02-03 or story-03-04 |
| Reseller | The reseller the request belongs to |
| Received | Date and time received |
| Waiting | Time since received, in hours and minutes |
| Status | Received, Being quoted, Quote sent, Change requested, Expired |
| Owner | The rep who has taken it, or blank |
| How it arrived | Portal, Phone or Email |
| Flags | Closed product (story-03-05), No standard discount (story-04-04) |

**Definition of done**

- Expired requests staying in the list is checked in story-05-04, where expiry is built; the No standard discount flag is checked in story-04-04

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- Walked through by Jensen Huang with two reps on real open requests before release (the §3 judgement)

**Expected output**: The open requests list.

### Story: Take a request and hand it to another rep

- **id**: `story-03-02`
- **screens**: open requests list; request page (internal sales)
- **traces to**: BR-10, BR-16 — decision D2-Q4

**As a** rep, **I want** to take a request so the team can see it is mine, and hand it on when I need to, **so that** no request is worked twice or left because everyone thought someone else had it.

**Acceptance Criteria**

1. Given an open request with no owner, when rep Sam takes it, then the open requests list shows Sam as its owner.
2. Given rep Sam takes a request with status Received, when the list is refreshed, then its status is Being quoted.
3. Given Sam owns a request, when Sam hands it to rep Alex, then the open requests list shows Alex as its owner.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit

**Expected output**: Take and hand-over actions, and an owner visible to the whole team.

### Story: Stop two reps from owning the same request

- **id**: `story-03-03`
- **screens**: open requests list; request page (internal sales)
- **traces to**: BR-10 — decision D2-Q4

**As a** rep, **I want** to be stopped from taking a request someone else already owns, **so that** a reseller never gets two quotes from two reps for one request.

**Acceptance Criteria**

1. Given Sam owns a request, when Alex tries to take it, then it is refused with the message that Sam owns it.
2. Given Sam and Alex both press take on the same unowned request at the same moment, when both actions complete, then the request has exactly one owner.
3. Given Sam and Alex both pressed take at the same moment, when the one who did not get it looks at the request, then they are told who owns it.
4. Given Sam owns a request, when Alex tries to hand it to someone, then it is refused and Sam is still the owner.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit, including a test of simultaneous take

**Expected output**: One owner per request, enforced.

### Story: Enter a phone or email request for a reseller

- **id**: `story-03-04`
- **screens**: enter request (internal sales); quote request
- **traces to**: BR-15, BR-07, BR-06, BR-01, NF-05, NF-06 — decisions D2-Q5, D2-C2

**As a** rep, **I want** to enter a request in the portal while the reseller is still on the phone, **so that** a phoned request gets a request ID like any other and is never left in a spreadsheet.

**Acceptance Criteria**

1. Given a rep chooses an existing active user of Reseller A and enters products and quantities, when they submit, then the request is recorded with a request ID and a received time.
2. Given a rep entered a request from a phone call, when it is shown in the open requests list, then How it arrived shows Phone.
3. Given a rep entered a request from an email, when it is shown in the open requests list, then How it arrived shows Email.
4. Given a rep entered a request for a user of Reseller A, when 15 minutes have passed, then that user has received the same confirmation email as story-02-05.
5. Given the caller has no portal account, when the rep adds them as a user of Reseller A from the enter request page, then the rep can choose them as the requester without leaving the page.
6. Given a request entered by a rep, when the reseller user opens My requests, then the request is listed.
7. Given a rep enters a line with quantity 0, when they submit, then it is refused naming that line, as in story-02-04.
8. Given product X is closed for quoting, when a rep searches for it on the enter request page, then it is not offered.
9. Given the rep adds a caller as a new user of Reseller A, when the user is saved, then Reseller A's admins receive the email in story-02-01 criterion 6.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- Used by reps to re-enter the requests open in the Excel request log at go-live (NF-05)

**Expected output**: An enter request page for internal sales.

### Story: Flag an open request that contains a closed product

- **id**: `story-03-05`
- **screens**: open requests list (internal sales)
- **traces to**: BR-18

**As a** rep, **I want** a request flagged when one of its products is closed for quoting, **so that** I talk to the reseller about it before I build a quote for something Bow no longer quotes.

**Acceptance Criteria**

1. Given an open request containing product X, when product X is closed for quoting, then the request shows a Closed product flag in the open requests list.
2. Given a flagged request, when a rep opens it, then the closed product's line is marked as closed.
3. Given open requests containing product X with status Being quoted, Quote sent, Change requested and Expired, when product X is closed for quoting, then each of them shows the Closed product flag.
4. Given a request that has already been approved or declined contains product X, when product X is closed for quoting, then that request is unchanged.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit

**Expected output**: A Closed product flag in the open requests list.

### Story: An internal admin reassigns a request when its owner has left

- **id**: `story-03-06`
- **screens**: open requests list; request page (internal sales)
- **traces to**: BR-10 — decision D2-C1 (extends BR-10 with an internal admin role; for Jensen Huang to confirm at this review)

**As a** Bow internal admin, **I want** to move a request from a rep who has left or is away to another rep, **so that** no request stays stuck with someone who cannot work it.

**Acceptance Criteria**

1. Given rep Sam owns a request and internal admin Jo is logged in, when Jo reassigns it to rep Alex, then the open requests list shows Alex as its owner.
2. Given a request has been reassigned by an internal admin, when its request page is opened, then it shows a reassignment record holding the fields in the table below.
3. Given a rep who is not an internal admin, when they try to reassign a request owned by someone else, then it is refused and the owner is unchanged.
4. Given Bow's stakeholders give the internal admin role to rep Jo, when Jo logs in, then Jo can reassign requests.
5. Given the internal admin role is taken away from Jo, when Jo tries to reassign a request, then it is refused.

| Reassignment record |
|---|
| Internal admin who reassigned |
| Old owner |
| New owner |
| Date and time |

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- Who at Bow gives and removes the internal admin role is confirmed by Jensen Huang; how it is held is decided in Architecture, alongside the named users of story-01-05
- The internal admin role does not grant price or discount changes (story-01-05 lists stay separate)

**Expected output**: An internal admin role, held by a few Bow users, that can reassign any open request.

---

## Epic: Reps build and send a quote priced from the store, with the reseller's discount filled in

- **id**: `epic-04`
- **objective**: Every quote is priced from the catalog and pricing store with the reseller's signed standard discount pre-filled, and every change from it carries a reason, so a price can always be traced (NF-01, NF-10; serves O-02).
- **demonstrable-via**: `ui`
- **demo-notes**: Needs the store loaded (story-01-01), resellers (story-02-01), and an open request (entered by a rep, story-03-04, or submitted, story-02-03). Do not run this demo with no standard discounts on file — step 1 sets one. Actor 1: a Bow user named by Jensen Huang to set discounts. Actor 2: rep Sam. (1) Set Reseller A's standard discount to 12%; open its discount history: old value (none), new value 12%, name, time. (2) As a rep not on the discount setters list (story-01-05), try to change it: refused. (3) Sam opens a two-line request from Reseller A: each line shows the store price, 12% pre-filled, and the net price. (4) Change line 2 to 15% without a reason and send: refused, the message asks for a reason. (5) Add a reason and send, with the valid-until date left at its default: sent. (6) Within 15 minutes the requester receives a quote ready email with the request ID. (7) Change the store price of line 1's product and Reseller A's discount to 10%; reopen the sent quote: its prices and discounts are unchanged. (8) Open a request from Reseller B, which has no standard discount: it shows the No standard discount flag in the list, the discount is blank, and sending without a discount and reason is refused.

**Demo — what you will see**

You set a reseller's standard discount and see the change recorded with your name. A rep opens a request from that reseller and finds every line already priced from the catalog and pricing store, with the reseller's discount filled in. The rep gives one line a bigger discount and is not allowed to send until they say why. They send the quote, with its valid-until date, and the reseller receives an email that it is ready. You then change the product's price and the reseller's discount, reopen the quote that was sent, and see it has not moved. Last, you open a request from a reseller with no discount on file: it is flagged, nothing is filled in, and the rep has to enter one with a reason. Exercises: story-04-01, story-04-02, story-04-03, story-04-04, story-04-05, story-04-06.

### Story: Set a reseller's standard discount

- **id**: `story-04-01`
- **screens**: resellers page — standard discount (internal sales)
- **traces to**: BR-20, NF-10, A-07

**As a** Bow user named by Jensen Huang to set discounts, **I want** to record each reseller's standard discount with a history of every change, **so that** the discount reps start from is the one Bow signed, not the one a rep remembers.

**Acceptance Criteria**

1. Given Reseller A has no standard discount, when a named user sets it to 12%, then the resellers page shows 12% as Reseller A's standard discount.
2. Given Reseller A's standard discount is 12%, when a named user changes it to 10%, then its discount history gains one line holding the fields in the table below.
3. Given a rep who is not named by Jensen Huang, when they try to set or change a standard discount, then it is refused and the value is unchanged.
4. Given a reseller user, when they try to open any standard discount, then access is refused and a refused attempt record is kept (table in story-01-04).
5. Given a named user enters a standard discount below 0% or above 100%, when they save, then it is refused and the value is unchanged.

| Discount history line |
|---|
| Old value (or none) |
| New value |
| Who made the change |
| Date and time |

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- One discount per reseller applying to every product (A-07); anything more varied is a change to the BRD
- Loading the signed list (NF-10) is a go-live step, not part of this story

**Expected output**: A standard discount field per reseller, with history, changeable only by named users.

### Story: Build a quote with store prices and the discount filled in

- **id**: `story-04-02`
- **screens**: quote builder (internal sales)
- **traces to**: BR-11, BR-20, NF-01, A-06

**As a** rep, **I want** each line of my quote to start from today's store price with the reseller's standard discount filled in, **so that** I stop looking prices up in the ERP and every reseller is quoted the same way.

**Acceptance Criteria**

1. Given product X is priced 100.00 in the store today, when Sam starts a quote for a request containing X, then X's line shows a store price of 100.00.
2. Given Reseller A's standard discount is 12%, when Sam starts a quote for Reseller A, then every line's discount shows 12%.
3. Given a line with store price 100.00 and discount 12%, when the quote is shown, then the line's net price each is 88.00.
4. Given a line with net price 88.00 each and quantity 5, when the quote is shown, then the line total is 440.00.
5. Given Sam started a quote when X was priced 100.00, and X's price changed to 110.00 before sending, when the quote is sent, then X's line shows store price 100.00.
6. Given a quote with any discount on any line, when Sam sends it, then it is sent with no approval step.
7. Given Sam enters a line discount below 0% or above 100%, when Sam tries to send, then sending is refused naming that line.
8. Given a sent quote, when it is opened later, then every line holds the fields in the table below.
9. Given a sent quote, when it is opened later, then it shows who built it and when it was sent.

| Recorded per quote line |
|---|
| Product and quantity |
| Store price |
| Standard discount (or "none on file") |
| Discount applied |
| Net price each and line total |
| Reason, where the discount applied differs from the standard or none is on file |

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- No quote line price can be typed in by hand; it always comes from the store (NF-01)
- Rounding of net prices is agreed with Jensen Huang and written into the tests, including a case whose net price falls between cents (store price 9.99 at 12%)

**Expected output**: A quote builder that prices from the store and records every line.

### Story: Refuse a changed discount with no reason

- **id**: `story-04-03`
- **screens**: quote builder (internal sales)
- **traces to**: BR-11

**As a** Product Owner accountable for margin, **I want** every discount that differs from the standard to carry a reason, **so that** I can see why any reseller got a better price.

**Acceptance Criteria**

1. Given a line's discount changed from 12% to 15% with no reason, when Sam sends the quote, then sending is refused and the message names that line and asks for a reason.
2. Given a line's discount changed from 12% to 15% with the reason "matching competitor price", when Sam sends the quote, then the sent quote shows 15% and the reason on that line.
3. Given a line's discount left at the standard 12%, when Sam sends the quote, then no reason is asked for on that line.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit

**Expected output**: Reason required on every line whose discount differs from the standard.

### Story: Quote a reseller with no standard discount on file

- **id**: `story-04-04`
- **screens**: open requests list; quote builder (internal sales)
- **traces to**: BR-20, NF-10

**As a** rep, **I want** to be told when a reseller has no standard discount on file, **so that** I do not quote them from memory without anyone knowing.

**Acceptance Criteria**

1. Given Reseller B has no standard discount on file, when a request from Reseller B is in the open requests list, then it shows a No standard discount flag.
2. Given Reseller B has no standard discount on file, when Sam starts a quote for it, then every line's discount is blank.
3. Given a line's discount is blank, when Sam tries to send the quote, then sending is refused and names that line.
4. Given Reseller B has no standard discount on file, when Sam enters 8% on a line with no reason and tries to send, then sending is refused and names that line.
5. Given Sam enters 8% on each line with a reason, when the quote is sent, then each line shows standard discount "none on file" (fields as in story-04-02).
6. Given no reseller has a standard discount on file, when the open requests list is opened, then every request carries the No standard discount flag.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- Criterion 6 exists so an empty discount list is visible, not silent: the Epic Review must not be run with no discounts on file

**Expected output**: A No standard discount flag and a required reason for resellers without terms.

### Story: Send the quote with a valid-until date, and tell the reseller

- **id**: `story-04-05`
- **screens**: quote builder (internal sales); quote ready email; failed emails list
- **traces to**: BR-12, BR-13, BR-16, BR-01, A-14

**As a** reseller user, **I want** an email when my quote is ready and a clear date it is valid until, **so that** I know when to look and how long I have to decide.

**Acceptance Criteria**

1. Given Sam starts a quote, when the quote builder opens, then the valid-until date is filled in with today plus the default period.
2. Given Sam changes the valid-until date, when the quote is sent, then the sent quote shows the date Sam chose.
3. Given Sam sets a valid-until date earlier than today, when Sam tries to send, then sending is refused with a message about the date.
4. Given Sam sets the valid-until date to today, when Sam sends, then the quote is sent.
5. Given a quote is sent, when 15 minutes have passed, then the user who made the request has received an email that the quote is ready, with the request ID.
6. Given a quote ready email, when it is read, then it contains no prices.
7. Given the quote ready email cannot be sent, when a rep opens the failed emails list, then it shows an entry for it (fields as in story-02-05).
8. Given a quote for Reseller A is sent, when the quote ready email goes out, then no user of any other reseller receives it.
9. Given a quote is sent, when the request is viewed by the reseller or by a rep, then its status is Quote sent.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- The default period is the one Jensen Huang names (A-14); it is set before go-live and can be changed without a rebuild

**Expected output**: Sending a quote, with valid-until date, email to the requester, and failures listed.

### Story: Keep a sent quote unchanged when prices or discounts change

- **id**: `story-04-06`
- **screens**: quote (reseller and internal sales)
- **traces to**: BR-18, BR-20, BR-11

**As a** reseller user, **I want** the quote I was sent to stay exactly as sent, **so that** what I approve is what I was offered.

**Acceptance Criteria**

1. Given a quote was sent with product X at store price 100.00, when X's store price is changed to 110.00, then the sent quote still shows 100.00.
2. Given a quote was sent to Reseller A at a 12% standard discount, when Reseller A's standard discount is changed to 10%, then the sent quote still shows 12%.
3. Given a quote was sent with product X, when X is closed for quoting, then the sent quote still shows X's line unchanged.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit

**Expected output**: Sent quotes that do not move.

---

## Epic: The reseller answers the quote, and both sides see the same status

- **id**: `epic-05`
- **objective**: A reseller approves, asks for a change or declines in the portal, the rep hears at once, and both sides always see the same status, so nobody phones to ask where a quote stands (O-03; O-02).
- **demonstrable-via**: `ui`
- **demo-notes**: Needs a sent quote (story-04-05), and a second quote sent the day before the demo with valid-until set to that day, so it has expired by the demo (a quote cannot be sent with a past date). Actor 1: a user of Reseller A (not the requester). Actor 2: rep Sam, the owner. (1) Open My requests: status Quote sent — the same status Sam sees in the open requests list. (2) Open the quote and request a change with a comment: status Change requested on both sides; Sam receives an email. (3) Sam sends a revised quote: version 2 shown, version 1 still viewable by both. (4) Approve version 2: the approval screen says the approval is an acceptance that Bow confirms and is not an order; status Approved on both sides; Sam receives an email; no order, invoice or payment page appears. (5) Try to decline the approved quote: refused, already approved. (6) Open the quote prepared the day before: status Expired on both sides and still in the open requests list; Approve refused with a message that it has expired; Request a change is offered. (7) Look for a delete action on requests, quotes or responses as reseller and as rep: none.

**Demo — what you will see**

You log in as a colleague of the person who asked for the quote, open it, and ask for a change. The rep is emailed straight away, sends a revised quote, and you can still see the first version beside it. You approve the revision; the screen tells you this is an acceptance Bow will confirm, not an order. At every step, the status you see is the same status the rep sees. You try to decline the quote you just approved and cannot, and you find no way for anyone to delete a request, a quote or a response. Finally, you open a quote past its valid-until date: you cannot approve it, but you can ask for a new one. Exercises: story-05-01, story-05-02, story-05-03, story-05-04, story-05-05, story-05-06, story-05-07.

### Story: Approve a quote

- **id**: `story-05-01`
- **screens**: quote (reseller); response email to rep
- **traces to**: BR-14, BR-16, A-05, §4.2 fulfilment and payment exclusions — decision D2-Q3

**As a** reseller user, **I want** to approve a quote in the portal, **so that** Bow knows we accept it without my having to call.

**Acceptance Criteria**

1. Given any active user of Reseller A opens a sent quote for Reseller A, when they view it, then Approve, Request a change and Decline are offered.
2. Given a user is about to approve, when the approval screen is shown, then it states that the approval is an acceptance Bow will confirm and is not an order.
3. Given a user approves a quote, when the quote is opened by either side, then it shows Approved with who approved it and when (response record, table below).
4. Given the user who made the request has been deactivated, when a colleague at the same reseller opens the quote, then Approve, Request a change and Decline are offered.
5. Given a user approves a quote, when 15 minutes have passed, then the rep who owns the request has received an email with the request ID saying it was approved.
6. Given a quote has been approved, when the reseller's pages are examined, then no order, invoice, payment or shipment has been created or offered.
7. Given a quote belongs to Reseller A, when a user of Reseller B sends an approval for it directly, then it is refused and the quote is unchanged.

| Response record (approve, change request, decline) |
|---|
| Response given |
| Who gave it |
| Date and time |
| Comment or reason, where given |

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- The wording of the approval statement is agreed with Jensen Huang (A-05)

**Expected output**: Approval with a recorded who-and-when, a non-binding statement, and an email to the owning rep.

### Story: Request a change and receive a revised quote

- **id**: `story-05-02`
- **screens**: quote (reseller); quote builder (internal sales)
- **traces to**: BR-14, BR-16, BR-11

**As a** reseller user, **I want** to ask for a change with a comment and get a revised quote, **so that** we can agree terms in the portal instead of by phone.

**Acceptance Criteria**

1. Given a sent quote, when a reseller user requests a change without a comment, then it is refused and asks for a comment.
2. Given a reseller user requests a change with a comment, when the rep who owns the request opens it, then it shows the response record (table in story-05-01).
3. Given a change has been requested, when 15 minutes have passed, then the rep who owns the request has received an email with the request ID saying a change was requested.
4. Given a change has been requested, when the rep sends a revised quote, then the reseller sees it as version 2.
5. Given version 2 has been sent, when either side opens the request, then version 1 can still be opened, unchanged.
6. Given version 2 has been sent, when the reseller opens version 1, then Approve, Request a change and Decline are not offered on it.
7. Given a reseller user still has version 1 open from before version 2 was sent, when they approve it, then it is refused with a message that a newer version exists.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- A revised quote is priced from the store on the day it is built (BR-11)

**Expected output**: Change requests, quote versions, and older versions kept visible.

### Story: Decline a quote

- **id**: `story-05-03`
- **screens**: quote (reseller)
- **traces to**: BR-14, BR-16

**As a** reseller user, **I want** to decline a quote, with a reason if I choose, **so that** Bow knows not to chase it.

**Acceptance Criteria**

1. Given a sent quote, when a reseller user declines it without a reason, then it is recorded as Declined with who and when.
2. Given a sent quote, when a reseller user declines it with the reason "price too high", then the rep who owns the request sees that reason on the request.
3. Given a quote is declined, when 15 minutes have passed, then the rep who owns the request has received an email with the request ID saying it was declined.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit

**Expected output**: Decline with optional reason, recorded and emailed.

### Story: Refuse approval of an expired quote

- **id**: `story-05-04`
- **screens**: quote (reseller); My requests; open requests list
- **traces to**: BR-12, BR-16 — decision D2-Q2

**As a** Product Owner, **I want** a quote past its valid-until date to be impossible to approve, **so that** Bow is never held to prices it no longer offers.

**Acceptance Criteria**

1. Given a quote whose valid-until date was yesterday, when a reseller user tries to approve it, then approval is refused with a message that the quote has expired.
2. Given a quote whose valid-until date has passed without a response, when either side views the request, then its status is Expired.
3. Given a quote has expired, when the reseller user views it, then Request a change is offered.
4. Given a quote whose valid-until date is today, when a reseller user approves it, then the approval is accepted.
5. Given a request whose quote has expired, when the open requests list is opened, then the request is still listed with status Expired in its received-time position.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- Whose calendar day decides "today" is decided in Architecture and written into the tests

**Expected output**: Expiry enforced at approval, with the change path still open.

### Story: Refuse a second response to a quote already answered

- **id**: `story-05-05`
- **screens**: quote (reseller)
- **traces to**: BR-14 — decision D2-Q3

**As a** reseller user, **I want** the portal to stop a colleague and me from giving conflicting answers, **so that** Bow receives one clear answer per quote.

**Acceptance Criteria**

1. Given a quote has been approved, when any reseller user tries to decline it, then it is refused with a message naming who approved it.
2. Given a quote has been declined, when any reseller user tries to approve it, then it is refused with a message that it was already declined.
3. Given two users of Reseller A respond to the same quote at the same moment, one approving and one declining, when both actions complete, then the quote has exactly one response recorded.
4. Given two users responded at the same moment, when the user whose response was not recorded looks at the quote, then they see the response that was recorded and who gave it.
5. Given a quote has been approved or declined, when any reseller user tries to request a change to it, then it is refused.
6. Given a user whose account has been deactivated, when they try to respond to a quote, then they cannot, because they cannot log in.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit, including a test of simultaneous responses

**Expected output**: One response per quote version, enforced.

### Story: Show the same status to the reseller and to the reps

- **id**: `story-05-06`
- **screens**: My requests (reseller); open requests list (internal sales)
- **traces to**: BR-16

**As a** reseller user, **I want** the status I see to be the status Bow sees, **so that** there is nothing to phone about.

**Acceptance Criteria**

1. Given a request that goes Received, Being quoted, Quote sent, Change requested, Quote sent, Approved, when My requests and the open requests list are compared after each step, then both show the same status.
2. Given a request that goes Received, Being quoted, Quote sent, Declined, when My requests and the open requests list are compared after each step, then both show the same status.
3. Given a request that goes Received, Being quoted, Quote sent, Expired, when My requests and the open requests list are compared after each step, then both show the same status.
4. Given a request, when its status is shown to the reseller, then it is one of the seven statuses in the table below.

| Status | Set when |
|---|---|
| Received | The request is recorded |
| Being quoted | A rep takes the request |
| Quote sent | A rep sends a quote or a revised quote |
| Change requested | A reseller user requests a change |
| Approved | A reseller user approves the quote |
| Declined | A reseller user declines the quote |
| Expired | The quote's valid-until date passes with no response |

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit

**Expected output**: One status per request, shown the same way on both sides.

### Story: Keep every request, quote and response

- **id**: `story-05-07`
- **screens**: request page, quote (reseller and internal sales)
- **traces to**: BR-19, A-08

**As a** Product Owner, **I want** no request, quote version or response to be deletable, **so that** Bow keeps the record it may be required to keep for five years.

**Acceptance Criteria**

1. Given any request, quote version or response, when a reseller user looks for a way to delete it, then none is offered.
2. Given any request, quote version or response, when a rep looks for a way to delete it, then none is offered.
3. Given any request, quote version or response, when any user sends a delete for it directly without using a screen, then it is refused and the record is still there.
4. Given a reseller user is deactivated, when their past requests are opened by a colleague, then the requests, quotes and responses are all still there.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- Keeping records for five years after closing is designed in Architecture (A-08 sets the period)

**Expected output**: Records that no user can delete.

---

## Epic: Reseller admins manage their own company's users

- **id**: `epic-06`
- **objective**: A reseller adds and removes its own people without asking Bow, so Bow's reps stop maintaining every reseller's user list (BR-02; supports O-01 by keeping accounts current).
- **demonstrable-via**: `ui`
- **demo-notes**: Needs a reseller with an admin (story-02-01). Actor: the admin of Reseller A. (1) Open Users, add a buyer with name and email: the buyer appears as Active and receives a sign-in invitation. (2) Deactivate an existing buyer who has made a request: the buyer shows as Deactivated; logging in as them fails. (3) Log in as another buyer at Reseller A: the deactivated buyer's request is still in My requests. (4) As a non-admin buyer, open Users: no add or deactivate action; trying the add address directly is refused. (5) As the admin, try to open a Reseller B user: refused.

**Demo — what you will see**

You log in as a reseller's admin, open Users and add a new buyer, who gets an invitation to sign in. You deactivate someone who has left: they can no longer log in, but the requests they made are still there for their colleagues. You then log in as an ordinary buyer and see you cannot add or remove anyone, and as the admin you cannot see another reseller's people. Exercises: story-06-01, story-06-02, story-06-03.

### Story: Add a user to my reseller

- **id**: `story-06-01`
- **screens**: Users (reseller admin)
- **traces to**: BR-02, BR-01

**As a** reseller admin, **I want** to add a colleague to our portal account myself, **so that** a new buyer can request quotes without waiting for Bow.

**Acceptance Criteria**

1. Given a reseller admin enters a name and email, when they save, then the person appears on Users as Active.
2. Given a user has been added, when they follow their sign-in invitation and log in, then they see their reseller's requests in My requests.
3. Given the email already belongs to a user of any reseller, when the admin tries to add it, then it is refused with a message that the email is already in use.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit

**Expected output**: A Users page where an admin adds users to their own reseller.

### Story: Deactivate a user who has left

- **id**: `story-06-02`
- **screens**: Users (reseller admin); My requests
- **traces to**: BR-02, BR-19

**As a** reseller admin, **I want** to deactivate someone who has left, **so that** they cannot see our quotes any more, while their work stays with us.

**Acceptance Criteria**

1. Given an active user, when the admin deactivates them, then Users shows them as Deactivated.
2. Given a user has been deactivated, when they try to log in, then login is refused.
3. Given a deactivated user had made requests, when a colleague opens My requests, then those requests are still listed.
4. Given a user is logged in when the admin deactivates them, when they next open any page, then it is refused.
5. Given a reseller has only one active admin, when that admin tries to deactivate themselves, then it is refused with a message that the reseller needs an admin.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit

**Expected output**: Deactivation that stops access and keeps the history.

### Story: Refuse user changes by anyone who is not that reseller's admin

- **id**: `story-06-03`
- **screens**: Users (reseller admin)
- **traces to**: BR-02, BR-01

**As a** reseller admin, **I want** only me to change our users, and only ours, **so that** nobody can let a stranger into our account.

**Acceptance Criteria**

1. Given a reseller user who is not an admin, when they open Users, then no add or deactivate action is offered.
2. Given a reseller user who is not an admin, when they try to add or deactivate a user by going to the action directly, then it is refused and no user is changed.
3. Given the admin of Reseller A, when they try to view or deactivate a user of Reseller B, then it is refused.

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit

**Expected output**: User management limited to each reseller's own admin.

---

## Coverage

### Requirement to story

| BRD requirement | Delivered by | Notes |
|---|---|---|
| BR-01 | story-02-05, story-02-06, story-04-05, story-06-03 | Checked on requests, emails and users. |
| BR-02 | story-02-01, story-06-01, story-06-02, story-06-03 | story-02-01 creates the first admin (decision D2-Q1). |
| BR-03 | story-01-04, story-02-01, story-02-06, story-03-01, story-04-01 | Each internal page refuses and records a reseller user. |
| BR-04 | story-02-02 | |
| BR-05 | story-02-03, story-02-04, story-03-04 | |
| BR-06 | story-02-03, story-03-04 | |
| BR-07 | story-02-05, story-03-04 | |
| BR-08 | story-03-01 | |
| BR-09 | story-03-01 | Oldest first (A-04). |
| BR-10 | story-03-02, story-03-03, story-03-06 | Reps: only the owner hands on (D2-Q4). An internal admin can reassign (D2-C1) — this extends BR-10 with a role the BRD does not name; for Jensen Huang to confirm. |
| BR-11 | story-04-02, story-04-03, story-04-06, story-05-02 | |
| BR-12 | story-04-05, story-05-04 | |
| BR-13 | story-04-05 | |
| BR-14 | story-05-01, story-05-02, story-05-03, story-05-05 | Any active user of the reseller responds (decision D2-Q3, story-05-01). |
| BR-15 | story-03-04 | Rep can add a missing user (decision D2-Q5). |
| BR-16 | story-02-06, story-03-02, story-04-05, story-05-01 to story-05-06 | Status table in story-05-06. |
| BR-17 | story-01-01, story-01-02, story-01-03, story-01-04, story-01-05 | story-01-05 names who may change prices. |
| BR-18 | story-01-03, story-02-02, story-03-05, story-04-06 | |
| BR-19 | story-05-07, story-06-02 | Five-year keeping is designed in Architecture. |
| BR-20 | story-01-05, story-04-01, story-04-02, story-04-04, story-04-06 | story-01-05 names who may set discounts. |

**Non-functional requirements and constraints.** NF-01 is built into story-04-02 (no hand-typed price). NF-03 and NF-05 are served by story-01-01 and story-03-04, which are the tools the owners use. NF-02 (email and sign-in), NF-07 (personal data law) and NF-08 (volumes) are Architecture inputs and appear in stories only as "decided in Architecture". NF-04, NF-06, NF-09 and NF-10 are Bow's go-live commitments, not build work; the stories give them somewhere to land (story-02-01, story-03-04, story-04-01). Nothing is deferred.

**Exclusions written as checkable absences** (BRD §4.2): no prices or stock in search (story-02-02); no self-registration (story-02-01); no payment, invoice or balance (story-02-06, story-05-01); no order or shipment on approval (story-05-01); no approval step before sending (story-04-02); no hand-typed price (story-04-02). Electronic quote exchange, screening and migration of closed requests have no screen to check an absence on; they are held by the BRD.

### Story to requirement

| Story | Traces to |
|---|---|
| story-01-01 | BR-17, NF-03 |
| story-01-02 | BR-17 |
| story-01-03 | BR-17, BR-18 |
| story-01-04 | BR-17, BR-03 |
| story-01-05 | BR-17, BR-20 |
| story-02-01 | BR-02, BR-03, BR-01, NF-04 (D2-Q1, D2-C2) |
| story-02-02 | BR-04, BR-18, A-03 |
| story-02-03 | BR-05, BR-06 |
| story-02-04 | BR-05 |
| story-02-05 | BR-07, BR-01 |
| story-02-06 | BR-01, BR-03, BR-16 |
| story-03-01 | BR-08, BR-09, BR-03 |
| story-03-02 | BR-10, BR-16 |
| story-03-03 | BR-10 |
| story-03-04 | BR-15, BR-06, BR-07, BR-01, NF-05, NF-06 (D2-Q5, D2-C2) |
| story-03-05 | BR-18 |
| story-03-06 | BR-10 (D2-C1, extension) |
| story-04-01 | BR-20, NF-10 |
| story-04-02 | BR-11, BR-20, NF-01, A-06 |
| story-04-03 | BR-11 |
| story-04-04 | BR-20 |
| story-04-05 | BR-12, BR-13, BR-16, BR-01 |
| story-04-06 | BR-18, BR-20, BR-11 |
| story-05-01 | BR-14, BR-16, BR-01, A-05 (D2-Q3) |
| story-05-02 | BR-14, BR-16, BR-11 |
| story-05-03 | BR-14, BR-16 |
| story-05-04 | BR-12, BR-16 |
| story-05-05 | BR-14 |
| story-05-06 | BR-16 |
| story-05-07 | BR-19 |
| story-06-01 | BR-02, BR-01 |
| story-06-02 | BR-02, BR-19 |
| story-06-03 | BR-02, BR-01 |

## Delivery order

The order is largely fixed, and this says so plainly. epic-01 comes first: every other Epic needs Bow's products in the store. epic-02 comes next: it creates resellers and users, and the confirmation email and My requests that epic-03 reuses. Then epic-03 (a request to take), epic-04 (a quote to send) and epic-05 (a quote to answer), in that order. epic-06 is the one free choice: any time after epic-02. The chain follows the business process from request to quote to response, not a technical layer. Where a story is checked against something a later Epic builds, the check sits in the later Epic: expiry in the reps' list is checked in story-05-04, and the No standard discount flag in story-04-04.

## Decisions taken while writing this backlog

Put to Mark Zuckerberg (BA) on 2026-09-26. D2-Q1 to D2-Q5 were the recommended answers. D2-C1 and D2-C2 were decided on the critique's questions; D2-C1 is the operator's own answer, not the recommendation. They apply the approved BRD and are for Jensen Huang to confirm at the backlog review.

| # | Question | Decision | Stories |
|---|---|---|---|
| D2-Q1 | How does a reseller and its first admin come to exist? | Internal sales create each reseller and its first admin, and can add users later. No self-registration. | story-02-01 |
| D2-Q2 | Does a request whose quote expired stay in the reps' list? | Yes, with status Expired. Only approval or decline closes a request. | story-03-01, story-05-04 |
| D2-Q3 | Who at a reseller may respond to a quote? | Any active user of that reseller. The quote ready email still goes to the requester. | story-05-01, story-05-05 |
| D2-Q4 | Can another rep take over an owned request? | No. Only the owner hands it on. | story-03-02, story-03-03 |
| D2-C1 | What happens to requests owned by a rep who leaves? (from the critique) | A few Bow users, chosen by Bow's stakeholders, hold an internal admin role and can reassign any open request. This extends BR-10. | story-03-06 |
| D2-C2 | How is a caller added by a rep kept from seeing a reseller's quotes unnoticed? (from the critique) | The reseller's admins are emailed whenever Bow adds a user to their reseller. | story-02-01, story-03-04 |
| D2-Q5 | What if a phone caller has no portal account? | The rep adds them as a user of their reseller, then enters the request. | story-03-04 |

**Assumptions carried, with who confirms them**

| Assumption | What becomes false if wrong | Confirms |
|---|---|---|
| "Being quoted" starts when a rep takes the request. | The status table in story-05-06 changes. | Jensen Huang |
| Time waiting in the reps' list is time since received, in hours and minutes, not working hours. | story-03-01's Waiting column changes to working hours, which needs Bow's working calendar. | Jensen Huang |
| A response email to the rep (BR-14) that fails is not listed on the failed emails list; the BRD asks for that only for BR-07 and BR-13. | If Bow wants it listed, story-05-01 to story-05-03 each gain a criterion — a small BRD change. | Jensen Huang |
| The quote ready email carries no prices; the quote is seen in the portal (BR-13). | story-04-05 criterion 6 is removed. | Jensen Huang |
| The store price on a quote line is the price in force when the rep started the quote. | story-04-02 criterion 5 flips to the price at sending. | Jensen Huang |
| A discount is between 0% and 100%. | story-04-01 criterion 5 and story-04-02 criterion 7 change. | Jensen Huang |
| All prices are in one currency. | Quotes need a currency per reseller, and the store a price per currency. | Jensen Huang |
| An email that is accepted for sending and bounces later is not caught; only a refusal when sending is listed. | story-02-05 and story-04-05 gain a bounce criterion, and the email platform must report bounces (NF-02). | Elon Musk |
| When the requester has been deactivated, the quote ready email still goes to them, so nobody active at the reseller may be told. | story-04-05 sends to the reseller's active admin instead — a small BRD change. | Jensen Huang |
| The last active admin of a reseller cannot deactivate themselves. | story-06-02 criterion 5 is removed; a reseller can lock itself out and must ask Bow. | Jensen Huang |
| Two small usability choices: a search with no match says so (story-02-02 c6), and a refused request keeps the lines entered (story-02-04 c5). | Each criterion is removed. | Jensen Huang |
