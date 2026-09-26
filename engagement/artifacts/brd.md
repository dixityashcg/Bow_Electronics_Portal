# Business Requirements Document — Bow Electronics Reseller Portal

**Status**: Draft · **Prepared by**: Mark Zuckerberg · **For approval by**: Jensen Huang

## 1. Executive summary

Bow Electronics asked for a web portal where resellers log in, search Bow's products and request a quote, and where the internal sales team builds quotes that resellers can approve, request a change to, or decline. The problem behind it is that every reseller request lives in a phone call and a rep's spreadsheet: requests are lost or delayed, reps lose track of when a request arrived and cannot prioritise, resellers phone again to ask where their quote stands, and business with key clients is lost. This work gives every quote request an ID and a timestamp from the moment it is made, puts every open request in one prioritised view for the reps, lets resellers see their own status, and replaces the Excel ERP with a catalog and pricing store as the source of every quote price. It does not take payments or invoice, does not fulfil or ship anything after a quote is approved, does not manage stock, and does not move historical requests out of the spreadsheets. Approving this document makes the scope in §4 and the requirements in §7 the basis of the backlog, and commits Bow to the go-live preconditions in §8 — above all, that from go-live every quote is priced from the new store and every request, including one taken by phone, is entered in the portal.

## 2. Background and problem

### 2.1 The request, in the client's words

> "Bow Electronics currently manages all reseller requests through telephone conversations, logs the requests in Excel spreadsheets, and does the fulfilment process manually. They would like to build a web portal where users (resellers, their admins, etc.) can log in and search the products Bow Electronics has, and request a quote for the product they wish to buy in the quantity they want to buy." (inputs/brief.md, relayed by Yash Dixit)

The request goes on to name a confirmation email with a request ID, a separate login for the internal sales team to build the quote from the ERP's pricing using discounts based on the reseller relationship, and a notification to the reseller when the quote is ready to approve, change or decline. The client asked for "a modern architecture that solves this problem end to end". This is recorded as Bow's preferred solution. It is not itself the requirement.

### 2.2 The problem behind it

**Bow's internal sales reps** take every reseller request by phone and type it into an Excel spreadsheet. Nothing else records it. They then look up the price in the ERP — itself a home-grown spreadsheet that is very slow to work with — apply a discount from what they know of the reseller relationship, and send the quote back by hand. Because the request exists only in whichever spreadsheet that rep used, reps lose track of when a request came in, and there is no one place to see all open requests and decide which to work first. Requests are lost or delayed between the call and the spreadsheet, and business with key clients is lost as a result. (D-02, D-03, D-04)

**Resellers' buyers** cannot see where their request stands. What they do today instead is phone their rep again to ask — which adds to the calls the reps are already logging by hand. Turnaround is slow and inconsistent, and some deals go to faster competitors. (D-04)

How often any of this happens has not been measured: not the number of requests a week, not how long a quote takes, not how many status calls come in, and not how many deals are lost. §3 names who establishes each figure.

**The causal claim, and how far it has been tested.** The request assumes that putting requests into a portal fixes the loss of requests and the delay. That holds only if requests actually go through the portal. The pre-mortem with the operator named the most likely way this fails: resellers keep phoning because a call is easier, reps keep taking the calls, and requests bypass the system (inputs/brief.md). That is why §7 lets a rep enter a phone request into the portal (BR-15), and why §8 makes "every request is entered" a go-live commitment rather than a hope. The claim that faster, tracked quotes win back key-client business has **not** been tested with the client. It is a hypothesis. A-09 carries it.

## 3. Objectives and measurable outcomes

Each baseline below is missing because nothing counts these things today (D-02). No figure has been invented. Each owner establishes the baseline before go-live, so there is a before to compare the after with. Targets for O-02 and O-03 are set once their baselines exist, not now.

| # | Objective | How it will be measured | Baseline today | Target | Evidence |
|---|---|---|---|---|---|
| O-01 | Fewer quote requests that exist only in a phone call or a rep's spreadsheet | Share of quote requests reps received by phone or email, over a two-week sample, that have no request ID in the portal by the end of the next working day. Source: a call and email tally kept by the internal sales team for the sample period, checked against the portal's request list. | None. No request ID exists today, so today every request is untracked by this definition. Jensen Huang runs the first sample in the second month after go-live. | Zero untracked requests in the sample | D-04, D-05 |
| O-02 | Quotes reach resellers sooner | Median working hours from request received to quote submitted, per month. After go-live: the portal's recorded times (BR-06, BR-11). Before go-live: a two-week sample logged by reps with time received and time sent. | Not measured. Reps lose track of when requests arrive, so the Excel request log cannot supply it. Jensen Huang has the pre-go-live sample taken. | Set by Jensen Huang once the baseline exists (A-10) | D-04 |
| O-03 | Fewer calls from resellers asking where their quote stands | Status calls received by the internal sales team per week, from a tally reps keep for two weeks before go-live and two weeks in the third month after. | Not measured. Jensen Huang has the pre-go-live tally taken. | Set by Jensen Huang once the baseline exists (A-10) | D-04 |

**Judgement, not a metric.** Whether the reps' view of open requests lets them decide what to work on next without asking anyone or opening a spreadsheet. Judged by Jensen Huang, on a walkthrough with two reps using real open requests, before the release is accepted. Recorded here so it is discussed, not assumed.

**Business with key clients**, which the client names as the cost of the problem, is not in this table. Nobody records lost deals today, and a count set up now would mix the effect of this work with everything else that moves a reseller. The link from tracked quotes to retained business is a hypothesis (A-09), not an outcome this work can be judged on.

## 4. Scope

### 4.1 In scope

- **Reseller access.** Reseller users log in and see only their own company's quote requests and quotes. A reseller admin manages their own company's users (A-01).
- **Product search** against the catalog and pricing store, by part number and by description. Search does not show prices (A-03).
- **Quote requests** of one or more products, each with a quantity, under one request ID (A-02). A confirmation email to the reseller. Entry by a rep of a request received by phone or email.
- **The internal sales view.** Every open request in one list in priority order (A-04). Building a quote from store prices with a discount, sending it, revising it when a change is requested.
- **The reseller's response.** Approve, request a change or decline, each recorded. A status the reseller can see for every request.
- **Emails** at three points: request received, quote ready, reseller response received.
- **A catalog and pricing store** replacing the Excel ERP as the source of product and price data for every quote, loaded from the ERP once at go-live, then maintained in the store (D-06). It also holds each reseller's standard discount, which pre-fills their quotes (A-07).

### 4.2 Explicitly out of scope

- **Payments and invoicing.** The portal does not take payment, raise an invoice or show a reseller's account balance. Raised by the agent, accepted by Yash Dixit; client confirmation at review (A-12).
- **Fulfilment and shipping after approval.** An approved quote is not converted into an order, a pick or a shipment by the portal. It notifies the internal sales team, and fulfilment continues manually as today (A-05). Same source.
- **Stock and availability.** The portal does not show stock levels or reserve stock. It says nothing about whether a product can be supplied in the quantity quoted. Same source.
- **Migration of historical requests.** Past requests stay in the Excel spreadsheets and are not loaded into the portal. Only requests still open at go-live are re-entered, by reps (A-11). Same source.
- **Electronic quote exchange with reseller systems.** A reseller cannot send a request for quote, or receive a quote, as a file from their own purchasing system (D-07, D-08). Requests come in through the portal or are entered by a rep. Raised by the agent from the industry research.
- **Export classification and restricted-party screening.** The portal does not classify parts or screen resellers. Whatever checks Bow runs before it ships today still run, outside the portal, after approval (D-13, D-14, A-08). Raised by the agent from the industry research.
- **Discount approval workflow.** No manager approval is needed before a rep sends a quote, at any discount level (A-06). Raised as an open point in the brief; recommended exclusion.

**Boundary set in Discovery, to confirm at review.** A reseller's approval is an acceptance that Bow's manual process then confirms. It is not a binding order, and the approval screen says so (A-05). Answered by Yash Dixit on 2026-09-25. If Jensen Huang says approval is binding, the fulfilment exclusion above has to be revisited.

## 5. Stakeholders

| Role | Name | Decides | Consulted on |
|---|---|---|---|
| Product Owner | Jensen Huang | approval of this document and the backlog; outcome targets; the priority rule; each reseller's standard discount and who may change it; quote validity | every assumption in §9 marked for the PO |
| Enterprise Architect | Elon Musk | the email platform and sign-in approach; where reseller terms are held today; ownership of the Excel ERP at cutover | NF-02, NF-03, A-07 |
| Business Analyst | Mark Zuckerberg | nothing in scope; drafts and maintains this document | all sections |
| Forward Deployed Engineer | Yash Dixit | nothing in scope; relays the client and carries this document to them | the request and brief (inputs/brief.md) |
| Internal sales team | not named | nothing in scope | the priority view, quote building, phone-request entry; the O-01 to O-03 samples |
| Resellers | not named | nothing in scope | none consulted yet — see A-13 |

## 6. Business process

### 6.1 Current state

1. A reseller's buyer phones a rep with the products and quantities they want.
2. The rep writes the request into their Excel spreadsheet. No ID is given, and the time may not be noted.
3. The rep looks up prices in the ERP spreadsheet and applies a discount from what they know of the reseller.
4. The rep sends the quote back by hand.
5. The buyer phones again to ask where the quote is, or to accept, change or decline it.
6. Fulfilment proceeds manually.

Steps 2 and 5 are where requests are lost and where the repeat calls come from.

### 6.2 Future state

1. The buyer searches the catalog in the portal, adds products and quantities, and submits. If the buyer phones instead, the rep enters the request in the portal while on the call.
2. The request gets an ID and a timestamp. The buyer gets a confirmation email.
3. The request appears in the reps' prioritised list. A rep takes it and builds the quote from store prices, with the reseller's standard discount already filled in. The rep changes the discount if needed, and sends it.
4. The buyer gets an email, opens the quote in the portal, and approves it, requests a change or declines it.
5. A change request goes back to the same rep, who sends a revised quote. Earlier versions are kept.
6. On approval the internal sales team is notified, and fulfilment proceeds manually as today — outside the portal.

## 7. Business requirements

| # | Requirement | Priority | Evidence |
|---|---|---|---|
| BR-01 | A reseller user sees only the quote requests and quotes of the reseller they belong to. Each user belongs to exactly one reseller. **Unmet if** any reseller user can open, list or be emailed a request or quote belonging to another reseller. | Must | inputs/brief.md, D-01 |
| BR-02 | A reseller admin can add a user to their own reseller and deactivate one. A deactivated user can no longer log in, and their past requests stay visible to the rest of the reseller. A user who is not an admin cannot do either. **Unmet if** an admin cannot deactivate a user without asking Bow, or a non-admin can add a user. | Should | D-01; assumption A-01 |
| BR-03 | Internal sales users log in separately from resellers and are the only users who can see all resellers' requests, build quotes or change the catalog and pricing store. **Unmet if** a reseller user reaches any internal sales screen or action — the attempt is refused and logged. | Must | inputs/brief.md, D-01 |
| BR-04 | A reseller user can find any product that is in the catalog and pricing store and open for quoting, by its full part number and by words in its description. **Unmet if** a product open for quoting is not returned when its exact part number is searched, or if a product closed for quoting (BR-17) is returned. | Must | D-01, D-06; assumption A-03 |
| BR-05 | A reseller user can submit a quote request of one or more products, each with a quantity. A quantity must be a whole number greater than zero. A request with no products, or with a quantity that is not a whole number greater than zero, is refused before it is recorded, and the user is told which line and why. **Unmet if** such a request is recorded, or refused without saying which line is wrong. | Must | D-01; assumption A-02 |
| BR-06 | Every submitted quote request is given a request ID that is never reused and the date and time it was received. These cannot be changed by anyone. **Unmet if** a submitted request exists without an ID or a received time, or two requests share an ID. | Must | D-05 |
| BR-07 | Within 15 minutes of a request being recorded, the submitting user receives an email showing the request ID, each product and quantity, and the received time. If the email cannot be sent, the request stays recorded and visible to the reseller and to sales, and the failed email is listed for the internal sales team. **Unmet if** the user receives no email and nobody at Bow can see that it failed. | Must | D-01; assumption A-15 |
| BR-08 | A recorded request appears in the internal sales team's list of open requests within one minute of being received. **Unmet if** a recorded request is missing from that list at any point before it is closed. | Must | D-01, D-05; assumption A-15 |
| BR-09 | The internal sales team sees all open requests in one list, shown in priority order (A-04). Each shows the request ID, reseller, received time, how long it has been waiting, status and the rep who has taken it. **Unmet if** an open request is missing from the list, or the order differs from the rule in A-04. | Must | D-04, D-05; assumption A-04 |
| BR-10 | A rep can take an open request, which shows them as its owner to the rest of the team. A request can have only one owner at a time, and a rep can hand it to another rep. **Unmet if** two reps can take the same request at once, or a request's owner is not visible. | Should | D-04 |
| BR-11 | A rep builds a quote in which each line's starting price comes from the catalog and pricing store at that moment, and each line's discount is pre-filled with the reseller's standard discount (BR-20). The rep may change a line's discount before sending, and must give a reason when they do. The quote records for each line the store price, the standard discount, the discount applied, the net price and any reason, plus who built the quote and when it was sent. **Unmet if** a sent quote has a line whose store price cannot be traced to the store's price on the day it was built, or a discount that differs from the standard with no reason recorded. | Must | D-01, D-06; assumption A-07 |
| BR-12 | Every quote shows a valid-until date. A reseller cannot approve a quote after that date; they are told it has expired and can request a change instead. **Unmet if** a quote is approved after its valid-until date. | Must | assumption A-14 |
| BR-13 | When a rep sends a quote, the reseller user who made the request receives an email within 15 minutes saying the quote is ready, with the request ID. The quote itself is seen in the portal. If the email cannot be sent, the failure is listed for the internal sales team. **Unmet if** a quote is sent and neither the email arrives nor a failure is listed. | Must | D-01; assumption A-15 |
| BR-14 | A reseller user can approve a quote, request a change with a comment, or decline it with an optional reason. Each response records who gave it and when, notifies the rep who owns the request by email, and cannot be undone by the reseller. A change request returns the request to that rep. A revised quote is a new version, and earlier versions remain visible to both sides. A quote that has been approved or declined cannot be responded to again. **Unmet if** a response has no record of who and when, if an earlier version is lost, or if an approved quote can be declined afterwards. | Must | D-01; assumption A-05 |
| BR-15 | A rep can enter a quote request on behalf of a reseller user when it arrives by phone or email. It gets an ID and a received time like any other, is marked with how it arrived, and the reseller user receives the same confirmation email (BR-07). **Unmet if** a phone request cannot be given a request ID, or cannot be told apart from one the reseller submitted. | Must | D-04; pre-mortem in inputs/brief.md |
| BR-16 | A reseller user sees each of their reseller's requests with its current status — received, being quoted, quote sent, change requested, approved, declined or expired — and the same status is shown to the internal sales team. **Unmet if** the reseller and the internal sales team see different statuses for the same request. | Must | D-04 |
| BR-17 | The catalog and pricing store holds every product that the Excel ERP holds at go-live, with its part number, description and price. Named internal users can add a product, change its price, and close it for quoting. Every price change records the old price, the new price, who made it and when. **Unmet if** a product in the ERP at go-live is missing from the store, or a price change has no record of who made it. | Must | D-03, D-06; assumption A-07 |
| BR-18 | A price change in the store does not change a quote already sent. When a product is closed for quoting, it disappears from search, and any open request that contains it is flagged in the internal sales list. **Unmet if** a sent quote's price moves after sending, or an open request containing a closed product is not flagged. | Must | D-06 |
| BR-19 | Quote requests, every version of every quote, and every response are kept and cannot be deleted by any user, for at least five years after the request is closed. **Unmet if** any of them can be deleted or is lost within that period. | Should | D-10, D-11, D-12; assumption A-08 |
| BR-20 | The catalog and pricing store holds one standard discount for each reseller. Only internal users named by Jensen Huang can set or change it, and every change records the old value, the new value, who made it and when. A reseller with no standard discount on file gets no pre-filled discount. The rep enters one with a reason, and the request is flagged in the internal sales list. A change to a standard discount does not alter a quote already sent. **Unmet if** a user who is not named can change a standard discount, a change has no record, or a quote for a reseller with no discount on file is sent with no reason recorded. | Must | inputs/brief.md, D-01; assumption A-07 |

## 8. Non-functional requirements and constraints

| # | Requirement or constraint | Source | Evidence |
|---|---|---|---|
| NF-01 | **One source of price from go-live.** From go-live the catalog and pricing store is the only source of quote prices. Phone quotes are priced from it too, and the Excel ERP is kept read-only for reference. If both are used, the same reseller can be quoted two different prices for the same product, and nobody can say which was right. Owner: Jensen Huang. | Constraint archaeology; industry practice (two price truths) | D-03, D-06 |
| NF-02 | **Email platform and sign-in are not known.** Which email platform Bow sends from, and whether Bow has a sign-in service its staff already use, must be established before architecture. Owner: Elon Musk. Until then, BR-07, BR-13 and BR-14 depend on an unknown system. | inputs/brief.md open point | D-02 |
| NF-03 | **The Excel ERP has no named owner.** Someone at Bow owns loading its products and prices into the store, checking the load is complete (BR-17), and freezing the spreadsheet on the day. Owner to be named by Elon Musk before architecture. | Constraint archaeology | D-03 |
| NF-04 | **Reseller accounts have to exist before go-live.** With no CRM, the list of resellers, their contacts and which of them is the admin exists only in reps' spreadsheets and memory. The internal sales team has to assemble it before any reseller can log in. Owner: Jensen Huang. | Constraint archaeology | D-02 |
| NF-05 | **Requests open at go-live.** Requests still open in the Excel spreadsheets on the go-live date are re-entered by reps using BR-15, so no open request is left in a spreadsheet. Owner: Jensen Huang. | Constraint archaeology | D-02; assumption A-11 |
| NF-06 | **Reps stop quoting outside the portal.** From go-live a rep enters every request they receive, by phone or email, in the portal. This is a working-practice change for the internal sales team, not a system feature. It is what O-01 measures. Owner: Jensen Huang. | Pre-mortem in inputs/brief.md | D-04 |
| NF-07 | **Personal data of reseller users.** The portal holds the names and email addresses of people at resellers. Which data protection law applies depends on where Bow and its resellers are, which is not yet known. Owner: Elon Musk, before architecture. | Constraint archaeology | assumption A-08 |
| NF-08 | **Volumes are not known.** The number of resellers, users per reseller, requests a week and products in the catalog are not recorded anywhere. They are needed to size the build. Jensen Huang has them counted from the spreadsheets before architecture. | Constraint archaeology | D-02 |
| NF-09 | **No deadline, freeze or other programme is known.** No go-live date, busy season or competing work for the internal sales team has been named. This is an absence, not a finding. It stops being true the moment Jensen Huang names a date or a period the team cannot absorb change — ask before the backlog is sequenced. | Constraint archaeology | inputs/brief.md |
| NF-10 | **Reseller discount terms have to be found and signed before go-live.** Today the terms may be in the ERP spreadsheet or known only to reps (inputs/brief.md). Before go-live, every active reseller's standard discount has to be written down, and Jensen Huang, or a commercial owner Jensen Huang names, has to sign the list. Otherwise the store turns today's habits into policy nobody agreed to. BR-20 cannot be loaded until then. Owner: Jensen Huang; Elon Musk finds where the terms live today. | Constraint archaeology; industry practice (pricing rules owned before encoded) | D-01, D-03 |

## 9. Assumptions to confirm at review

| # | Assumption adopted | What becomes false if wrong | Confirmed by |
|---|---|---|---|
| A-01 | A reseller admin role exists and manages only their own reseller's users. | BR-02 is removed, and Bow's internal sales team has to create and remove every reseller user. | Jensen Huang |
| A-02 | A quote request can carry several products, each with its own quantity, under one request ID. Answered by Yash Dixit in Discovery, 2026-09-25; the client confirms at review. | BR-05, BR-11 and BR-14 are written for one product per request, and a buyer wanting five parts makes five requests. | Jensen Huang |
| A-03 | Search shows products without prices. Prices are seen only on a quote. | BR-04 changes to show each reseller their own price, which the standard discount in BR-20 would then have to be applied to on every search. | Jensen Huang |
| A-04 | The reps' list is ordered oldest first. Answered by Yash Dixit in Discovery, 2026-09-25; the client confirms at review. | BR-09's order rule changes. If key-client resellers must come first, someone commercial has to own the list of key clients. | Jensen Huang |
| A-05 | A reseller's approval is an acceptance that Bow's manual process then confirms, not a binding order. The approval screen says so. Fulfilment continues outside the portal. Answered by Yash Dixit in Discovery, 2026-09-25; the client confirms at review. | If approval is a binding order, the approval screen needs Bow's terms of sale, and the out-of-scope boundary on fulfilment must be revisited. | Jensen Huang |
| A-06 | Reps may send a quote at any discount, with no manager approval. Every discount is recorded (BR-11). | An approval step with a threshold is added before a quote can be sent, and a sales manager role is needed. | Jensen Huang |
| A-07 | Each reseller has one standard discount that applies to every product, held in the store and pre-filled on quotes. Reps can change it per line with a reason. Reseller terms are not more complex than that — no per-product or per-quantity breaks, and no contract prices. Answered by Yash Dixit in Discovery, 2026-09-25; the client confirms at review. | If terms vary by product, by quantity or by contract, one number per reseller cannot hold them. BR-20 grows into a pricing rules table, and NF-10's signed list becomes a much bigger job. | Elon Musk (where the terms live and what shape they take), Jensen Huang (signs them) |
| A-08 | Bow is subject to US export controls, so quote records may be export records to keep for five years (D-10 to D-12). Screening and classification stay outside the portal and happen before shipment, as today. | If Bow is not subject to US jurisdiction, BR-19's five-year period and NF-07's law are set by the law that does apply. If Bow runs no screening today, an approved quote could lead to a shipment nobody screened — raised, not solved, here. | Elon Musk |
| A-09 | Faster, tracked quotes will reduce business lost with key clients. This is untested. | The portal could meet O-01 to O-03 and key-client business still be lost for reasons it cannot reach, such as price or stock. | Jensen Huang |
| A-10 | Quote turnaround and status calls stay as outcomes. Their targets are set after their baselines are measured, not before approval. Answered by Yash Dixit in Discovery, 2026-09-25; the client confirms at review. | If Jensen Huang wants targets now, they would have no baseline and could not be met or missed. | Jensen Huang |
| A-11 | Historical requests are not migrated. Only requests open on go-live day are re-entered. | Closed requests become visible in the portal and a migration is added to scope. | Jensen Huang |
| A-12 | The scope boundary in §4.2 was recommended by the agent and accepted by Yash Dixit. No client stakeholder has confirmed it yet. | Any exclusion the client rejects moves into scope, and the backlog grows. | Jensen Huang, Elon Musk |
| A-13 | Resellers will use a portal rather than phone. No reseller has been asked. | O-01 is met only by reps entering phone requests (BR-15), and O-03 does not fall. | Jensen Huang, by asking two or three resellers before go-live |
| A-14 | Each quote's valid-until date is set by the rep. Jensen Huang names the default period. | Without a default, reps set inconsistent periods. If quotes should never expire, BR-12 is removed. | Jensen Huang |
| A-15 | The timings in BR-07 and BR-13 (email within 15 minutes) and BR-08 (in the reps' list within one minute) are the agent's recommendation. The client named no timing. | If Bow needs faster notice, for example while a buyer is still on the phone, the thresholds tighten. If slower is acceptable, they loosen, and the build may get simpler. | Jensen Huang |

## 10. Approval

Approving this document makes §4 and §7 the scope the backlog is built from, and commits Bow to the go-live preconditions in §8 — one source of price, reseller accounts assembled, each reseller's standard discount signed, open requests re-entered, and every request entered in the portal. The assumptions in §9 are approved as written unless the Product Owner corrects them at review. Any change after approval goes through the change process and is recorded against this document.

| Role | Name | Decision | Date |
|---|---|---|---|
| Product Owner | Jensen Huang | | |
