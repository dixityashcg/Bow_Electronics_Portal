# Solution Architecture — Bow Electronics Reseller Portal

**Status**: Draft · **Prepared by**: Yash Dixit · **For approval by**: Elon Musk

**Built from**: the approved BRD (g1-brd) and the approved backlog (g2-backlog, six Epics, 33 stories). The decision record beside this document is `decisions.md`. The per-Epic demonstration plan is `demo-topology.md`. This is a greenfield engagement: there is no existing system to assess, and the baseline is `assessment.md`.

**Settled and provisional.** Anything marked **(provisional)** waits on a fact that only Bow can supply, and the entry names who supplies it. Everything else is settled for the build. A build agent that finds a settled point cannot be built as written brings it back to the architect. It is not solved quietly in code.

## 1. Executive summary

We will build the reseller portal as **one web application with one database**, hosted on **Microsoft Azure managed services**. Bow therefore runs no servers of its own, and an external support partner can look after it without a Bow IT team. The same application serves two separate sign-in entrances: one for **resellers**, who are invited by email and sign in through Microsoft's external identity service, and one for **Bow's internal sales team**, who sign in with their existing Microsoft 365 accounts. The application's own database becomes the **catalog and pricing store**, the single source of every quote price from go-live. The Excel ERP is loaded into it once and then frozen for reference.

Five decisions matter most:
- Every request, sent quote, reseller response and price or discount change is written to **tables the database itself refuses to alter or delete**, so the five-year record the BRD asks for (BR-19) cannot be edited even by an administrator (ADR-04).
- A quote line **copies** the store price and the reseller's standard discount at the moment the rep starts the quote. Later price or discount changes therefore never move a sent quote (ADR-05).
- Request IDs are **random short codes**, such as `Q-7K3M-9TPX`. They reveal nothing about Bow's volumes, and a restore from backup cannot hand out one already printed on a reseller's email (ADR-06).
- Emails are **queued in the database and sent by a background worker**. A failure is therefore always visible on the failed emails list, never silent (ADR-07).
- The status of a request is **one value, held once**, so the reseller and the rep can never see different statuses (ADR-08).

**What it costs to run.** Azure charges for app hosting, a small database, email sending by volume and the external sign-in service. At the volumes assumed in §7 this is indicatively in the low hundreds of US dollars a month for production and a test environment together. Yash Dixit prices it with Azure's pricing calculator for Bow's region before the gate. Bow also pays for a **support partner contract**, because Bow has no IT operations team (C-05). That contract is the larger running cost, and it is a go-live precondition, not an option.

**What it does not attempt.** The portal does not create orders, invoices, payments or shipments. It does not show or reserve stock. It does not exchange files with resellers' purchasing systems, and it does not screen or classify for export (BRD §4.2). An approved quote notifies the owning rep, and fulfilment and any export screening continue outside the portal, exactly as today.

## 2. Context

Today a reseller's buyer phones a rep, the rep logs the request in a personal Excel spreadsheet and looks the price up in the **ERP**. The ERP is Bow's name for a home-grown Excel spreadsheet that holds the catalog and prices. The quote goes back by hand. Bow has no CRM and no system that tracks requests (BRD §2.2).

After go-live:

```
  Reseller users (browser)                      Bow internal sales team (browser)
          │  sign in: Microsoft Entra External ID         │  sign in: Bow's Microsoft 365 accounts (Entra ID)
          ▼                                               ▼
  ┌──────────────────────────── Reseller portal web application (Azure App Service) ────────────────────────────┐
  │  Reseller pages          Internal sales pages          Catalog and pricing store pages                      │
  │  ─────────── modules: Access · Catalog and pricing · Quote workflow · Notifications (background worker) ─── │
  └──────────────┬────────────────────────────────────────────────────────────────────┬───────────────────────────┘
                 ▼                                                                    ▼
   Portal database (Azure SQL Database)                       Email sending service (Azure Communication Services)
   = the catalog and pricing store + every request,                  │  sends as Bow's own email domain
     quote and response                                              ▼
                 ▲                                            Reseller and rep mailboxes
                 │ one-off load at go-live
   Excel ERP (frozen read-only afterwards, NF-01)
```

In plain terms:
- **Who calls the portal.** Reseller users and Bow's internal sales team, each through a web browser. No other system calls it, and there is no electronic exchange with resellers' systems (BRD §4.2).
- **What the portal calls.** Two Microsoft sign-in services: *Entra ID*, which already holds Bow's staff accounts because Bow uses Microsoft 365, and *Entra External ID*, a separate directory for people outside Bow. It also calls one email-sending service, *Azure Communication Services*. Nothing else.
- **Where data comes from.** Products and prices come once from the Excel ERP at go-live, and after that only from named Bow users editing the store. Requests come from reseller users, or from reps entering phone and email requests. Resellers and their first admins are created by reps.
- **Where data goes.** Only to the people entitled to it, on screen and by email. Nothing flows to fulfilment, finance or any other system. An approved quote is an email to the owning rep, and the rest of the process is manual.

Industry questions about freight tracking data, certificates of conformance and supplier master data (electronics-distribution-questions #9–#11) do not arise. Nothing downstream of an approved quote, and no supplier data, is in scope.

## 3. Constraints

| # | Constraint | Source | What it forecloses | How the design respects it |
|---|---|---|---|---|
| C-01 | From go-live the catalog and pricing store is the only source of quote prices, and the Excel ERP is read-only | BRD NF-01, D-06 | Any design that keeps the spreadsheet live, or syncs from it after go-live | One-off load (story-01-01), after which the store is maintained only through its own pages. Quote line prices can only come from the store (ADR-05) |
| C-02 | Bow's staff use Microsoft 365 | Answered by Yash Dixit (FDE), 2026-09-26 | A second workforce sign-in for staff. Hosting on another cloud without a second vendor to manage | Staff sign in with their Microsoft 365 accounts, and hosting is Azure (ADR-02, ADR-03) |
| C-03 | Resellers are external companies with no shared identity system | BRD §4.1, story-02-01 | Federating each reseller's own directory. Self-registration (story-02-01 DoD) | Invitation-only accounts in Entra External ID, created by reps or reseller admins (ADR-03) |
| C-04 | No electronic exchange, no orders, no stock, no screening, no payments | BRD §4.2 | Any outbound integration to a fulfilment, finance or screening system | The portal has no outbound integration apart from email and sign-in. An approval creates only a response record and an email |
| C-05 | **Bow has no IT operations team.** The portal will be run on managed services with an external support partner in business hours | Answered by Yash Dixit (FDE), 2026-09-26 | Self-hosted servers, containers to orchestrate, a message broker, a search cluster, or anything that needs an on-call engineer at Bow | Only managed Azure services, one application, one database, and no broker or separate search engine (ADR-01, ADR-02, ADR-09). Runbooks in §10 are written for the partner |
| C-06 | Request records may be US export records, kept five years and not deletable | BRD BR-19, A-08, D-10–D-12 | Soft-delete, purge jobs, or any path that edits a sent quote | Append-only ledger tables (ADR-04). No delete path exists in the application |
| C-07 | Reseller discount terms are one number per reseller, signed before load | BRD A-07, NF-10 | A pricing rules engine (per-product, per-quantity or contract prices) | One standard discount per reseller with history (story-04-01). If A-07 proves false, that is a BRD change (§11) |
| C-08 | Volumes are not known | BRD NF-08 | Sizing to measured load | Designed and load-tested against the stated assumptions in §7.1. Revisited when Jensen Huang's counts arrive |
| C-09 | Which data protection law applies is not known | BRD NF-07 | Choosing the Azure region, and a final answer on keeping reseller users' names for five years | **(provisional)** Region = Bow's home geography, confirmed by Elon Musk before production is provisioned. Risk R-04 |
| C-10 | The Excel ERP has no named owner | BRD NF-03 | Running the go-live load and signing its completeness | The load produces a summary for a person to sign (story-01-01). **Prerequisite:** Elon Musk names the ERP owner before epic-01's demo (`demo-topology.md`) |
| C-11 | Reseller accounts and discounts exist only in reps' spreadsheets and memory | BRD NF-04, NF-10 | Launching with resellers able to sign in on day one without preparation | Entered through the resellers page and the standard discount field. There is no bulk loader: the backlog has no story for one (see §11, Q-05) |

## 4. Components

One deployable web application (ADR-01), organised as four modules that share one database. The modules are code boundaries, not separate services: each owns its own tables, and another module reaches them only through that module's code, never by querying its tables.

| Component | Responsibility | Owned by | Notes |
|---|---|---|---|
| **Reseller pages** | Product search, quote request, My requests, the quote with approve / change / decline, Users (reseller admin) | Built by the delivery team; run by the support partner | Served under `/`; reseller sign-in only |
| **Internal sales pages** | Open requests list, enter request, request page (take, hand over, reassign), quote builder, resellers page with standard discounts, named users, failed emails list, refused attempts list | As above | Served under `/sales`; staff sign-in only. Every page and action checks the internal user and role on the server |
| **Catalog and pricing store pages** | Load summary, product page, add product, change price, price history, close for quoting | As above | Under `/sales/store`; price maintainers only for changes |
| **Access module** | Resellers, reseller users, invitations, deactivation; internal users; the named-user lists (price maintainers, discount setters, internal admins, role managers); authorisation on every request; refused-attempt records | As above | Holds the rule "which reseller does this session belong to" once, for every other module (ADR-03) |
| **Catalog and pricing module** | Products, open or closed for quoting, prices and price history, standard discounts and discount history, full-text search, the one-off ERP load | As above | Becomes the system of record for part data and price at go-live (C-01) |
| **Quote workflow module** | Requests and their lines, request IDs, received time, how it arrived, owner, status; draft quotes; sent quote versions and lines; responses; flags (closed product, no standard discount) | As above | All status changes go through one guarded transition function (ADR-08) |
| **Notifications module** | Writes each email to an outbox in the same database transaction as the event. A background worker in the same application sends it and lists failures | As above | ADR-07. Runs inside the web application, with no separate host |
| **Portal database** | Azure SQL Database: every table above. Append-only ledger tables for records (ADR-04); full-text index on product descriptions (ADR-09) | Azure (managed); support partner administers | Point-in-time restore 35 days, geo-redundant backups (§7) |
| **Staff sign-in** | Bow's Microsoft Entra ID tenant: authenticates Bow staff | Bow's Microsoft 365 administrator (named in `demo-topology.md`) | Signing in proves only who someone is. The application then checks its own internal users list (T-05) |
| **Reseller sign-in** | A Microsoft Entra External ID tenant created for the portal: authenticates invited reseller users | Support partner | The application holds no passwords |
| **Email sending** | Azure Communication Services Email, sending from Bow's domain over SMTP | Support partner; Bow's DNS owner sets the domain records | ADR-07 |
| **Monitoring** | Application Insights: request logs, errors, availability tests, alerts to the support partner | Support partner | §7 and §10 |
| **Hosting** | Azure App Service (Linux), with a test environment and a production environment | Support partner | Two instances in production, so one can fail or be patched without an outage |

**Not built.** Nothing sends data to a fulfilment, finance, screening or stock system. There is no public programming interface: the only way in is the pages. There is no reseller self-registration, and no bulk import of resellers or discounts (see Q-05).

## 5. Data

### 5.1 What is held, and where

Everything lives in the one portal database. "Ledger (append-only)" means the database accepts new rows and refuses every update and delete, including from administrators (ADR-04). "Ledger (updatable)" means rows can change, but the database keeps every earlier version automatically.

| Entity | Holds | Kind | Owning module |
|---|---|---|---|
| Product | part number, description, current price, open or closed for quoting | Ledger (updatable) | Catalog and pricing |
| Price change | product, old price, new price, who, when | Ledger (append-only) | Catalog and pricing |
| ERP load run | file name, rows read, rows loaded, each row not loaded with its reason, who ran it, when, complete or not | Ledger (append-only) | Catalog and pricing |
| Standard discount | reseller, current value (0–100 %) or none on file | Ledger (updatable) | Catalog and pricing |
| Discount change | reseller, old value or none, new value, who, when | Ledger (append-only) | Catalog and pricing |
| Reseller | name | Ledger (updatable) | Access |
| Reseller user | reseller, name, email (unique across all resellers), admin or not, active or deactivated, External ID object id | Ledger (updatable) | Access |
| Internal user | name, Bow Entra ID object id, active or not | Ledger (updatable) | Access |
| Role assignment | internal user, role (price maintainer, discount setter, internal admin, role manager), granted or revoked, by whom, when | Ledger (updatable) | Access |
| Refused attempt | user, page or action attempted, when | Ledger (append-only) | Access |
| Request | request ID, reseller, requester, received time, how it arrived (Portal, Phone, Email), entered by, status, owner, current quote version | Ledger (updatable). The request ID, received time, reseller and how it arrived cannot be updated (§5.3) | Quote workflow |
| Request line | request, product, quantity | Ledger (append-only) | Quote workflow |
| Ownership change | request, old owner, new owner, taken / handed over / reassigned, by whom, when | Ledger (append-only) | Quote workflow |
| Draft quote | request, lines with the copied store price and standard discount, discount entered, reason, valid-until | Ordinary table, deleted when sent. A draft is not a record | Quote workflow |
| Quote version | request, version number, built by, sent at, valid-until | Ledger (append-only) | Quote workflow |
| Quote line | version, product, quantity, store price, standard discount or "none on file", discount applied, net price each, line total, reason | Ledger (append-only) | Quote workflow |
| Response | quote version, approve / change requested / decline, who, when, comment or reason | Ledger (append-only), at most one per version (§5.3) | Quote workflow |
| Email outbox | kind, request, recipient, created, attempts, sent at or failed at, provider's refusal reason | Ledger (updatable) | Notifications |

### 5.2 Rules that live in the data, not only in the screens

- **Money.** Prices are held as decimals with 4 places, and net prices and line totals are rounded to 2 places, half away from zero. The rounding rule is **(provisional)**, to be agreed with Jensen Huang, including the 9.99-at-12 % case in story-04-02's DoD. There is one currency (backlog assumption). The currency code is still stored on every quote version, so a second currency is a change of rules, not of records.
- **Time.** Every timestamp is stored in UTC. Screens show Bow's business time zone. **Today**, for valid-until and expiry, is the calendar date in Bow's business time zone, and a quote is valid to the end of its valid-until date there (story-05-04 DoD). The zone itself is **(provisional)**, until Bow's location is confirmed (Q-03).
- **Received time** is set by the database when the request is recorded, for every path including a rep's entry (BRD BR-06, BR-15). For a request that arrived by phone or email, this is the time it was **entered**, not when it arrived. See Q-02.
- **A request belongs to exactly one reseller**, copied from the requester when the request is recorded. It never changes, even if the requester is later deactivated.

### 5.3 Guarantees the database enforces

The application's database login **cannot**:
- update or delete any append-only ledger row;
- update a request's ID, received time, reseller or how it arrived. The grant covers the other columns only;
- record a second response for the same quote version (unique constraint);
- give a request a second owner. "Take" is a single conditional update that succeeds only when the request has no owner (ADR-08);
- store two reseller users with the same email (unique constraint).

These hold whatever a screen or a direct request tries, which is what the "directly" criteria in the backlog test (story-01-04 c5, story-02-03 c4, story-05-01 c7, story-05-07 c3).

### 5.4 Data classes: who may read and change each

| Class | Examples | Who may read | Who may change | Kept |
|---|---|---|---|---|
| Store prices (commercially sensitive) | product price, price history | Internal users. A reseller sees a price only on its own sent quotes (A-03) | Price maintainers only | Indefinitely (ledger) |
| Standard discounts (commercially sensitive, per reseller) | Reseller A's 12 % | Internal users. Never any reseller user, including the reseller it belongs to (story-04-01 c4) | Discount setters only | Indefinitely |
| A reseller's requests and quotes (commercially sensitive, per reseller) | lines, quantities, net prices, reasons | That reseller's active users; internal users | Requests: created by that reseller's users or by reps; never edited. Quotes: created by reps; never edited once sent | At least 5 years after closing (BR-19); in practice never deleted |
| Reseller users' personal data | name, email | That reseller's users; internal users | That reseller's admins; reps (add users) | As long as their requests are kept (R-04) |
| Staff personal data | name, Entra ID object id | Internal users | Role managers | Indefinitely |
| Records of control | refused attempts, ownership changes, role assignments, ERP load runs | Internal admins (refused attempts); internal users (the rest) | Nobody (append-only) or role managers (role assignments) | Indefinitely |
| Credentials | passwords, one-time codes | Nobody in Bow. Held by Microsoft's sign-in services | The user | Microsoft's policy |
| Secrets | the email-sending credential | The running application (via Azure Key Vault) | Support partner | Rotated every 12 months (§10) |

## 6. Decisions

The full records, with rejected alternatives, costs and revisit conditions, are in `decisions.md`. In short:

| # | Decision | Status |
|---|---|---|
| ADR-01 | One web application with four modules and one database, built for Bow rather than bought | Proposed |
| ADR-02 | Hosted on Azure managed services: App Service, Azure SQL Database, Communication Services, Key Vault, Application Insights; region per NF-07 | Proposed; region provisional |
| ADR-03 | Staff sign in with Bow's Microsoft 365 accounts, and resellers with invitation-only Entra External ID accounts. Who may do what is decided in the application | Proposed |
| ADR-04 | Records that must never change are append-only ledger tables in the database | Proposed |
| ADR-05 | A quote copies the store price and standard discount when the rep starts it. Sent quotes are immutable versions | Proposed |
| ADR-06 | Request IDs are random 8-character codes, not a counter | Proposed |
| ADR-07 | Emails go through an outbox table and a background worker to Azure Communication Services. Refusal after 10 minutes of retries is listed as failed | Proposed |
| ADR-08 | One stored status per request, changed only by guarded transitions. Expired is worked out when read, from the valid-until date and Bow's business day | Proposed |
| ADR-09 | Product search uses the database's own full-text index, not a separate search service | Proposed |
| ADR-10 | Built in C# on ASP.NET Core, with pages rendered on the server | Proposed; confirmed by the FDE at Q-01 |

## 7. Non-functional targets

### 7.1 Sizing assumptions (NF-08 not yet counted)

Designed and load-tested for: **500 resellers, 3,000 reseller users, 50 internal users, 1,000 requests a day at peak, 20 lines per request on average, 250,000 products.** These are the architect's assumptions, not Bow's figures. Jensen Huang's counts replace them when they arrive. If any real figure is more than twice the assumption, ADR-01 and ADR-09 are revisited.

### 7.2 Targets

| # | Attribute | Target | How it will be verified | Source |
|---|---|---|---|---|
| N-01 | Product search response | 95 % of searches return in ≤ 1.0 s (server time), with 250,000 products and 50 concurrent searches | Load test in the test environment against a synthetic 250,000-product catalog, plus the real ERP load; Application Insights percentiles | BR-04; §7.1 |
| N-02 | Other page responses | 95 % in ≤ 1.5 s with 100 concurrent users on the §7.1 mix | Same load test | Architect's target, not client-committed |
| N-03 | New request visible to reps | In the open requests list ≤ 60 s after it is recorded, including on a list already open on a rep's screen (the list refreshes itself every 30 s) | QA submits a request with the list open on a second screen and times its arrival, 20 runs, all ≤ 60 s | BR-08, A-15 |
| N-04 | Email hand-over | 99 % of emails accepted by the email service ≤ 5 min after the event. Any email not accepted after 10 min of retries appears on the failed emails list ≤ 15 min after the event | Outbox timestamps in the test environment. QA blocks the email service credential and times the failed-list entry | BR-07, BR-13, A-15 |
| N-05 | Availability | 99.5 % per calendar month (about 3 h 40 min of downtime), excluding maintenance announced two business days ahead | Application Insights availability test from 3 locations every 5 minutes against the sign-in page and a health check that reads the database; monthly report | Architect's proposal. **Not client-committed** until Jensen Huang confirms (Q-04) |
| N-06 | Data loss and recovery | Ordinary failure or mistake: lose ≤ 15 min of data, restored ≤ 4 business hours. Loss of the Azure region: lose ≤ 1 h, restored ≤ 1 business day | A restore drill in the test environment before go-live, timed and recorded by the support partner. Repeated every 12 months | BR-19; C-05 |
| N-07 | Records kept | Nothing in §5.1 marked ledger (append-only) can be updated or deleted by the application's database login, for at least 5 years | QA attempts an update and a delete on every append-only table with the application's own credentials, and each is refused | BR-19, A-08 |
| N-08 | Deactivation takes effect | The next page or action by a deactivated user is refused, with no grace period | QA deactivates a signed-in user, then clicks once | story-06-02 c4 |
| N-09 | Role removal takes effect | The next store or discount action by a user whose role was removed is refused | QA removes the role while the user's page is open, then submits | story-01-05 c2, c4 |
| N-10 | One owner, one response | Under 20 simultaneous attempts, exactly one take (or one response) succeeds, in each of 100 runs | Automated concurrency test in the build, repeated by QA | story-03-03 c2, story-05-05 c3 |
| N-11 | Sessions | Reseller session ends after 12 h; internal session after 10 h; either after 60 min idle | QA leaves a session idle 61 min, then clicks | Architect's target |
| N-12 | Transport | TLS 1.2 or later only; HTTP redirects to HTTPS | TLS scan of the production address before go-live | Architect's target |
| N-13 | Accessibility | **Not committed.** The BRD asks for no accessibility standard. Recommended: WCAG 2.2 AA, to be raised with Jensen Huang | — | Not in BRD |
| N-14 | Browsers | Current and previous major versions of Edge, Chrome, Safari and Firefox | QA runs each Epic's demo path in each | Architect's target |

## 8. Security

### 8.1 Trust boundaries (where control changes hands)

| # | Boundary | Who is on each side |
|---|---|---|
| B1 | The internet → the portal's sign-in entrances | Anyone → the portal |
| B2 | A signed-in reseller user → **another reseller's** data | Reseller B's user → Reseller A's requests, quotes, users |
| B3 | A reseller user → their own reseller's admin actions | A non-admin buyer → adding and deactivating colleagues |
| B4 | A reseller user → internal sales pages and actions | Any reseller user → `/sales/*` |
| B5 | Any Bow staff member → the internal sales side | A Bow Microsoft 365 account → the portal's internal users list |
| B6 | A rep → privileged internal actions | A rep → price changes, standard discounts, reassignment, naming users |
| B7 | The portal → email, leaving Bow's control | Portal → Azure Communication Services → reseller mailboxes |
| B8 | The Excel ERP → the store (one-off load) | A spreadsheet nobody owns today → the source of every price |
| B9 | People with Azure or database administration rights → the records | Support partner, Bow's Azure owner → the database directly |

The data classes, and who may read and change each, are in §5.4.

### 8.2 Threats

| # | Boundary | Threat | Consequence if it fires | Rating | Mitigation (as QA will attempt it) |
|---|---|---|---|---|---|
| T-01 | B2 | Reseller B's user types Reseller A's request ID or quote address, or sends an approval for it directly | Reseller B sees what Reseller A is buying, in what quantities and at what net price, and can work out A's discount. Reseller B is often A's competitor, and Bow's commercial confidence with both is broken. Or B approves A's quote | Likely without a control; severe | Every read and action finds the record through the session's own reseller, never through the ID alone. A missing and a foreign ID give the same "not found". **QA:** as a Reseller B user, open Reseller A's request by ID, by page address and by a direct approval; each is refused, A's quote is unchanged, and the response is identical to a made-up ID (story-02-06 c3, story-05-01 c7) |
| T-02 | B2, B7 | A confirmation or quote ready email for Reseller A reaches a user of another reseller | As T-01, by email, where Bow cannot recall it | Unlikely; high | Recipients are read from the request's own reseller at send time. Quote ready emails carry no prices. **QA:** send each email kind for Reseller A and check that no Reseller B mailbox receives anything (story-02-05 c4, story-04-05 c6, c8) |
| T-03 | B3 | A non-admin buyer adds an outsider to their reseller, or deactivates a colleague, by calling the action directly | An outsider reads every quote the reseller holds. A colleague is locked out | Possible; high | Admin actions check the admin flag on the server. **QA:** as a non-admin, send add and deactivate directly; both refused, nothing changed (story-06-03 c2). As Reseller A's admin, act on a Reseller B user; refused (c3) |
| T-04 | B1, B3 | A deactivated user, now at a competitor, keeps using a session that was open when they left | They keep reading their old company's quotes and prices | Possible; high | The active flag is read on every page and action, not only at sign-in. **QA:** N-08 |
| T-05 | B5 | Any Bow employee with a Microsoft 365 account (warehouse, finance) signs in to the internal side | They see every reseller's requests, prices and discounts, which BR-03 limits to internal sales | Likely without a control; high | A valid Bow account admits only people on the portal's internal users list. **QA:** sign in with a Bow account that is not on the list; refused and recorded |
| T-06 | B4 | A reseller user opens an internal page or sends an internal action | As T-01 across every reseller, or a reseller changes prices | Possible; severe | Every `/sales` page and action requires an internal session, and a reseller session there is refused and recorded (user, action, time). **QA:** story-01-04 c3–c4, story-02-06 c4, story-04-01 c4, including actions sent directly |
| T-07 | B6 | A rep who is not a price maintainer or discount setter changes a price or discount by sending the change directly | A price or discount moves with nobody accountable for it. Every quote after that uses it (NF-01) | Possible; high | Role checked on the server for every store and discount action, read fresh each time. **QA:** story-01-04 c5, story-04-01 c3; N-09 |
| T-08 | B6 | An internal admin or discount setter names themself a price maintainer | The separation Jensen Huang asked for (story-01-05 DoD, story-03-06 DoD) disappears | Possible; medium | Only role managers can change the named lists, and nobody can grant a role to themself: another role manager must do it. **QA:** as an internal admin, add yourself to price maintainers; refused. As a role manager, grant yourself discount setter; refused |
| T-09 | B6 | A rep sends a quote whose store price has been edited in the page before sending | A reseller is quoted a price the store never held, and NF-01 fails silently | Possible; high | The server ignores any submitted store price and uses the price copied into the draft (ADR-05). **QA:** alter the store price in the send request; the sent quote shows the store's price |
| T-10 | B3, B6 | A rep, on the phone with a caller who claims to work for Reseller A, adds them as a user (D2-Q5) | An outsider reads all of Reseller A's quotes | Possible; high | D2-C2: Reseller A's admins are emailed naming the new user and the rep who added them. This **detects**, it does not prevent (R-03). **QA:** story-02-01 c6, story-03-04 c9 |
| T-11 | B1 | An invitation email is forwarded or intercepted, and someone else completes it | An outsider holds a reseller account | Unlikely; high | Invitations are single-use, expire after 7 days, and External ID requires a code sent to the invited address. **QA:** reuse a completed invitation; refused. Use one 8 days old; refused |
| T-12 | B1 | A buyer double-clicks Submit, or the browser resends after a timeout | Two requests with two IDs, possibly quoted by two reps | Likely; low | Each request form carries a one-time submission key, and a repeat returns the first request. **QA:** submit the same form twice within 1 s; one request exists |
| T-13 | B1 | Search text is read as query syntax (`"capacitor" OR *`, `NEAR(`, unbalanced quotes) | An error page, or a very slow query for everyone | Possible; low | Search text is always passed as a parameter and treated as plain words, never as full-text syntax. **QA:** search `" OR 1=1 --`, `NEAR((a,b),5)`, `*` and a 2,000-character string; each shows results or "no products match", never an error |
| T-14 | B8 | The ERP's price column holds text the loader misreads (`1,234.50`, `$12`, `#REF!`, a formula, a blank) | Every quote from go-live carries a wrong price, and nobody knows which | Likely; severe | A row is loaded only if its price is a plain positive number. Anything else is listed "not loaded" with the reason, and a load with any such row is not complete (story-01-01). Before sign-off the ERP owner compares 20 random products (story-01-01 DoD). **QA:** load a copy seeded with each bad value above; each row is listed with its reason, and the count identity holds |
| T-15 | B8 | The load is run again after go-live, over a store that named users have since maintained | Maintained prices are overwritten by stale ERP prices | Possible; high | The load refuses to run on a store that holds any product. **QA:** run it twice; the second is refused and the store is unchanged |
| T-16 | B9 | Someone with database rights edits a sent quote or deletes a request | The export record (A-08) and Bow's evidence of what it offered are false, with no trace | Unlikely; severe | Append-only ledger tables refuse update and delete even from administrators. Ledger digests are kept in immutable storage, so tampering can be detected (ADR-04). **QA:** N-07, plus a ledger verification run. Residual: R-01 |
| T-17 | B7 | The email credential expires or is revoked (it has a 12-month life) | Every confirmation and quote ready email stops. Resellers phone to ask, and the portal's main promise fails | Likely within a year; high | Failed emails appear on the list within 15 min (N-04), and the support partner is alerted on the first failure. Rotation is in the §10 calendar. **QA:** revoke the credential in test; the list and the alert both fire |
| T-18 | B7 | Bow's domain has no SPF or DKIM records for the email service | Confirmation emails land in spam or are rejected after acceptance, which the portal cannot see (R-02) | Likely without a control; medium | The domain is verified in Communication Services before go-live. **QA:** send to one Microsoft 365 mailbox and one Gmail mailbox, and check that the headers pass SPF and DKIM |
| T-19 | B2 | The time a "not found" takes, or its wording, differs for a real foreign ID | Reseller B learns which request IDs exist | Unlikely; low | Accepted (R-05). Random IDs (ADR-06) make guessing impractical |

### 8.3 Accepted risks

No client stakeholder has accepted any of these yet. Each is recorded as **provisionally accepted by Yash Dixit (FDE, operator) on 2026-09-26**, to be ratified or refused by Elon Musk at the architecture gate. The record will show who actually decides, and when.

| # | Accepted risk | Accepted by | Date | Revisit when |
|---|---|---|---|---|
| R-01 | Someone with Azure owner rights can still drop the database or restore over it. Ledger tables stop edits, not destruction | Yash Dixit (FDE), provisional; Elon Musk to ratify | 2026-09-26 | More than two people hold Azure owner rights, or an audit asks for it |
| R-02 | An email the service accepts and that later bounces is not listed (backlog assumption) | Yash Dixit (FDE), provisional; Elon Musk to ratify | 2026-09-26 | Resellers report missing emails that the failed list did not show |
| R-03 | A rep can add a caller to a reseller, and the reseller's admins are told after the fact, not asked first (D2-C2) | Yash Dixit (FDE), provisional; Elon Musk to ratify | 2026-09-26 | Any report of an outsider added this way |
| R-04 | Reseller users' names and emails are kept with their requests for at least five years, whatever data protection law turns out to apply (NF-07 open) | Yash Dixit (FDE), provisional; Elon Musk to ratify | 2026-09-26 | NF-07 is answered, or a reseller user asks to be erased |
| R-05 | Existence of a request ID might be inferred from response timing (T-19) | Yash Dixit (FDE), provisional; Elon Musk to ratify | 2026-09-26 | Request IDs become guessable |

### 8.4 Deliberately not addressed

- **Export screening and classification.** These stay outside the portal (BRD §4.2, A-08). The portal cannot ship anything, so it cannot let a shipment bypass screening. If Bow runs no screening today, that gap exists before and after this work. It is raised in the BRD, not solved here.
- **Denial of service beyond Azure's platform protection.** No web application firewall is included at these volumes. Revisit if the portal is attacked or traffic exceeds 10 times §7.1.
- **Bounce handling.** See R-02.

## 9. Traceability

### 9.1 Requirement → component

| BRD requirement | Component(s) | Deferred? |
|---|---|---|
| BR-01 | Access module (session-scoped reseller); Reseller pages; Notifications (recipient from the request's reseller) | No |
| BR-02 | Access module; Reseller pages (Users); Reseller sign-in (invitations) | No |
| BR-03 | Access module (internal users list, roles, refused attempts); Staff sign-in; Internal sales pages | No |
| BR-04 | Catalog and pricing module (full-text search); Reseller pages | No |
| BR-05 | Quote workflow module (validation before any ID is drawn); Reseller pages; Internal sales pages (enter request) | No |
| BR-06 | Quote workflow module (random ID, database-set received time, non-updatable columns); Portal database | No |
| BR-07 | Notifications module; Email sending; Internal sales pages (failed emails list) | No |
| BR-08 | Quote workflow module; Internal sales pages (self-refreshing list) | No |
| BR-09 | Quote workflow module; Internal sales pages (open requests list) | No |
| BR-10 | Quote workflow module (conditional take, ownership changes); Access module (internal admin role) | No |
| BR-11 | Quote workflow module (draft copies price and discount; sent versions); Catalog and pricing module | No |
| BR-12 | Quote workflow module (valid-until; expiry read from Bow's business day) | No |
| BR-13 | Notifications module; Email sending | No |
| BR-14 | Quote workflow module (responses, one per version, versions kept); Notifications module | No |
| BR-15 | Internal sales pages (enter request); Quote workflow module; Access module (add a caller) | No |
| BR-16 | Quote workflow module (single status, ADR-08); both page sets | No |
| BR-17 | Catalog and pricing module (products, price history, ERP load); Catalog and pricing store pages; Access module (price maintainers) | No |
| BR-18 | Catalog and pricing module (closed products leave search); Quote workflow module (closed product flag; sent quotes copied) | No |
| BR-19 | Portal database (ledger tables, backups); no delete path anywhere | No |
| BR-20 | Catalog and pricing module (standard discounts, history); Access module (discount setters); Quote workflow module (pre-fill, no-discount flag) | No |
| NF-01 | ADR-05 (no hand-typed price); one-off load; §10 go-live step freezing the ERP | No |
| NF-02 | Answered here: ADR-03 (sign-in), ADR-07 (email) | No |
| NF-03 | ERP load and summary; ERP owner is a named prerequisite | Owner still to be named (C-10) |
| NF-04, NF-05, NF-06, NF-10 | Bow's go-live commitments; the pages they use exist (resellers page, enter request, standard discount) | Not build work |
| NF-07 | Region choice and R-04 | **Provisional** until answered |
| NF-08 | §7.1 sizing assumptions | **Provisional** until counted |
| NF-09 | No design effect | — |

### 9.2 Component → requirement (nothing untraced)

| Component | Traces to |
|---|---|
| Reseller pages | BR-01, BR-02, BR-04, BR-05, BR-14, BR-16 |
| Internal sales pages | BR-03, BR-07, BR-08, BR-09, BR-10, BR-11, BR-13, BR-15, BR-20 |
| Catalog and pricing store pages | BR-17, BR-18 |
| Refused attempts list (internal admins) | BR-03 via story-01-04 ("where the record is read is decided in Architecture"). Chosen as a page because nobody at Bow can run database queries (C-05) |
| Role manager role | story-01-05 c5 (someone must be able to change who is named) and story-03-06 c4 (the internal admin role is given by Bow's stakeholders) |
| Access module | BR-01, BR-02, BR-03, BR-10, BR-17, BR-20 |
| Catalog and pricing module | BR-04, BR-11, BR-17, BR-18, BR-20, NF-01 |
| Quote workflow module | BR-05, BR-06, BR-08 to BR-16, BR-18 |
| Notifications module | BR-07, BR-13, BR-14, story-02-01 c6 |
| Portal database | BR-06, BR-19, and all of the above |
| Staff sign-in / Reseller sign-in | BR-01, BR-02, BR-03, NF-02 |
| Email sending | BR-07, BR-13, BR-14, NF-02 |
| Monitoring | BR-07, BR-13 (alert on failed email); N-05 |
| Hosting | C-05; every requirement |
| One-time submission key (T-12) | BR-06 (one request, one ID) — a mitigation, not a feature |

### 9.3 Epic → what must exist before it can be shown

| Epic | Components touched | What must exist first |
|---|---|---|
| epic-01 | Catalog and pricing module and store pages; Access module (internal users, roles, role manager); Staff sign-in; Portal database; Hosting | The walking skeleton: test environment, database, staff sign-in, internal users. **epic-01 carries this cost alone** |
| epic-02 | Reseller pages; Access module (resellers, reseller users, invitations, refused attempts); Reseller sign-in; Quote workflow (request, ID); Notifications and Email sending | epic-01, plus the External ID tenant and the verified email domain |
| epic-03 | Internal sales pages (list, enter request, request page); Quote workflow (ownership, flags) | epic-02. Nothing new in the platform |
| epic-04 | Catalog and pricing (standard discounts); Quote workflow (draft, versions); Notifications | epic-03. Nothing new in the platform |
| epic-05 | Reseller pages (quote response); Quote workflow (responses, expiry) | epic-04. Nothing new in the platform |
| epic-06 | Reseller pages (Users); Access module | epic-02 only |

Only epic-01 needs a large set of work before it can be shown, and epic-02 adds two external services. Every later Epic adds only pages and module code. The design can be delivered in slices, and the one fixed chain (epic-01 → epic-05) comes from the business process the backlog already states, not from the architecture.

## 10. Running it

**Who.** A support partner under contract, in Bow's business hours, is a go-live precondition (C-05). Bow names one person as the partner's contact. The partner holds Azure contributor rights. Azure owner rights are held by two named people only (R-01).

**Monitoring.** Application Insights alerts the partner on: the availability test failing twice in a row; any email reaching the failed list; database storage over 80 %; error rate over 2 % of requests in 15 minutes.

**Runbooks** the partner receives at handover:
1. **Restore.** Restore the database to a point in time, into a new database, then repoint the application. Afterwards, compare the email service's send log for the lost window with the restored database. Any confirmation email that went out for a request the restore lost is a request a reseller holds an ID for. Reps re-enter it (BR-15), and the reseller is told the new ID. Random IDs (ADR-06) mean a lost ID is not handed out again.
2. **Go-live load.** The ERP owner supplies the frozen file, and a price maintainer runs the load and checks the summary. The ERP owner signs the 20-product comparison, and the spreadsheet is then set read-only (NF-01, NF-03).
3. **Seeding.** Two role managers (Jensen Huang and a deputy he names) are set in configuration at first deployment. From then on, all naming is done on the named users page.
4. **Credential rotation.** Rotate the email-sending credential every 12 months, 30 days before it expires (T-17).
5. **Restore drill.** Run it every 12 months (N-06).

## 11. Open points carried to the gate

| # | Point | Recommended answer | Who confirms |
|---|---|---|---|
| Q-01 | Programming language and framework (ADR-10) | C# on ASP.NET Core | Yash Dixit (FDE), then Elon Musk |
| Q-02 | A request entered by a rep carries the time it was entered, not when the call or email arrived, including every request re-entered on go-live day (NF-05) | See the critique | Jensen Huang |
| Q-03 | Bow's business time zone for "today" and valid-until | Bow's head-office time zone | Elon Musk |
| Q-04 | Availability target N-05 | 99.5 % a month, business-hours support | Jensen Huang |
| Q-05 | No bulk loader for resellers, users or standard discounts. At the §7.1 sizing, entering 500 resellers by hand is days of rep time before go-live | Keep as approved. Count the real number first (NF-08) | Jensen Huang |
| — | A-07: one discount per reseller | As approved. If terms prove richer, that is a BRD change | Elon Musk, Jensen Huang |
