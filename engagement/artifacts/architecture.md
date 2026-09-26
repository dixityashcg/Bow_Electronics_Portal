# Solution Architecture — Bow Electronics Reseller Portal

**Status**: Draft, revision 2 · **Prepared by**: Yash Dixit · **For approval by**: Elon Musk

**Built from**: the approved BRD (g1-brd) and the approved backlog (g2-backlog, six Epics, 33 stories). The decision record beside this document is `decisions.md`. The per-Epic demonstration plan is `demo-topology.md`. This is a greenfield engagement: there is no existing system to assess, and the baseline is `assessment.md`.

**Why there is a revision 2.** Yash Dixit (FDE) rejected revision 1 at g3-architecture on 2026-09-26. He asked for rework **within the approved BRD and backlog, with no scope change**, and for the following:
- each in-scope capability mapped to its system of record (§2.3);
- a build-versus-buy analysis of the catalog and pricing store, including Dynamics 365 Business Central (§2.4);
- two or three candidate architectures compared (§2.5);
- C4 context (§2.2), container (§4.1) and deployment (§4.4) diagrams;
- a data model (§5.1) and the request-to-quote sequence (§5.5);
- a tech stack table with browser and server frameworks and versions (§4.3);
- indicative monthly cost by service (§10.3);
- recovery time (RTO) and recovery point (RPO) (§7.3);
- CI/CD and environments (§4.5, §4.6).

The same day the FDE relayed a further direction from Elon Musk (EA): **demos and Epic Reviews run locally on the FDE's Mac, with a stand-in for every external dependency, and real integrations come later.** It is designed in §4.7 (adapters and stand-ins), §4.8 (seed data), §5.6 (how the local database differs from Azure SQL) and ADR-13, and it drives a rewritten `demo-topology.md`.

The design choices of revision 1 stand unless a section says otherwise. One changed: email is now sent with the application's managed identity rather than an expiring SMTP password (ADR-07, revised).

**Stock stays out of scope** (BRD §4.2). No part of this document designs for stock, and nothing here is a change request.

**Settled and provisional.** Anything marked **(provisional)** waits on a fact that only Bow can supply, and the entry names who supplies it. Everything else is settled for the build. A build agent that finds a settled point cannot be built as written brings it back to the architect; it is not solved quietly in code.

## 1. Executive summary

We will build the reseller portal as **one web application with one database**, hosted on **Microsoft Azure managed services**. Bow therefore runs no servers of its own, and a business-hours support partner can look after it without a Bow IT team.

**The approach.**
- The application is written in TypeScript: a React browser application in front of a NestJS server, published as one unit at one web address.
- It has two separate sign-in entrances. **Resellers** are invited by email and sign in through Microsoft's external identity service. **Bow's internal sales team** sign in with their existing Microsoft 365 accounts.
- The portal's own database becomes the **catalog and pricing store**, the single source of every quote price from go-live. The Excel ERP is loaded into it once and then frozen for reference.

**How this was chosen.** We compared three candidate architectures (§2.5):
- **A:** build the portal and the store on Azure;
- **B:** build the portal, and use Dynamics 365 Business Central as the store;
- **C:** a Power Pages low-code portal.

A is recommended because it is the only candidate that delivers the approved backlog as written. It is also the cheapest to run, and the only one that keeps the five-year record uneditable. Business Central is a credible **future** home for Bow's catalog and pricing if Bow later buys an ERP for orders, invoicing and stock. Adopting it now would change the approved epic-01 stories, so it is recorded as a considered option, not the decision (§2.4, ADR-11).

**The decisions that matter most:**
- Records that must never change are held in **tables the database refuses to edit or delete**, even for an administrator (ADR-04).
- A quote **copies** the store price and the reseller's standard discount when the rep starts it, so later changes never move a sent quote (ADR-05).
- Request IDs are **random short codes**, so they reveal nothing about Bow's volumes (ADR-06).
- Emails are **queued in the database** and failures listed, never silent (ADR-07).
- A request has **one status**, seen the same way by the reseller and by the rep (ADR-08).

**Two delivery stages.**
- **Stage 1: local.** Every Epic is built and demonstrated on the FDE's Mac. One command starts the whole portal, and one resets it to seed data. The only prerequisite is Node.js 24 LTS: no Docker, no Azure and no Microsoft 365 accounts. Each external service (database, sign-in, email, clock, telemetry) sits behind an adapter with a local stand-in (ADR-13).
- **Stage 2: Azure.** The real adapters are switched on in the Azure test environment and then production, before go-live. No Epic Review depends on it.

**What it costs to run.** About **US$540–710 a month** in Azure charges for production and test together, at list prices (§10.3). Microsoft 365 and the first 50,000 external sign-ins a month cost nothing extra. Bow also pays for a **support partner contract** in business hours, which is the larger running cost. It is a go-live precondition (§10.1).

**Recovery.** An ordinary fault or mistake loses at most 15 minutes of data and is recovered within 4 business hours. Loss of the Azure region loses at most 1 hour and is recovered within 1 business day (§7.3).

**What it does not attempt.** No orders, invoices, payments or shipments. No stock. No electronic exchange with resellers' purchasing systems. No export screening or classification (BRD §4.2). An approved quote notifies the owning rep, and fulfilment, and any screening, continue outside the portal exactly as today.

## 2. Context

### 2.1 Today and after go-live

Today a reseller's buyer phones a rep. The rep logs the request in a personal Excel spreadsheet, looks the price up in the **ERP**, and sends the quote back by hand. "ERP" is Bow's name for a home-grown Excel spreadsheet that holds the catalog and prices. Bow has no CRM and no system that tracks requests (BRD §2.2).

After go-live, every request is made or entered in the portal. Every price comes from the portal's catalog and pricing store. The Excel ERP is frozen, read-only, for reference.

### 2.2 System context (C4 level 1)

```
                 ┌────────────────────────┐                       ┌──────────────────────────────┐
                 │ Reseller user          │                       │ Bow internal sales team      │
                 │ (buyer, reseller admin)│                       │ (rep, price maintainer,      │
                 │ [person, outside Bow]  │                       │  discount setter, internal   │
                 └───────────┬────────────┘                       │  admin, role manager)        │
                             │ searches, requests,                └──────────────┬───────────────┘
                             │ answers quotes (HTTPS)                            │ quotes, maintains store,
                             ▼                                                   ▼ manages users (HTTPS)
        ┌───────────────────────────────────────────────────────────────────────────────────────┐
        │                     Bow Reseller Portal  [software system — this work]                │
        │   request-to-quote workflow + the catalog and pricing store (system of record)        │
        └──────┬───────────────────────┬──────────────────────────┬──────────────────────────────┘
               │ signs resellers in     │ signs staff in           │ sends email
               ▼                        ▼                          ▼
   ┌────────────────────────┐ ┌────────────────────────┐ ┌─────────────────────────────┐    ┌──────────────┐
   │ Microsoft Entra        │ │ Microsoft Entra ID     │ │ Azure Communication         │───▶│ Reseller and │
   │ External ID            │ │ (Bow's Microsoft 365   │ │ Services Email              │    │ rep mailboxes│
   │ [external system]      │ │  tenant) [external]    │ │ [external system]           │    └──────────────┘
   └────────────────────────┘ └────────────────────────┘ └─────────────────────────────┘

   ┌────────────────────────┐   one-off load at go-live, then frozen read-only (NF-01)
   │ Excel ERP [existing]   │ ─────────────────────────────────────────────────▶ Bow Reseller Portal
   └────────────────────────┘

   Outside the boundary, unchanged and not connected: fulfilment, invoicing, stock, export screening (BRD §4.2)
```

| Element | Kind | Relationship to the portal |
|---|---|---|
| Reseller user | Person, outside Bow | Uses the reseller entrance: search, request, My requests, answer quotes, and (if admin) manage users |
| Bow internal sales team | Person, inside Bow | Uses the internal entrance: open requests list, quote builder, store, resellers and discounts, named users |
| Microsoft Entra External ID | External system (Microsoft) | Holds reseller users' sign-in credentials. The portal asks it who someone is |
| Microsoft Entra ID | External system (Bow's Microsoft 365) | Holds Bow staff accounts. The portal asks it who someone is |
| Azure Communication Services Email | External system (Microsoft) | Sends the portal's emails from Bow's domain |
| Excel ERP | Existing spreadsheet | Read once at go-live (story-01-01), then frozen |
| Fulfilment, invoicing, stock, screening | Bow's manual processes | **Not connected.** An approved quote is only an email to the owning rep |

### 2.3 Capabilities and their systems of record

Each in-scope capability has exactly one system of record: the one place a fact is true. The last column answers the domain question for this industry: *how does a copy learn it is stale?*

| Capability | System of record at go-live | Before go-live | Copies held elsewhere | How a copy learns it is stale |
|---|---|---|---|---|
| **Catalog** (part number, description, open or closed for quoting) | Portal database, catalog and pricing module | Excel ERP | None. Search reads the store directly | No copy exists. Closing a product removes it from search immediately (BR-18) |
| **Pricing** (store price, price history) | Portal database, catalog and pricing module | Excel ERP | Each quote line holds a **deliberate** copy of the price when the rep started it (ADR-05) | It never should. A sent quote's price is fixed by design (BR-18). A draft shows the date its prices were copied |
| **Discounts** (one standard discount per reseller, and its history) | Portal database, catalog and pricing module | The ERP or reps' memory (NF-10, not yet found) | Quote lines copy it, as above | As above |
| **Resellers and reseller users** (membership, admin, active) | Portal database, access module | Reps' spreadsheets (NF-04) | External ID holds each user's sign-in identity and email | The portal never trusts External ID for membership. Membership and the active flag are read from the portal on every action (N-08) |
| **Bow staff identity** (who is a Bow employee) | Bow's Entra ID (Microsoft 365) | Same | None | A leaver disabled in Microsoft 365 cannot sign in |
| **Internal access and roles** (internal users list, price maintainers, discount setters, internal admins, role managers) | Portal database, access module | Nobody holds them today | None | Not applicable |
| **Requests** (ID, received time, lines, owner, status) | Portal database, quote workflow module | Excel request logs (open ones re-entered, NF-05) | None | Not applicable |
| **Quotes and responses** (versions, lines, approvals, change requests, declines) | Portal database, quote workflow module | Reps' emails and spreadsheets | Emails tell people a quote exists but carry no prices (story-04-05 c6) | Not applicable. The portal is the only place a quote is read |
| **Notifications** (what was sent, to whom, whether it failed) | Portal database, email outbox | None | Communication Services keeps its own send logs | Not relied on, except when reconciling after a restore (§10.4) |
| **Records of control** (refused attempts, ownership changes, ERP load runs) | Portal database, append-only | None | None | Not applicable |
| *Stock, orders, invoices, fulfilment* | *Out of scope. Manual today and after go-live* | — | — | — |

### 2.4 Build versus buy: the catalog and pricing store

The approved backlog asks for a store that loads the ERP with a row-level summary, keeps a price and discount history with who and when, closes products for quoting, refuses changes from anyone not named, and records every refusal (epic-01, story-04-01). The chosen option must deliver those stories **as written**. We considered three options, because Bow already pays for Microsoft 365.

| | **1. Build it in the portal's database** (chosen) | **2. Dynamics 365 Business Central** as the store | **3. Dataverse**, the Power Platform database |
|---|---|---|---|
| What it is | Four tables, their history, and the store pages, inside the portal (§5.1) | Microsoft's small-business ERP. Items, prices and customer discounts are held in Business Central, and the portal reads them through its interface | Tables and model-driven apps in Microsoft's low-code platform |
| Delivers epic-01 and story-04-01 as written? | **Yes**, all criteria | **No, not without backlog changes.** See the list below | Mostly. Fails BR-17 and BR-19 record integrity, because administrators can delete audit history |
| Licences (list price) | None | Business Central Essentials **US$80 per user per month** for each price maintainer and discount setter (list price since late 2025). With 3 named users, **about US$240 a month**. Team Members at US$8 cannot edit prices | Power Apps premium per internal user, plus the portal licensing in §2.5 C |
| One-off cost | Part of the build | A Business Central partner to set up the tenant, items, price lists and discounts, and the integration to the portal (not estimated; partner quote needed) | Power Platform partner |
| Who runs it | The support partner (same as the portal) | A Business Central partner **as well as** the portal's support partner. Two partners | A Power Platform partner |
| Future value | None beyond this portal | **High.** If Bow later wants orders, invoicing and stock (all out of scope today), Business Central is the natural home, and the catalog would already be there | Medium |

**What Business Central would change in the approved backlog.** This is why it is a considered option and not the decision:
- **story-01-01 c4** says two ERP rows with the same part number are *both* listed as not loaded. Business Central's configuration package import keys on the item number, so the rows collide rather than both being refused. Meeting the criterion needs a pre-check outside Business Central. *(To confirm with a Business Central partner.)*
- **story-01-02 and story-04-01** require a price and discount history with old value, new value, who and when. Business Central's change log can record this if it is switched on for those fields, but a permitted user can delete change log entries. That is weaker than BR-17 and BR-19 read together, and weaker than ADR-04.
- **story-01-04 c3–c4 and story-04-01 c4** say a reseller user who opens a store page is refused **and a refused-attempt record is kept** with the user, the page and the time. If the store pages are Business Central, a reseller has no account there and never reaches them. The criterion as written cannot be tested, and would have to be rewritten.
- **story-01-05** says Jensen Huang names who may change prices and discounts, and can take it away. In Business Central that is permission sets, assigned by a Business Central administrator, and each named person needs a full licence. The story's screen ("named users") becomes an administrator task.
- **BR-04 and BR-18.** Searching Business Central's interface for description words at the needed speed (N-01) is not practical, so the portal would hold a synchronised copy of the catalog for search. A closed product would then disappear from search only after the next synchronisation. Business Central can notify the portal of item changes, which narrows the delay but does not remove it. It also creates the second copy §2.3 avoids.
- **Compliance.** If Bow later turned approved quotes into Business Central sales orders, they would enter a path that ends in shipment. Following the `electronics-distribution-compliance-screening-gate` playbook, a screening gate that shipment cannot bypass would have to be designed **before** that conversion is built. This is recorded here so the future step is not taken without it. It is not in scope now.

**Recommendation.** Build the store in the portal (option 1, ADR-11). Record Business Central as the path to take **when Bow decides to buy an ERP for orders, invoicing or stock**. At that point the portal's store would be migrated into Business Central, through the change process, with the backlog changes above made deliberately. The portal's modules are drawn so that migration is contained: only the catalog and pricing module's storage would move (§4.2).

### 2.5 Candidate architectures compared

| Criterion | **A. Built portal and store on Azure** (recommended) | **B. Built portal on Azure, Business Central as the store** | **C. Power Pages portal on Dataverse** |
|---|---|---|---|
| Shape | One TypeScript application, one Azure SQL database, Microsoft sign-in and email services (§4) | As A for requests and quotes. Catalog, prices and discounts live in Business Central. An integration job keeps a search copy in the portal | A low-code reseller site (Power Pages) and an internal model-driven app on Dataverse |
| Delivers the approved backlog as written | **Yes, all 33 stories** | **No.** epic-01 and story-04-01 criteria need rewriting (§2.4) | **No.** BR-19's "cannot be deleted by any user" and BR-17's history cannot be guaranteed against administrators. The concurrency criteria (story-03-03 c2, story-05-05 c3) depend on platform behaviour we cannot verify in advance |
| Record integrity (BR-19, A-08) | Append-only ledger tables that even administrators cannot edit (ADR-04) | Requests and quotes as A. Price history in Business Central's change log, which can be deleted | Dataverse audit logs can be deleted by administrators |
| Indicative monthly cost (list prices) | **About US$540–710** in Azure (§10.3) | As A, plus about **US$240** in Business Central licences for 3 named users, plus a second partner | Power Pages authenticated users at **US$200 per 100 users per site per month**: 3,000 reseller users (§7.1), if all active, is about **US$6,000 a month**. Plus Power Apps licences for about 50 internal users |
| Who runs it | One support partner with Azure and TypeScript skills | Two partners (Azure/TypeScript and Business Central) | One Power Platform partner |
| Time to the first demo (epic-01) | **No setup outside the build:** demos run locally (C-13) | Business Central setup and item load first, then the integration. The longest | Fastest to a first screen |
| Future path to orders, invoicing, stock | Migrate the store to an ERP later (§2.4) | **Best.** Already on Business Central | Dynamics 365 Sales or Business Central later |
| Main risk | Bow owns bespoke code. Its quality depends on the build and the partner | Two systems to keep consistent. Search staleness. Backlog rework | Per-user licensing grows with every reseller onboarded. Platform limits on the guarantees Bow needs |

**Recommended: A.** It is the only candidate that meets the approved backlog as written (the FDE's condition for this revision), keeps the record uneditable, and needs one partner. B is the right answer to a question Bow has not asked yet, namely buying an ERP, and ADR-11 says when to ask it. C is quick to start but costly per reseller user, and weaker on the guarantees BR-19 and A-08 rest on.

## 3. Constraints

| # | Constraint | Source | What it forecloses | How the design respects it |
|---|---|---|---|---|
| C-01 | From go-live the catalog and pricing store is the only source of quote prices, and the Excel ERP is read-only | BRD NF-01, D-06 | Keeping the spreadsheet live, or syncing from it after go-live | One-off load (story-01-01), after which the store is maintained only through its own pages. Quote prices come only from the store (ADR-05) |
| C-02 | Bow's staff use Microsoft 365 | Answered by Yash Dixit (FDE), 2026-09-26 | A second workforce sign-in. Another cloud without a second vendor | Staff sign in with Microsoft 365, and hosting is Azure (ADR-02, ADR-03) |
| C-03 | Resellers are external companies with no shared identity system | BRD §4.1, story-02-01 | Federating each reseller's own directory. Self-registration | Invitation-only accounts in Entra External ID (ADR-03) |
| C-04 | No electronic exchange, no orders, **no stock**, no screening, no payments | BRD §4.2; the FDE's rework instruction, 2026-09-26 | Any outbound integration to a fulfilment, finance, stock or screening system | No outbound integration apart from email and sign-in |
| C-05 | **Bow has no IT operations team.** Managed services, and an external support partner in business hours. Bow has a Microsoft 365 administrator for one-off setup | Answered by Yash Dixit (FDE), 2026-09-26 | Self-hosted servers, container orchestration, a message broker, a search cluster, anything needing an on-call engineer at Bow | Only managed Azure services, one application, one database. Runbooks in §10 are written for the partner |
| C-06 | Request records may be US export records, kept five years and not deletable | BRD BR-19, A-08, D-10–D-12 | Soft-delete, purge jobs, editing a sent quote | Append-only ledger tables (ADR-04) |
| C-07 | Reseller discount terms are one number per reseller, signed before load | BRD A-07, NF-10 | A pricing rules engine | One standard discount per reseller with history (story-04-01) |
| C-08 | Volumes are not known | BRD NF-08 | Sizing to measured load | Sized against stated assumptions (§7.1) |
| C-09 | Which data protection law applies is not known | BRD NF-07 | Choosing the Azure region. A final answer on keeping names for five years | **(provisional)** Region = Bow's home geography, confirmed by Elon Musk before production is provisioned. Risk R-04 |
| C-10 | The Excel ERP has no named owner | BRD NF-03 | Running and signing the go-live load | Named as a prerequisite before epic-01's demo (`demo-topology.md`) |
| C-11 | Reseller accounts and discounts exist only in reps' spreadsheets and memory | BRD NF-04, NF-10 | Resellers signing in on day one without preparation | Entered through the resellers page. No bulk loader: counted first (§11, Q-05) |
| C-13 | **Demos and Epic Reviews run locally on the FDE's Mac**, with stand-ins for every external dependency. One command starts, one command resets. The only prerequisite is Node.js; no Docker, Azure or Microsoft 365 accounts | Elon Musk (EA), relayed by Yash Dixit (FDE), 2026-09-26. **Node 24 LTS, not the Node 20 the direction named**: Node 20 reached end-of-life on 30 April 2026, and the FDE chose Node 24 on 2026-09-26 to match production. Elon Musk to confirm | Depending on any cloud service, container runtime or tenant before an Epic Review | Adapters with local stand-ins (§4.7, ADR-13). Azure is Stage 2 |
| C-12 | **The approved backlog is delivered as written.** No change requests in this revision | The FDE's rework instruction, 2026-09-26 | Any candidate or product that needs story criteria rewritten | Candidate A (§2.5). Business Central recorded as considered (ADR-11) |

## 4. Components

### 4.1 Containers (C4 level 2)

```
 Reseller browser                               Bow staff browser
       │ HTTPS (same origin)                          │ HTTPS (same origin)
       ▼                                              ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────┐
 │ Bow Reseller Portal                                                                   │
 │                                                                                       │
 │  ┌─────────────────────────────────┐  JSON over HTTPS,  ┌──────────────────────────┐  │
 │  │ Browser application             │  session cookie +  │ Portal server            │  │
 │  │ [React 19, TypeScript]          │  anti-forgery token│ [NestJS 11 on Node.js 24]│  │
 │  │ Reseller screens · Internal     │ ─────────────────▶ │ Access · Catalog and     │  │
 │  │ sales screens · Store screens   │                    │ pricing · Quote workflow │  │
 │  │ (static files served by the     │ ◀───────────────── │ · Notifications modules; │  │
 │  │  portal server)                 │                    │ serves the browser app   │  │
 │  └─────────────────────────────────┘                    └──────┬─────────┬────────┬┘  │
 │                                                                 │ SQL     │ worker │   │
 │                                        ┌────────────────────────▼──┐  ┌───▼──────────┐│ │
 │                                        │ Portal database           │  │ Email worker ││ │
 │                                        │ [Azure SQL Database]      │◀─│ [same Node   ││ │
 │                                        │ store, requests, quotes,  │  │ process]     ││ │
 │                                        │ ledger tables, outbox,    │  └───┬──────────┘│ │
 │                                        │ sessions                  │      │           │ │
 │                                        └───────────────────────────┘      │           │ │
 └───────────────────────────────────────────────────────────────────────────┼───────────┼─┘
            OpenID Connect (server side only)                                  │           │
     ┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────▼────────┐  │
     │ Entra External ID        │   │ Entra ID (Bow tenant)    │   │ Communication     │  │
     │ (resellers)              │   │ (staff)                  │   │ Services Email    │  │
     └──────────────────────────┘   └──────────────────────────┘   └───────────────────┘  │
     ┌──────────────────────────┐   ┌──────────────────────────┐                          │
     │ Key Vault (configuration │   │ Application Insights     │ ◀────── telemetry ───────┘
     │ secrets, if any)         │   │ (logs, alerts, uptime)   │
     └──────────────────────────┘   └──────────────────────────┘
```

| Container | Technology | Responsibility | Traces to |
|---|---|---|---|
| Browser application | React 19, TypeScript, Fluent UI | All screens for both audiences. It holds no authority: every decision is made on the server | All stories' screens |
| Portal server | NestJS 11 on Node.js 24 LTS | The private programming interface, sign-in, authorisation on every call, the four modules; serves the browser application | All BRs |
| Email worker | A background loop inside the portal server process | Sends outbox rows, retries, marks failures (ADR-07) | BR-07, BR-13, BR-14 |
| Portal database | Azure SQL Database | Every record, including the store (ADR-04, ADR-11) | BR-06, BR-17–BR-20, and more |
| Entra External ID / Entra ID | Microsoft managed | Sign-in only (ADR-03) | BR-01–BR-03 |
| Communication Services Email | Microsoft managed | Delivery of email from Bow's domain | BR-07, BR-13 |
| Key Vault, Application Insights | Microsoft managed | Configuration secrets; telemetry, alerts and availability tests | N-04, N-05 |

### 4.2 Components inside the portal server

The server is organised as four modules that share one database. They are code boundaries, not separate services. Each owns its own tables, and another module reaches them only through that module's code, never by querying its tables. A global guard refuses every call unless the route declares who may make it, so a route added without a rule is closed, not open.

| Component | Responsibility | Owned by | Notes |
|---|---|---|---|
| **Access module** | Resellers, reseller users, invitations, deactivation; internal users; the named-user lists (price maintainers, discount setters, internal admins, role managers); authorisation on every call; refused-attempt records | Built by the delivery team; run by the support partner | Holds the rule "which reseller does this session belong to" once, for every other module (ADR-03) |
| **Catalog and pricing module** | Products, open or closed for quoting, prices and price history, standard discounts and discount history, full-text search, the one-off ERP load | As above | System of record for part data and price from go-live (§2.3). If Bow later adopts an ERP (ADR-11), this is the only module whose storage moves |
| **Quote workflow module** | Requests and lines, request IDs, received time, how it arrived, owner, status; draft quotes; sent quote versions and lines; responses; flags | As above | All status changes go through one guarded transition function (ADR-08) |
| **Notifications module** | Writes each email to the outbox in the same transaction as its event; the email worker sends it; the failed emails list | As above | ADR-07 |
| **Reseller screens** | Product search, quote request, My requests, the quote with approve / change / decline, Users (reseller admin) | As above | Browser routes under `/` |
| **Internal sales screens** | Open requests list, enter request, request page (take, hand over, reassign), quote builder, resellers page with standard discounts, named users, failed emails list, refused attempts list | As above | Browser routes under `/sales`; interface routes under `/api/sales`, open to internal sessions only |
| **Catalog and pricing store screens** | Load summary, product page, add product, change price, price history, close for quoting | As above | Under `/sales/store`; changes require the price maintainer role |

**Not built.** Nothing sends data to a fulfilment, finance, screening or stock system. The server's programming interface is private to the portal's own browser application. It accepts calls only from the portal's own address, with the portal's session cookie, and is not offered to resellers' systems (BRD §4.2). There is no reseller self-registration, and no bulk import of resellers or discounts (Q-05).

### 4.3 Technology stack

Each row gives the major version line current at the time of writing (September 2026). The build team pins exact versions in the first commit and records them in the repository's lock file. A new minor version is routine; a new major version of any row marked ★ is an architecture change and comes back to the architect.

| Layer | Choice | Version line | Why this, here |
|---|---|---|---|
| Language | TypeScript, strict mode | 5.9 or the current release at first commit | The FDE's decision (ADR-10). One language for browser and server; shared validation schemas |
| ★ Server runtime | Node.js LTS | 24 (Active LTS), **locally and in Azure** | Supported until April 2028, and the same runtime on the Mac as in production (C-13). Node 20 is end-of-life |
| ★ Server framework | NestJS on the Fastify adapter | NestJS 11, Fastify 5 | Modules, dependency injection and route guards map directly onto the four modules and the default-deny guard (§4.2) |
| ★ Browser framework | React | 19 | Most widely supported browser framework, so any support partner can maintain it |
| Browser build | Vite | 7 | Standard build tool for React |
| Browser routing | React Router | 7 | |
| Components | Fluent UI React | v9 | Microsoft's own component set: accessible by default and familiar to Microsoft 365 users |
| Server state in the browser | TanStack Query | 5 | Caching and the 30-second refresh of the open requests list (N-03) |
| Validation | Zod | 4 | One schema checks input in the browser and again on the server |
| ★ Database (Stage 2) | Azure SQL Database, vCore **General Purpose, serverless** (0.5–2 vCores; auto-pause off in production, on in test), compatibility level 160 | — | The tier Microsoft documents ledger with (ADR-04); full-text search (ADR-09). Decided by Yash Dixit (FDE), 2026-09-26, over the cheaper DTU Standard S2, on which ledger support could not be confirmed |
| ★ Database (Stage 1, local) | SQLite through `better-sqlite3`, with FTS5 full-text search; a single file under `.local/` | better-sqlite3 12 | Installed by npm alone, with prebuilt binaries for macOS on Node 24. The same Kysely queries run on both databases (§5.6) |
| Database access | Kysely query builder: SQL Server dialect with the `tedious` driver (Stage 2), SQLite dialect (Stage 1) | Kysely 0.28, tedious 19 | Typed SQL with nothing hidden. Ledger tables and column grants are hand-written SQL migrations, which an object-relational mapper would fight |
| Database sign-in | Managed identity (Entra authentication to Azure SQL) | — | No database password exists to leak or expire |
| Sign-in | Microsoft Authentication Library for Node (`@azure/msal-node`) | 3 | Server-side OpenID Connect for both Entra ID and External ID |
| Sessions | Server-held sessions in the database; cookie is `HttpOnly`, `Secure`, `SameSite=Strict`; anti-forgery token on every changing call | Fastify session and anti-forgery plugins, current major | T-04, T-21, N-08, N-11 |
| Email | `@azure/communication-email` with `@azure/identity` (managed identity) | 1, 4 | No SMTP password to expire (ADR-07 revised) |
| Telemetry | Azure Monitor OpenTelemetry distro (`@azure/monitor-opentelemetry`) | 1 | Logs, traces and metrics to Application Insights |
| Unit and integration tests | Vitest. Locally against SQLite. In CI, **also** against SQL Server 2022 with full-text search, in a container on the CI runner (never on the Mac) | Vitest 3, Testcontainers 11 | The same database contract tests run on both engines (§5.6) |
| End-to-end tests | Playwright | 1.5x | Runs each Epic's demo path in Edge, Chrome, Safari (WebKit) and Firefox (N-14) |
| Load tests | Grafana k6 | 1 | N-01, N-02, N-10 |
| Infrastructure as code | Bicep, deployed by Azure CLI | Azure CLI 2.x, current Bicep | Microsoft's own language. Every Azure resource is in the repository (ADR-12) |
| CI/CD | GitHub Actions, with federated sign-in to Azure (no stored Azure secrets) | — | ADR-12 |
| Package manager | npm workspaces (`apps/web`, `apps/server`, `packages/shared`) | npm 11 (ships with Node 24) | Nothing to install beyond Node (C-13) |
| Spreadsheet reading and the sample file | ExcelJS | 4 | Reads the ERP spreadsheet in the load (story-01-01), and generates the synthetic sample price list (§4.8) |
| Local mail viewer | Built into the portal as a development-only page (`/dev/mailbox`) | — | No separate mail program to install (§4.7) |

### 4.4 Deployment (C4 deployment view), Stage 2

Stage 1 has no deployment: it is one Node process and one database file on the FDE's Mac (§4.7). The view below is Stage 2.

```
 Microsoft Azure — Bow's subscription — region: Bow's home geography (provisional, C-09)
 ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
 │ Resource group rg-portal-prod                                                                │
 │  ┌───────────────────────────────────────────────┐    ┌────────────────────────────────────┐ │
 │  │ App Service plan P0v3 Linux, 2 instances      │    │ Azure SQL logical server           │ │
 │  │  ┌──────────────────────────┐ ┌─────────────┐ │    │  └ database portal (GP serverless)  │ │
 │  │  │ Web app: portal          │ │ slot:       │ │───▶│    ledger tables, full-text index, │ │
 │  │  │ (Node 24: server +       │ │ staging     │ │    │    PITR 35 days, geo-redundant     │ │
 │  │  │  browser app + worker)   │ │ (pre-swap)  │ │    │    backups, monthly long-term      │ │
 │  │  │ managed identity         │ └─────────────┘ │    │    backups kept 12 months          │ │
 │  │  └──────────────────────────┘                 │    └────────────────────────────────────┘ │
 │  └───────────────────────────────────────────────┘    ┌────────────────────────────────────┐ │
 │  ┌──────────────────────┐ ┌─────────────────────────┐  │ Storage account (immutable blob):  │ │
 │  │ Communication        │ │ Key Vault               │  │ ledger digests (ADR-04)            │ │
 │  │ Services + Email     │ │ Application Insights +  │  └────────────────────────────────────┘ │
 │  │ (Bow domain)         │ │ Log Analytics workspace │                                         │
 │  └──────────────────────┘ └─────────────────────────┘                                         │
 ├──────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Resource group rg-portal-test — same shape, smaller: App Service B1 (1 instance, no slot),    │
 │ Azure SQL GP serverless (auto-pause), its own Communication Services test domain, Key Vault │
 └──────────────────────────────────────────────────────────────────────────────────────────────┘
 Microsoft cloud, outside the subscription: Bow's Entra ID tenant (staff); the portal's External ID
 tenant (resellers; one for production, one for test)
```

Two production instances sit behind App Service's built-in load balancer. Losing one does not stop the portal. A deployment goes to the staging slot first and is swapped in, so a bad release is swapped back in minutes (§7.3).

### 4.5 Environments

| Environment | Where | Data | Sign-in | Email | Who uses it |
|---|---|---|---|---|---|
| **Local (Stage 1)**: development, demos and Epic Reviews | The FDE's Mac or a developer's machine. `./scripts/dev.sh` starts everything; `./scripts/reset.sh` restores seed data. Node 24 only | Fictional seed data and the synthetic price list (§4.8). The real ERP copy is used **only** for the definition-of-done runs of story-01-01 and story-02-02, on the FDE's Mac, and deleted afterwards (Q-11) | Local development sign-in: pick a seeded user (§4.7) | Captured in the local database, read at `/dev/mailbox`; nothing leaves the machine | FDE, build team, Epic Reviews |
| **Continuous integration** | GitHub Actions runners, with a disposable SQL Server container per run (the runner's, not the Mac's) | Seed data | Local development sign-in | Captured | The pipeline |
| **Test (Stage 2)** | Azure, `rg-portal-test` | The real ERP, loaded by the Stage 2 rehearsal of the go-live load; demo resellers | Test External ID tenant; Bow test staff accounts | Real sending, to Bow test mailboxes only (the test domain is not allowed to reach other domains) | Stage 2 integration checks, QA of the real adapters, the load test (N-01), the restore drill. **Not** the Epic Reviews |
| **Production (Stage 2)** | Azure, `rg-portal-prod` | Real | Production External ID tenant; Bow's Entra ID | Real | Resellers and Bow |

There is no separate staging environment. The production staging slot, with production configuration, is where each release is smoke-tested before the swap.

### 4.6 CI/CD

1. **On every pull request.** Type-check, lint, unit tests, integration tests against SQL Server (ledger, full-text, concurrency N-10), a production build of the browser app, dependency audit, and code scanning (CodeQL). A pull request cannot merge with any of these failing, or without one reviewer's approval.
2. **On merge to main.** The deployable is built **once** and stored as the release artifact. It is deployed to **test**. Database migrations run as their own step under a separate migration identity: the only identity allowed to change table structure. Then Playwright end-to-end tests run against test.
3. **To production**, after a named person approves in GitHub (the FDE during delivery; the support partner's lead after handover):
   - the same artifact is deployed to the **staging slot**;
   - migrations run;
   - smoke tests run against the slot;
   - the slot is **swapped** into production.
4. **Migrations only ever add.** A column or table is added in one release and old ones retired in a later one, so the release before a swap still works against the migrated database. The ledger tables forbid destructive changes anyway (ADR-04).
5. **Infrastructure changes** (Bicep) go through the same pull request, review and approval, and are deployed by the pipeline. Nobody changes Azure resources by hand in production.
6. **Secrets.** The pipeline signs in to Azure by federated identity, with no stored password. The application reaches the database, Key Vault and email with its managed identity. **No long-lived secret exists** in the design, apart from the External ID application credential (§10.4, runbook 4).

### 4.7 Adapters and local stand-ins (Stage 1)

Every dependency outside the portal's own code sits behind an interface (an **adapter**). Each has a local stand-in and a real implementation, chosen by configuration at start-up (ADR-13). The portal's modules call only the interface. They never know which implementation is behind it, so the code a demo exercises is the code production runs, apart from the adapter itself.

| Adapter | Interface (what the modules ask for) | Local stand-in (Stage 1) | Real implementation (Stage 2) | What the stand-in cannot show |
|---|---|---|---|---|
| **Staff sign-in** | Start sign-in; complete sign-in, returning subject id, name, email and audience `staff` | **Development sign-in page** (`/dev/sign-in`) listing the seeded staff: rep Sam, rep Alex, rep Pat (named price maintainer), rep Lee (named discount setter), internal admin Jo, role manager Morgan, and Chris, a Bow employee not on the internal users list. Picking one completes sign-in with the same claims shape Entra ID returns | Entra ID through `@azure/msal-node` | Bow's Microsoft 365 policies (multi-factor sign-in, lockout, leavers disabled) |
| **Reseller sign-in and invitations** | Invite (email, name); start sign-in; complete sign-in, returning subject id, email and audience `reseller` | The same development page, listing seeded reseller users. An invitation is an email in the local mailbox whose link completes enrolment for that user | Entra External ID (invitation and sign-up through its administrative interface; sign-in through MSAL) | External ID's lockout (T-20), one-time codes, invitation expiry enforced by Microsoft (T-11). The portal's own 7-day single-use check runs in both |
| **Database** | Kysely database handle; migrations; search function | SQLite file `.local/portal.db`, FTS5 search | Azure SQL Database with managed identity | Ledger immunity against administrators, true simultaneous writers, SQL Server full-text ranking (§5.6) |
| **Email** | Send (to, subject, body) → accepted, or refused with a reason | Writes to a captured-mail table, readable at **`/dev/mailbox`** with a recipient filter. A switch on that page (**Refuse sending**) makes every send refused, for epic-02 step 10 and N-04 | Communication Services Email SDK with managed identity | Real delivery, spam placement (T-18) |
| **Clock** | Now (UTC); Bow's business "today" | System clock plus an offset, which the seed script and the `/dev` page can move forward. Used to create "yesterday's" quote for the epic-05 expiry demo and to test story-05-04 | System clock; offset forbidden | — |
| **Telemetry** | Log, trace, metric | Readable logs in the terminal | Azure Monitor OpenTelemetry | Alerts, availability tests (N-05) |
| **Configuration and secrets** | Named settings | `.env.local`, generated by `dev.sh`, holding no real secrets | App Service settings and Key Vault references | — |

**The start-up guard.** The development stand-ins are dangerous only if they run where real people can reach them. Following two practice lessons on configuration guards (voltway-returns-portal and voltway-warranty-claims, 2026-09-23), the guard refuses the **present-but-wrong** configuration, not just the missing one. The portal refuses to start if:
- any local stand-in is selected while the portal's public address is anything other than `localhost` or `127.0.0.1`; or
- the runtime mode is `production` with any local stand-in selected; or
- the configuration mixes real sign-in with the local database, or the local sign-in with the real database.

The one mixed configuration Stage 2 needs (real database, local email) must be named explicitly as a profile, never assembled by accident. The `/dev` pages do not exist in a production build at all; they are left out when it is built, not just hidden. **QA:** start the portal once with each bad configuration listed; each refuses to start with a message naming the setting. Then request `/dev/sign-in` from a production build; not found.

**The two commands.**
- `./scripts/dev.sh` checks that Node 24 is present and stops with an instruction if not. It installs dependencies on first run (`npm ci`), creates `.local/` and `.env.local` if absent, migrates and seeds an empty database, and starts the server with the browser application on `http://localhost:3000`. Both entrances, the mailbox and the development sign-in are on that one port.
- `./scripts/reset.sh` deletes `.local/portal.db` and re-runs the migrations and seed, so every Epic Review starts from the same known state. It never touches anything outside `.local/`.

### 4.8 Seed data and the synthetic price list

All seed data is **fictional**. No real Bow product, price, reseller or person appears in the repository (§5.4). The seed is code in the repository and is reviewed like code.

| Seeded | Content | Why |
|---|---|---|
| **Sample ERP spreadsheet** `seed/sample-erp.xlsx` | Generated by `npm run seed:sample-erp` with ExcelJS: **about 2,000 rows** of fictional electronic parts with realistic shapes. Examples: ceramic capacitors (`BWE-C0402X7R104K`, "Capacitor, ceramic, 0.1 µF, 16 V, X7R, 0402"), resistors, inductors, diodes, MOSFETs, voltage regulators, microcontrollers, connectors, crystals. The `BWE-` prefix marks every part as invented. Prices are plain numbers from 0.0040 to 180.00. The same columns as the ERP (part number, description, price) | epic-01 demo on real-looking data without Bow's price list |
| **Deliberately bad rows** in the same file | One row with no part number; one with a blank price; one each with `$12`, `1,234.50` and `#REF!` as the price; one with a formula; two rows sharing a part number with different prices | story-01-01 c3–c5 and T-14 are demonstrated, not described |
| **Large catalog for performance** | `npm run seed:catalog -- 250000` generates a 250,000-product synthetic catalog for local and Stage 2 load tests (N-01). It is not part of the default seed | N-01 |
| **The store** | Empty after `reset.sh`. The epic-01 demo loads the sample spreadsheet through the real load (story-01-01). `reset.sh --after-epic 01` seeds the store already loaded, for later Epics | Never demo against an empty store (backlog epic-01 demo-notes) |
| **Staff** | Rep Sam and rep Alex (no roles); rep Pat, named price maintainer (removed during the epic-01 demo, story-01-05); rep Lee, named discount setter (story-01-05 c3); internal admin Jo; role manager Morgan (stands in for Jensen Huang, who names users in production); Chris, a Bow employee not on the internal users list (T-05) | The names and roles the backlog's demo-notes use |
| **Resellers and users** | Demo Reseller A: an admin and two buyers. Demo Reseller B: one user. Resellers C, D and E: an admin each | backlog epic-02, epic-05 and epic-06 demo-notes |
| **Signed standard discounts** | Resellers C 10 %, D 12.5 %, E 8 %, each recorded as set by rep Lee with a discount-change history line. **A and B have none**, because epic-04's demo sets A's discount from none and shows B's No standard discount flag | story-04-01, story-04-04; NF-10 in miniature |
| **Requests and quotes** | None by default. `reset.sh --after-epic NN` seeds the state each later Epic's demo assumes, using the portal's own operations with the clock adapter, including epic-05's quote sent "yesterday" and valid until yesterday | Each Epic Review can start from a known state |

## 5. Data

### 5.1 Data model

```
 reseller 1───* reseller_user              internal_user 1───* role_assignment
    │ 1                │ 1                       │ 1
    │                  │ requester               │ owner / built_by / entered_by
    *                  *                         *
 request *───────────────────────────────────────┘      product 1───* price_change
  │ 1  │ 1  │ 1                                           │ 1
  │    │    └───* ownership_change                        │
  │    └───* request_line *───────────────────────────────┘
  │ 1
  ├───0..1 draft_quote 1───* draft_line
  └───* quote_version 1───* quote_line *──── product
            │ 1
            └───0..1 response

 reseller 1───0..1 standard_discount 1───* discount_change
 email_outbox *──── request (0..1)        refused_attempt *──── (reseller_user | internal_user)
 erp_load_run 1───* erp_load_rejected_row
```

"Ledger (append-only)" means the database accepts new rows and refuses every update and delete, including from administrators. "Ledger (updatable)" means rows can change, but the database keeps every earlier version automatically (ADR-04).

| Entity | Key | Main columns | Kind | Module |
|---|---|---|---|---|
| product | `product_id` | `part_number` (unique, case-insensitive), `description`, `price` integer, in ten-thousandths of the currency unit, `open_for_quoting` | Ledger (updatable) | Catalog and pricing |
| product_search | `product_id` | `part_number`, `description` (full-text indexed), `open_for_quoting` | **Ordinary table**, written in the same transaction as every `product` change. It exists because SQL Server does not allow full-text indexes on ledger tables (Microsoft, *Ledger considerations and limitations*). It is a search index, never read for a price. A contract test checks that it matches `product` after every store operation | Catalog and pricing |
| price_change | `price_change_id` | `product_id`, `old_price`, `new_price`, `changed_by`, `changed_at` | Ledger (append-only) | Catalog and pricing |
| erp_load_run | `load_run_id` | `file_name`, `rows_read`, `rows_loaded`, `complete`, `run_by`, `run_at` | Ledger (append-only) | Catalog and pricing |
| erp_load_rejected_row | `load_run_id`, `row_number` | `raw_part_number`, `raw_price`, `reason` | Ledger (append-only) | Catalog and pricing |
| standard_discount | `reseller_id` | `percent_hundredths` integer 0–10,000 (12.5 % is 1,250), or none | Ledger (updatable) | Catalog and pricing |
| discount_change | `discount_change_id` | `reseller_id`, `old_percent` (nullable), `new_percent`, `changed_by`, `changed_at` | Ledger (append-only) | Catalog and pricing |
| reseller | `reseller_id` | `name` | Ledger (updatable) | Access |
| reseller_user | `reseller_user_id` | `reseller_id`, `name`, `email` (unique across all resellers), `is_admin`, `is_active`, `external_id_object_id` | Ledger (updatable) | Access |
| internal_user | `internal_user_id` | `name`, `entra_object_id` (unique), `is_active` | Ledger (updatable) | Access |
| role_assignment | `internal_user_id`, `role` | `role` ∈ {price maintainer, discount setter, internal admin, role manager}, `granted_by`, `granted_at`, `revoked_by`, `revoked_at` | Ledger (updatable) | Access |
| refused_attempt | `refused_attempt_id` | `user_kind`, `user_id`, `action`, `at` | Ledger (append-only) | Access |
| request | `request_id` (internal) | `request_code` (e.g. `Q-7K3M-9TPX`, unique), `reseller_id`, `requester_id`, `received_at` (set by the database), `arrived_by` ∈ {Portal, Phone, Email}, `entered_by`, `status`, `owner_id`, `current_version_id`, `submission_key` (unique) | Ledger (updatable). `request_code`, `reseller_id`, `received_at` and `arrived_by` cannot be updated (§5.3) | Quote workflow |
| request_line | `request_id`, `line_no` | `product_id`, `quantity` (whole number > 0) | Ledger (append-only) | Quote workflow |
| ownership_change | `ownership_change_id` | `request_id`, `old_owner`, `new_owner`, `kind` ∈ {take, hand over, reassign}, `by`, `at` | Ledger (append-only) | Quote workflow |
| draft_quote, draft_line | `request_id`; `request_id`, `line_no` | Copied `store_price`, copied `standard_percent` (or none), `copied_at`, `discount_percent`, `reason`, `valid_until` | Ordinary tables, deleted on send. A draft is not a record | Quote workflow |
| quote_version | `quote_version_id` | `request_id`, `version_no` (unique per request), `built_by`, `sent_at`, `valid_until` (date), `currency` | Ledger (append-only) | Quote workflow |
| quote_line | `quote_version_id`, `line_no` | `product_id`, `quantity`, `store_price`, `standard_percent` or "none on file", `discount_percent`, `net_price_each`, `line_total`, `reason` | Ledger (append-only) | Quote workflow |
| response | `quote_version_id` (unique) | `kind` ∈ {approve, change requested, decline}, `by`, `at`, `comment` | Ledger (append-only); at most one per version | Quote workflow |
| email_outbox | `email_id` | `kind`, `request_id`, `recipient`, `created_at`, `attempts`, `sent_at`, `failed_at`, `refusal_reason` | Ledger (updatable) | Notifications |
| session | `session_id` | `user_kind`, `user_id`, `created_at`, `last_seen_at` | Ordinary table, expired sessions deleted | Access |

### 5.2 Rules that live in the data, not only in the screens

- **Money.**
  - Prices are held as whole numbers of ten-thousandths of the currency unit, and percentages as whole numbers of hundredths of a percent, in **both** databases. SQLite has no exact decimal type, and storing money as a floating-point number would round differently on the Mac and in Azure. Net prices and line totals are calculated in whole numbers and rounded to 2 decimal places, half away from zero. The rounding rule is **(provisional)**, to be agreed with Jensen Huang, including story-04-02's 9.99-at-12 % case.
  - There is one currency (backlog assumption). The currency code is still stored on every quote version.
- **Time.**
  - Every timestamp is stored in UTC.
  - Screens show Bow's business time zone: Bow's head-office time zone (decided by Yash Dixit, FDE, 2026-09-26; Elon Musk confirms which zone).
  - **Today**, for valid-until and expiry, is the calendar date there. A quote is valid to the end of its valid-until date.
- **Received time** is set by the database when the request is recorded, for every path including a rep's entry (BR-06, BR-15). For a request that arrived by phone or email, this is the time it was **entered**.
  - On go-live day, reps re-enter the open Excel requests in their original arrival order **before resellers are given access** (§10.4 runbook 6), so oldest-first still holds (decided by Yash Dixit, FDE, 2026-09-26).
  - The cost: for those requests, the Waiting column counts from go-live.
- **A request belongs to exactly one reseller**, copied from the requester when it is recorded. It never changes.

### 5.3 Guarantees the database enforces

The application's database identity **cannot**:
- update or delete any append-only ledger row;
- update a request's `request_code`, `received_at`, `reseller_id` or `arrived_by`. The column grants exclude them;
- record a second response for a quote version (unique key);
- give a request a second owner ("take" is one conditional update that succeeds only when `owner_id` is empty, ADR-08);
- store two reseller users with the same email (unique key);
- record the same submission twice (unique `submission_key`, T-12);
- change table structure. Only the pipeline's migration identity can (§4.6).

These hold whatever a screen or a direct call tries, which is what the "directly" criteria in the backlog test (story-01-04 c5, story-02-03 c4, story-05-01 c7, story-05-07 c3). Locally the same rules are enforced by the SQLite equivalents in §5.6.

### 5.4 Data classes: who may read and change each

| Class | Examples | Who may read | Who may change | Kept |
|---|---|---|---|---|
| Store prices (commercially sensitive) | product price, price history | Internal users. A reseller sees a price only on its own sent quotes (A-03) | Price maintainers only | Indefinitely (ledger) |
| Standard discounts (commercially sensitive, per reseller) | Reseller A's 12 % | Internal users. Never any reseller user, including the reseller it belongs to (story-04-01 c4) | Discount setters only | Indefinitely |
| A reseller's requests and quotes (commercially sensitive, per reseller) | lines, quantities, net prices, reasons | That reseller's active users; internal users | Created by that reseller's users or by reps; never edited once recorded or sent | At least 5 years after closing (BR-19); in practice never deleted |
| Reseller users' personal data | name, email | That reseller's users; internal users | That reseller's admins; reps (add users) | As long as their requests are kept (R-04) |
| Staff personal data | name, Entra ID object id | Internal users | Role managers | Indefinitely |
| Records of control | refused attempts, ownership changes, role assignments, ERP load runs | Internal admins (refused attempts); internal users (the rest) | Nobody (append-only), or role managers (role assignments) | Indefinitely |
| Credentials | passwords, one-time codes | Nobody at Bow; held by Microsoft's sign-in services | The user | Microsoft's policy |
| Secrets | the External ID application credential | The running application (via Key Vault) | Support partner | Rotated before expiry (§10.4) |

### 5.5 The request-to-quote sequence

```
 Buyer        Browser app      Portal server              Portal DB            Email worker   Comms Services   Rep
   │ submit       │                  │                         │                      │               │          │
   │─────────────▶│ POST /api/requests (lines, submission_key, anti-forgery token)    │               │          │
   │              │─────────────────▶│ 1 session → reseller; validate lines          │               │          │
   │              │                  │ 2 draw request_code ───▶│ BEGIN                │               │          │
   │              │                  │   insert request + lines + outbox row ───────▶│ COMMIT (received_at set)  │
   │              │◀── code, received time ─│                   │                      │               │          │
   │◀─ confirmation page                    │                   │◀── poll every 30 s ──│               │          │
   │              │                  │                         │  pending row ───────▶│ send (managed │          │
   │◀──────────────────────────────── confirmation email ──────────────────────────────── identity) ───│          │
   │              │                  │                         │◀── mark sent ────────│               │          │
   │              │                  │◀── open requests list refresh (every 30 s) ─────────────────────────────── │
   │              │                  │ 3 take: UPDATE … WHERE owner_id IS NULL ─▶│ one wins; status Being quoted   │
   │              │                  │ 4 start quote: copy store price + standard discount into draft ◀────────── │
   │              │                  │ 5 send: ignore any price from the browser; BEGIN                          │
   │              │                  │   insert quote_version + lines (append-only), status Quote sent,          │
   │              │                  │   delete draft, outbox "quote ready" ───────▶│ COMMIT                      │
   │◀──────────────────────────────── quote ready email (no prices) ─────────────────────────────────────────────│
   │ open quote, approve ─────────────▶│ 6 check: current version, Quote sent, not expired (Bow's today)          │
   │              │                  │   insert response (unique per version) + status Approved + outbox ──▶│ COMMIT  │
   │              │                  │                         │                      │── "approved" email ────▶│
```

In words:
1. The server takes the reseller from the **session**, never from the request, and validates every line. A refused request draws no ID (story-02-04 c4).
2. One transaction records the request, its lines and the confirmation email row, and the database sets the received time. The buyer sees the code at once (story-02-03 c1). The worker sends the email within minutes (N-04).
3. The request is in the reps' list at once. A list already open refreshes within 30 seconds (N-03). "Take" is a single conditional update, so exactly one rep wins (N-10).
4. Starting the quote copies prices and the standard discount into a draft (ADR-05).
5. Sending writes an append-only version and queues the "quote ready" email in one transaction. Any price sent from the browser is ignored (T-09).
6. The reseller's response is checked and recorded in one transaction. The unique key on the response makes a second answer impossible (story-05-05 c3). Expired is worked out in the same check (ADR-08).

Change requests follow step 6 with kind "change requested", setting status Change requested. The rep then repeats steps 4–5 as version 2, and version 1 is kept (story-05-02).

### 5.6 The local database: where it differs from Azure SQL, and how the rules are still tested

Stage 1 runs on SQLite (ADR-13). The portal's modules use the same Kysely queries on both databases. Where the two engines genuinely differ, the difference is written in the migration for each database, and one set of **database contract tests** runs against both: SQLite on every developer run, SQL Server 2022 in CI on every pull request. A rule that passes on the Mac but fails on SQL Server fails the pull request. It is not found in Stage 2.

| Rule or feature | Azure SQL (Stage 2) | SQLite (Stage 1) | What the local version proves | What only Azure SQL proves, and where it is tested |
|---|---|---|---|---|
| Append-only records (ADR-04, N-07) | Ledger tables: update and delete refused by the engine, for everyone including administrators; digests to immutable storage | A `BEFORE UPDATE` and a `BEFORE DELETE` trigger on each append-only table that aborts with an error | The application never updates or deletes these rows, and a direct attempt through the portal is refused (story-05-07 c3) | That an administrator cannot either (T-16). Tested in CI on SQL Server with a privileged account, and in Stage 2 with a ledger verification run |
| Columns a request never changes (request code, received time, reseller, how it arrived) | Column-level update grants withheld from the application identity | A `BEFORE UPDATE OF` trigger that aborts if any of those columns changes | The same refusal the portal sees (story-02-03 c4) | The grant itself. Tested in CI on SQL Server |
| Updatable history (product, request, user) | Updatable ledger tables keep every prior version automatically | A trigger copies the old row into a `*_history` table before each update | History exists for every change | Tamper evidence. Tested in Stage 2 |
| Received time set by the database | `DEFAULT SYSUTCDATETIME()` | `DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))` | The browser cannot supply it | — |
| Money and percentages | `bigint` and `int` | `INTEGER` | Identical arithmetic (§5.2) | — |
| Full-text search (ADR-09) | SQL Server full-text index on `product_search` (ledger tables cannot carry one), with `CONTAINS` given plain words only | FTS5 virtual table, with the query built from plain words, each quoted | Search by part number and description word, closed products excluded, hostile input harmless (T-13) | Ranking order and word-breaking differ. N-01 speed is proved only in Stage 2. Search contract tests check **which** products are returned, never their order |
| One owner, one response (N-10) | Conditional update and unique key, under genuinely simultaneous connections | The same conditional update and unique key. SQLite lets only one writer in at a time, so the race is serialised, not simultaneous | The logic: exactly one take and one response win | True concurrency. The N-10 test runs 20 parallel connections × 100 runs against SQL Server in CI |
| Managed-identity sign-in, geo-redundant backups, restore | Present | Not applicable: a single file | — | Stage 2 (§7.3 drill) |

## 6. Decisions

The full records, with rejected alternatives, costs and revisit conditions, are in `decisions.md`.

| # | Decision | Status |
|---|---|---|
| ADR-01 | Candidate A: one web application with four modules and one database, built for Bow, over candidates B and C | Proposed (revised for revision 2) |
| ADR-02 | Hosted on Azure managed services: App Service P0v3 ×2, Azure SQL General Purpose serverless, Communication Services, Key Vault, Application Insights; region per NF-07 | Proposed; region provisional |
| ADR-03 | Staff sign in with Bow's Microsoft 365 accounts; resellers with invitation-only Entra External ID accounts; who may do what is decided in the application | Proposed |
| ADR-04 | Records that must never change are append-only ledger tables | Proposed |
| ADR-05 | A quote copies the store price and standard discount when the rep starts it; sent quotes are immutable versions | Proposed |
| ADR-06 | Request IDs are random 8-character codes, not a counter | Proposed |
| ADR-07 | Emails go through an outbox table and a background worker to Communication Services, **signed in with the application's managed identity** | Proposed (revised for revision 2) |
| ADR-08 | One stored status per request, changed only by guarded transitions; Expired is worked out when read | Proposed |
| ADR-09 | Product search uses the database's own full-text index | Proposed |
| ADR-10 | TypeScript: React browser application and NestJS server on Node.js, one address, server-held session | Proposed; the language chosen by the FDE |
| ADR-11 | The catalog and pricing store is built in the portal's database; Business Central is recorded as the future path, not adopted | Proposed (new) |
| ADR-12 | GitHub Actions and Bicep, one artifact promoted from test to production through a staging slot; contract tests on both databases | Proposed (new) |
| ADR-13 | Every external dependency sits behind an adapter with a local stand-in and a real implementation, chosen by configuration; Stage 1 runs entirely on the FDE's Mac | Proposed (new, at the EA's direction) |

## 7. Non-functional targets

### 7.1 Sizing assumptions (NF-08 not yet counted)

Designed and load-tested for: **500 resellers, 3,000 reseller users, 50 internal users, 1,000 requests a day at peak, 20 lines per request on average, 250,000 products.** These are the architect's assumptions, not Bow's figures. Jensen Huang's counts replace them when they arrive. If any real figure is more than twice the assumption, ADR-01, ADR-02 (database tier) and ADR-09 are revisited.

### 7.2 Targets

| # | Attribute | Target | How it will be verified | Source |
|---|---|---|---|---|
| N-01 | Product search response | 95 % of searches return in ≤ 1.0 s (server time), with 250,000 products and 50 concurrent searches | k6 load test in the test environment, scaled to the production database tier for the run, against a synthetic 250,000-product catalog plus the real ERP load; Application Insights percentiles | BR-04; §7.1 |
| N-02 | Other page and interface responses | 95 % in ≤ 1.5 s with 100 concurrent users on the §7.1 mix | Same load test | Architect's target, not client-committed |
| N-03 | New request visible to reps | In the open requests list ≤ 60 s after it is recorded, including on a list already open (refreshes every 30 s) | QA submits a request with the list open on a second screen; 20 runs, all ≤ 60 s | BR-08, A-15 |
| N-04 | Email hand-over | 99 % of emails accepted by the email service ≤ 5 min after the event. An email not accepted after 10 min of retries appears on the failed emails list ≤ 15 min after the event | Locally: outbox timestamps, with **Refuse sending** switched on at `/dev/mailbox` and the retry window at its production value, timing the failed-list entry. In Stage 2: again, with the application's send permission removed | BR-07, BR-13, A-15 |
| N-05 | Availability | 99.5 % per calendar month (about 3 h 40 min of downtime), excluding maintenance announced two business days ahead | Application Insights standard availability test from 3 locations every 5 minutes against the sign-in page and a health check that reads the database; monthly report | Architect's proposal, endorsed by Yash Dixit (FDE) on 2026-09-26. **Not client-committed** until Jensen Huang confirms at the gate |
| N-06 | Data loss and recovery | See §7.3, by scenario | Restore drill in test before go-live, timed and recorded; repeated every 12 months | BR-19; C-05 |
| N-07 | Records kept | Nothing in §5.1 marked ledger (append-only) can be updated or deleted by the application's identity, for at least 5 years | QA attempts an update and a delete on every append-only table with the application's own identity; each is refused | BR-19, A-08 |
| N-08 | Deactivation takes effect | The next page or action by a deactivated user is refused, with no grace period | QA deactivates a signed-in user, then clicks once | story-06-02 c4 |
| N-09 | Role removal takes effect | The next store or discount action by a user whose role was removed is refused | QA removes the role while the user's page is open, then submits | story-01-05 c2, c4 |
| N-10 | One owner, one response | Under 20 simultaneous attempts, exactly one take (or one response) succeeds, in each of 100 runs | Automated concurrency test in CI, repeated by QA | story-03-03 c2, story-05-05 c3 |
| N-11 | Sessions | Reseller session ends after 12 h; internal session after 10 h; either after 60 min idle | QA leaves a session idle 61 min, then clicks | Architect's target |
| N-12 | Transport | TLS 1.2 or later only; HTTP redirects to HTTPS | TLS scan of the production address before go-live | Architect's target |
| N-13 | Accessibility | **Not committed.** The BRD asks for no accessibility standard. Recommended: WCAG 2.2 AA (Fluent UI helps), to be raised with Jensen Huang | — | Not in BRD |
| N-14 | Browsers | Current and previous major versions of Edge, Chrome, Safari and Firefox | Playwright runs each Epic's demo path in each | Architect's target |
| N-15 | Release safety | A release can be reversed in ≤ 15 min by swapping the slot back | QA or the partner performs one swap-back in production before go-live | §4.6 |

### 7.3 Recovery: RTO and RPO by scenario

RTO (recovery time objective) is how long until the portal works again. RPO (recovery point objective) is how much recent data can be lost. Times are in business hours, because support is business-hours (C-05, N-05).

| Scenario | RPO (data lost at most) | RTO (back in service within) | How | Verified by |
|---|---|---|---|---|
| One application instance fails | 0 | ≤ 5 min, automatic | The second instance keeps serving; App Service replaces the failed one | QA restarts one instance during a load test: no failed requests beyond those in flight |
| A bad release | 0 | ≤ 15 min | Swap the staging slot back (N-15). Additive migrations keep the old release working (§4.6) | One swap-back before go-live |
| Data damaged by a mistake or a defect | ≤ 15 min | ≤ 4 business hours | Point-in-time restore to a new database, repoint the application, then reconcile lost requests from Communication Services' send log (§10.4 runbook 1) | Restore drill in test, timed |
| Database service outage in the region | 0 (the service is zone-resilient within its tier) | Microsoft's recovery; no action by Bow | Wait, and the partner communicates | Not testable by Bow; accepted |
| Loss of the whole Azure region | ≤ 1 h (geo-redundant backups) | ≤ 1 business day | Geo-restore the database into the paired region, redeploy with the same Bicep, move DNS | Tabletop walk-through by the partner before go-live |
| Email service outage | 0 (emails wait in the outbox) | Automatic when the service returns. Emails older than 10 min are on the failed list for reps to follow up | ADR-07 | N-04 test |
| Sign-in service outage (Entra ID or External ID) | 0 | Microsoft's recovery. Users already signed in carry on until their session expires | Server-held sessions (§4.3) | Not testable; accepted |

## 8. Security

### 8.1 Trust boundaries (where control changes hands)

| # | Boundary | Who is on each side |
|---|---|---|
| B1 | The internet → the portal's sign-in entrances | Anyone → the portal |
| B2 | A signed-in reseller user → **another reseller's** data | Reseller B's user → Reseller A's requests, quotes, users |
| B3 | A reseller user → their own reseller's admin actions | A non-admin buyer → adding and deactivating colleagues |
| B4 | A reseller user → internal sales screens and interface routes | Any reseller user → `/sales`, `/api/sales` |
| B5 | Any Bow staff member → the internal sales side | A Bow Microsoft 365 account → the portal's internal users list |
| B6 | A rep → privileged internal actions | A rep → price changes, standard discounts, reassignment, naming users |
| B7 | The portal → email, leaving Bow's control | Portal → Communication Services → reseller mailboxes |
| B8 | The Excel ERP → the store (one-off load) | A spreadsheet nobody owns today → the source of every price |
| B9 | People with Azure, database or pipeline rights → the records | Support partner, Bow's Azure owners, anyone who can merge to main → the database directly, or through a deployment |

The data classes, and who may read and change each, are in §5.4.

### 8.2 Threats

| # | Boundary | Threat | Consequence if it fires | Rating | Mitigation (as QA will attempt it) |
|---|---|---|---|---|---|
| T-01 | B2 | Reseller B's user types Reseller A's request ID or quote address, or sends an approval for it directly | Reseller B sees what Reseller A is buying, in what quantities and at what net price, and can work out A's discount. Reseller B is often A's competitor. Or B approves A's quote | Likely without a control; severe | Every read and action finds the record through the session's own reseller, never through the ID alone. A missing and a foreign ID give the same "not found". **QA:** as a Reseller B user, open Reseller A's request by ID, by page address and by a direct approval call; each is refused, A's quote is unchanged, and the response is identical to a made-up ID (story-02-06 c3, story-05-01 c7) |
| T-02 | B2, B7 | A confirmation or quote ready email for Reseller A reaches a user of another reseller | As T-01, by email, where Bow cannot recall it | Unlikely; high | Recipients are read from the request's own reseller at send time. Quote ready emails carry no prices. **QA:** send each email kind for Reseller A and check that no Reseller B mailbox receives anything (story-02-05 c4, story-04-05 c6, c8) |
| T-03 | B3 | A non-admin buyer adds an outsider to their reseller, or deactivates a colleague, by calling the action directly | An outsider reads every quote the reseller holds. A colleague is locked out | Possible; high | Admin actions check the admin flag on the server. **QA:** as a non-admin, call add and deactivate directly; both refused, nothing changed (story-06-03 c2). As Reseller A's admin, act on a Reseller B user; refused (c3) |
| T-04 | B1, B3 | A deactivated user, now at a competitor, keeps using a session that was open when they left | They keep reading their old company's quotes and prices | Possible; high | The active flag is read on every call, not only at sign-in. **QA:** N-08 |
| T-05 | B5 | Any Bow employee with a Microsoft 365 account (warehouse, finance) signs in to the internal side | They see every reseller's requests, prices and discounts, which BR-03 limits to internal sales | Likely without a control; high | A valid Bow account admits only people on the portal's internal users list. **QA:** sign in with a Bow account not on the list; refused and recorded |
| T-06 | B4 | A reseller user opens an internal screen or calls an internal interface route | As T-01 across every reseller, or a reseller changes prices | Possible; severe | Every `/api/sales` route requires an internal session, and the global guard closes any route that declares no rule. A reseller session there is refused and recorded (user, action, time). **QA:** story-01-04 c3–c4, story-02-06 c4, story-04-01 c4, calling the interface directly as well as through screens; plus a build check that lists every route with its declared rule, failing on any without one |
| T-07 | B6 | A rep who is not a price maintainer or discount setter changes a price or discount by calling the interface directly | A price or discount moves with nobody accountable. Every quote after that uses it (NF-01) | Possible; high | Role checked on the server for every store and discount call, read fresh each time. **QA:** story-01-04 c5, story-04-01 c3; N-09 |
| T-08 | B6 | An internal admin or discount setter names themself a price maintainer | The separation Jensen Huang asked for (story-01-05 DoD, story-03-06 DoD) disappears | Possible; medium | Only role managers change the named lists, and nobody can grant a role to themself. **QA:** as an internal admin, add yourself to price maintainers; refused. As a role manager, grant yourself discount setter; refused |
| T-09 | B6 | A rep sends a quote whose store price has been edited in the browser before sending | A reseller is quoted a price the store never held, and NF-01 fails silently | Possible; high | The server ignores any submitted store price and uses the price copied into the draft (ADR-05). **QA:** alter the store price in the send call; the sent quote shows the store's price |
| T-10 | B3, B6 | A rep, on the phone with a caller who claims to work for Reseller A, adds them as a user (D2-Q5) | An outsider reads all of Reseller A's quotes | Possible; high | D2-C2: Reseller A's admins are emailed naming the new user and the rep who added them. This **detects**, it does not prevent (R-03). **QA:** story-02-01 c6, story-03-04 c9 |
| T-11 | B1 | An invitation email is forwarded or intercepted, and someone else completes it | An outsider holds a reseller account | Unlikely; high | Invitations are single-use, expire after 7 days, and External ID requires a code sent to the invited address. **QA:** reuse a completed invitation; refused. Use one 8 days old; refused |
| T-12 | B1 | A buyer double-clicks Submit, or the browser resends after a timeout | Two requests with two IDs, possibly quoted by two reps | Likely; low | Each request form carries a one-time submission key, unique in the database, and a repeat returns the first request. **QA:** submit the same form twice within 1 s; one request exists |
| T-13 | B1 | Search text is read as query syntax (`"capacitor" OR *`, `NEAR(`, unbalanced quotes) | An error page, or a very slow query for everyone | Possible; low | Search text is always passed as a parameter and treated as plain words, never as full-text syntax. **QA:** search `" OR 1=1 --`, `NEAR((a,b),5)`, `*` and a 2,000-character string; each shows results or "no products match", never an error |
| T-14 | B8 | The ERP's price column holds text the loader misreads (`1,234.50`, `$12`, `#REF!`, a formula, a blank) | Every quote from go-live carries a wrong price, and nobody knows which | Likely; severe | A row is loaded only if its price is a plain positive number; anything else is listed "not loaded" with the reason, and a load with any such row is not complete (story-01-01). The ERP owner compares 20 random products before sign-off. **QA:** load a copy seeded with each bad value; each row is listed with its reason, and the count identity holds |
| T-15 | B8 | The load is run again after go-live, over a store that named users have since maintained | Maintained prices are overwritten by stale ERP prices | Possible; high | The load refuses to run on a store that holds any product. **QA:** run it twice; the second is refused and the store is unchanged |
| T-16 | B9 | Someone with database rights edits a sent quote or deletes a request | The export record (A-08) and Bow's evidence of what it offered are false, with no trace | Unlikely; severe | Append-only ledger tables refuse update and delete even from administrators; ledger digests go to immutable storage (ADR-04). **QA:** N-07, plus a ledger verification run. Residual: R-01 |
| T-17 | B7 | The email service refuses the portal: its permission to send is removed during a change, the sending domain lapses, or a sending limit is hit | Every confirmation and quote ready email stops. Resellers phone to ask | Possible; high | The application sends with its managed identity, so no password expires (ADR-07). Failed emails appear on the list within 15 min (N-04), and the partner is alerted on the first failure. **QA:** remove the application's send permission in test; the list and the alert both fire |
| T-18 | B7 | Bow's domain has no SPF or DKIM records for the email service | Confirmation emails land in spam or are rejected after acceptance, which the portal cannot see (R-02) | Likely without a control; medium | The domain is verified in Communication Services before go-live. **QA:** send to one Microsoft 365 mailbox and one Gmail mailbox; headers pass SPF and DKIM |
| T-19 | B2 | The time a "not found" takes, or its wording, differs for a real foreign ID | Reseller B learns which request IDs exist | Unlikely; low | Accepted (R-05). Random IDs (ADR-06) make guessing impractical |
| T-20 | B1 | Someone guesses reseller passwords or one-time codes by trying many (credential stuffing) | An outsider signs in as a buyer and reads that reseller's quotes | Possible; high | External ID's built-in lockout and throttling stay on; staff sign-in inherits Bow's Microsoft 365 policy. **QA:** 10 wrong passwords in a row for a test reseller user; locked or throttled, and the right password is refused until the lockout ends |
| T-21 | B3, B6 | A signed-in reseller admin or rep visits another website that silently submits an action to the portal's interface with their cookie (cross-site request forgery) | An outsider is added to a reseller (as T-03), or a price is changed in a price maintainer's name (as T-07) | Possible; high | The session cookie is `SameSite=Strict`, and every changing call must carry an anti-forgery token only the portal's own pages hold. **QA:** from a page on another origin, submit "add user" and "change price" while signed in; both refused, nothing changes |
| T-22 | B9 | A change merged to the repository (by a compromised developer account, or a malicious dependency) ships code that leaks prices or opens a route | Any of T-01 to T-09, introduced after testing | Unlikely; severe | Branch protection: one reviewer approval and green checks to merge. Production deployment needs a named approval. Dependency audit and code scanning on every pull request. The route-rule check from T-06 runs in CI. **QA:** try to merge to main without review, and to deploy to production without approval; both blocked |

| T-23 | B1 | A development stand-in (pick-a-user sign-in, the mailbox page, the clock offset) is left switched on where real people can reach it | Anyone can sign in as any rep or reseller admin, read every reseller's prices and quotes, and move time to expire or revive quotes | Unlikely; severe | The start-up guard (§4.7) refuses to start with any stand-in selected on a non-local address or in production mode. The `/dev` pages are left out of the production build entirely. **QA:** start with each bad configuration; each refuses. Request `/dev/sign-in` and `/dev/mailbox` on the production build; both not found |

### 8.3 Accepted risks

No client stakeholder has accepted any of these yet. Each is recorded as **provisionally accepted by Yash Dixit (FDE, operator) on 2026-09-26**, to be ratified or refused by Elon Musk at the architecture gate.

| # | Accepted risk | Accepted by | Date | Revisit when |
|---|---|---|---|---|
| R-01 | Someone with Azure owner rights can still drop the database or restore over it. Ledger tables stop edits, not destruction | Yash Dixit (FDE), provisional; Elon Musk to ratify | 2026-09-26 | More than two people hold Azure owner rights, or an audit asks for it |
| R-02 | An email the service accepts and that later bounces is not listed (backlog assumption) | Yash Dixit (FDE), provisional; Elon Musk to ratify | 2026-09-26 | Resellers report missing emails that the failed list did not show |
| R-03 | A rep can add a caller to a reseller, and the reseller's admins are told after the fact, not asked first (D2-C2) | Yash Dixit (FDE), provisional; Elon Musk to ratify | 2026-09-26 | Any report of an outsider added this way |
| R-04 | Reseller users' names and emails are kept with their requests for at least five years, whatever data protection law turns out to apply (NF-07 open) | Yash Dixit (FDE), provisional; Elon Musk to ratify | 2026-09-26 | NF-07 is answered, or a reseller user asks to be erased |
| R-05 | Existence of a request ID might be inferred from response timing (T-19) | Yash Dixit (FDE), provisional; Elon Musk to ratify | 2026-09-26 | Request IDs become guessable |
| R-06 | No web application firewall in front of the portal. Azure's platform protection alone stands against flooding and automated attacks | Yash Dixit (FDE), provisional; Elon Musk to ratify | 2026-09-26 | The portal is attacked, or traffic exceeds 10 times §7.1 |

### 8.4 Deliberately not addressed

- **Export screening and classification.** These stay outside the portal (BRD §4.2, A-08). The portal cannot create an order or a shipment, so it cannot let one bypass screening. If Bow later converts approved quotes into orders (§2.4), the screening gate comes first.
- **Denial of service beyond Azure's platform protection.** Accepted as R-06.
- **Bounce handling.** Accepted as R-02.

## 9. Traceability

### 9.1 Requirement → component

| BRD requirement | Component(s) | Deferred? |
|---|---|---|
| BR-01 | Access module (session-scoped reseller); Reseller screens; Notifications (recipient from the request's reseller) | No |
| BR-02 | Access module; Reseller screens (Users); Entra External ID (invitations) | No |
| BR-03 | Access module (internal users list, roles, refused attempts, default-deny guard); Entra ID; Internal sales screens | No |
| BR-04 | Catalog and pricing module (full-text search); Reseller screens | No |
| BR-05 | Quote workflow module (validation before any ID is drawn); Reseller screens; Internal sales screens (enter request) | No |
| BR-06 | Quote workflow module (random ID, database-set received time, non-updatable columns); Portal database | No |
| BR-07 | Notifications module and email worker; Communication Services; Internal sales screens (failed emails list) | No |
| BR-08 | Quote workflow module; Internal sales screens (list refreshes every 30 s) | No |
| BR-09 | Quote workflow module; Internal sales screens (open requests list) | No |
| BR-10 | Quote workflow module (conditional take, ownership changes); Access module (internal admin role) | No |
| BR-11 | Quote workflow module (draft copies price and discount; sent versions); Catalog and pricing module | No |
| BR-12 | Quote workflow module (valid-until; expiry read against Bow's business day) | No |
| BR-13 | Notifications module; Communication Services | No |
| BR-14 | Quote workflow module (responses, one per version, versions kept); Notifications module | No |
| BR-15 | Internal sales screens (enter request); Quote workflow module; Access module (add a caller) | No |
| BR-16 | Quote workflow module (single status, ADR-08); both screen sets | No |
| BR-17 | Catalog and pricing module (products, price history, ERP load); Store screens; Access module (price maintainers) | No |
| BR-18 | Catalog and pricing module (closed products leave search at once); Quote workflow module (closed-product flag; sent quotes copied) | No |
| BR-19 | Portal database (ledger tables, backups); no delete path anywhere | No |
| BR-20 | Catalog and pricing module (standard discounts, history); Access module (discount setters); Quote workflow module (pre-fill, no-discount flag) | No |
| NF-01 | ADR-05 (no hand-typed price); one-off load; §10.4 runbook 2 freezes the ERP | No |
| NF-02 | Answered here: ADR-03 (sign-in), ADR-07 (email) | No |
| NF-03 | ERP load and summary; ERP owner is a named prerequisite | Owner still to be named (C-10) |
| NF-04, NF-05, NF-06, NF-10 | Bow's go-live commitments; the screens they use exist; NF-05 has runbook 6 | Not build work |
| NF-07 | Region choice and R-04 | **Provisional** until answered |
| NF-08 | §7.1 sizing assumptions | **Provisional** until counted |
| NF-09 | No design effect | — |

### 9.2 Component → requirement (nothing untraced)

| Component | Traces to |
|---|---|
| Browser application (reseller, internal and store screens) | BR-01–BR-05, BR-07–BR-11, BR-13–BR-18, BR-20 (every story's screens) |
| Portal server: access module | BR-01, BR-02, BR-03, BR-10, BR-17, BR-20 |
| Portal server: catalog and pricing module | BR-04, BR-11, BR-17, BR-18, BR-20, NF-01 |
| Portal server: quote workflow module | BR-05, BR-06, BR-08–BR-16, BR-18 |
| Portal server: notifications module and email worker | BR-07, BR-13, BR-14, story-02-01 c6 |
| Refused attempts list (internal admins) | BR-03 via story-01-04 ("where the record is read is decided in Architecture"). A screen, because nobody at Bow can run database queries (C-05) |
| Role manager role | story-01-05 c5, story-03-06 c4 |
| One-time submission key | BR-06 (one request, one ID); mitigation T-12 |
| Portal database | BR-06, BR-19, and all of the above |
| Server-held session table | BR-01, BR-03; N-08 (deactivation on the next action); T-21 |
| Entra ID, Entra External ID | BR-01, BR-02, BR-03, NF-02 |
| Communication Services Email | BR-07, BR-13, BR-14, NF-02 |
| Key Vault | T-22 and §4.6 (no secrets in code or pipeline) |
| Application Insights | BR-07, BR-13 (alert on failed email); N-01, N-02, N-05 |
| Storage account for ledger digests | BR-19 via ADR-04 (tampering detectable); T-16 |
| App Service (2 instances, staging slot) | C-05; N-05; N-15; §7.3 |
| CI/CD pipeline and Bicep | C-05 (partner can redeploy everything); T-22; §7.3 region loss |
| Test environment (Stage 2) | Stage 2 integration checks; N-01, N-06 drills |
| Adapters and local stand-ins, start-up guard, `/dev` pages | C-13 (the EA's direction); every Epic's demo (`demo-topology.md`); T-23 |
| `dev.sh`, `reset.sh`, seed data, synthetic price list | C-13; the backlog's demo-notes for epic-01 to epic-06; story-01-01 c3–c5 (bad rows) |
| SQLite migrations and triggers; contract tests on both databases | C-13; BR-06, BR-19 (§5.6) |

### 9.3 Epic → what must exist before it can be shown

| Epic | Components touched | What must exist first |
|---|---|---|
| epic-01 | Catalog and pricing module and store screens; access module (internal users, roles, role manager); Entra ID; portal database; test environment; pipeline | The walking skeleton on the Mac: `dev.sh`, `reset.sh`, the local database with its triggers, the adapter interfaces with the local sign-in stand-in, internal users, the seed and the sample spreadsheet. **epic-01 carries this cost alone.** No Azure |
| epic-02 | Reseller screens; access module (resellers, users, invitations, refused attempts); External ID; quote workflow (request, ID); notifications and Communication Services | epic-01, plus the reseller sign-in stand-in and the local mailbox. No tenant or domain |
| epic-03 | Internal sales screens (list, enter request, request page); quote workflow (ownership, flags) | epic-02. Nothing new in the platform |
| epic-04 | Catalog and pricing (standard discounts); quote workflow (draft, versions); notifications | epic-03. Nothing new in the platform |
| epic-05 | Reseller screens (quote response); quote workflow (responses, expiry) | epic-04. Nothing new in the platform |
| epic-06 | Reseller screens (Users); access module | epic-02 only |

Only epic-01 needs a large set of work before it can be shown, and epic-02 adds two stand-ins. No Epic Review depends on Stage 2. Every later Epic adds only screens and module code. The one fixed chain (epic-01 → epic-05) comes from the backlog's business process, not from the architecture.

## 10. Running it

### 10.1 Who

A support partner under contract, working in Bow's business hours, is a **go-live precondition** (C-05). It is strongly advised, but it does not block go-live: if the contract is not signed by go-live, the delivery team provides interim support for a period Jensen Huang and the FDE agree in writing before go-live. The partner then runs the restore drill (§7.3) within 30 days of signing (decided by Yash Dixit, FDE, 2026-09-26). Until the contract is signed, Bow depends on the delivery team to restore, redeploy and answer alerts.

The partner needs Azure and TypeScript/Node skills (ADR-10). Bow names one person as the partner's contact. The partner holds Azure contributor rights. Azure owner rights are held by two named people only (R-01).

### 10.2 Monitoring

Application Insights alerts the partner on:
- the availability test failing twice in a row;
- any email reaching the failed list;
- database storage over 80 %, or database CPU over 80 % of its 2-vCore ceiling for 15 minutes;
- error rate over 2 % of requests in 15 minutes;
- any refused attempt by an internal user on a store or discount action.

### 10.3 Indicative monthly cost by service

This is the recurring Azure spend. Figures are pay-as-you-go list prices in US dollars, in US regions, as published at the time of writing. They are **indicative**: Yash Dixit (FDE) re-prices them in the Azure pricing calculator for Bow's region and agreement before the gate. Volumes are from §7.1: about 4 emails per request, so about 120,000 emails a month at peak. Two unit prices come from secondary sources and are marked so. Together they are more than two thirds of the total, so they are the first to re-price. Lines that exist only to meet N-05 (not yet committed by Jensen Huang) are marked. The FDE chose to keep them in the total (2026-09-26).

| Service | Production | Test | Monthly (US$) | Basis |
|---|---|---|---|---|
| App Service (Linux) | P0v3 × 2 instances (1 vCPU, 4 GB each), staging slot included | Basic B1 × 1 | ≈ 293 | P0v3 US$0.192 per hour ≈ US$140 per instance (secondary source, **not verified on Microsoft's price page**); B1 ≈ US$13. The second instance (≈ US$140) exists for N-05 |
| Azure SQL Database | General Purpose serverless, 0.5–2 vCores, auto-pause off; storage about 32 GB | General Purpose serverless with auto-pause after 1 hour idle | 200–330 | About US$0.522 per vCore-hour (secondary source, **not verified on Microsoft's price page**). Production never drops below 0.5 vCore (≈ US$190), and business-hours peaks add the rest. Test mostly paused (≈ US$10–30) |
| Backup storage | 35-day point-in-time, geo-redundant; monthly long-term backups kept 12 months | 7-day | 5–15 | Small database (a few GB); grows with years of data |
| Communication Services Email | ~120,000 emails, ~50 KB each | A few hundred | 30–35 | US$0.00025 per email + US$0.00012 per MB |
| Entra External ID | ≤ 3,000 monthly active reseller users | Test users | 0 | First 50,000 monthly active users free; US$0.03 each above that |
| Entra ID (staff) | Bow's existing Microsoft 365 | — | 0 | Included in Bow's Microsoft 365 |
| Application Insights / Log Analytics | ~5–10 GB of logs a month | ~1 GB | 0–15 | First 5 GB a month free, then about US$2.30 per GB |
| Availability tests | 3 locations every 5 min (~26,000 runs) | — | ~13 | About US$0.0005 per test run. Exists for N-05 |
| Key Vault, storage for ledger digests | Light use | Light use | 1–3 | |
| GitHub (repository and Actions) | Organisation on the free plan; private repository | — | 0–5 | Free minutes cover the expected pipeline use; paid minutes only if exceeded |
| **Total** | | | **≈ 540–710** (sum of the rows: low 542, high 709) | Not included: the support partner contract (§10.1), and any Microsoft agreement discounts |

For comparison with §2.5: candidate B adds about **US$240 a month** in Business Central Essentials licences for 3 named users (US$80 each, list), plus a Business Central partner. Candidate C's Power Pages capacity for 3,000 authenticated reseller users is about **US$6,000 a month** at US$200 per 100 users per site.

### 10.4 Runbooks the partner receives at handover

1. **Restore.**
   - Restore the database to a point in time, into a new database, then repoint the application.
   - Compare Communication Services' send log for the lost window with the restored database. Any confirmation email sent for a request the restore lost is a request a reseller holds an ID for.
   - Reps re-enter it (BR-15), and the reseller is told the new ID. Random IDs (ADR-06) mean a lost ID is not handed out again.
2. **Go-live load.**
   - The ERP owner supplies the frozen file.
   - A price maintainer runs the load and checks the summary.
   - The ERP owner signs the 20-product comparison, and the spreadsheet is set read-only (NF-01, NF-03).
3. **Seeding.** Two role managers (Jensen Huang and a deputy he names) are set in configuration at first deployment. From then on, all naming is done on the named users screen.
4. **Credential rotation.** The only long-lived secret is the External ID application credential. Rotate it 30 days before it expires; its expiry is alerted 45 days ahead.
5. **Restore drill.** Every 12 months (§7.3).
6. **Go-live re-entry.** Before resellers are given access, reps re-enter every request still open in the Excel request logs, oldest first by the date in the log (NF-05). Resellers get access only once the last one is entered.
7. **Region loss.** Geo-restore the database, deploy the Bicep templates to the paired region with the same pipeline, move DNS (§7.3).

## 11. Points decided with the FDE, and what still goes to the gate

| # | Point | Decided (Yash Dixit, FDE, 2026-09-26) | Still to confirm |
|---|---|---|---|
| Q-01 | Programming language and framework | TypeScript on Node.js (ADR-10). The architect had recommended C#, recorded as the rejected alternative | Elon Musk at g3; the FDE states the reason |
| Q-02 | A rep-entered request carries its entry time | Keep BR-06 as approved; re-enter open Excel requests in arrival order before resellers get access (§10.4 runbook 6). No change request | Jensen Huang, that the Waiting-column cost is acceptable |
| Q-03 | Time zone for "today" and valid-until | Bow's head-office time zone | Elon Musk names the zone |
| Q-04 | Availability N-05 | 99.5 % a month, business-hours support | Jensen Huang |
| Q-05 | No bulk loader for resellers, users or discounts | Keep as approved; Jensen Huang counts resellers now (NF-08). If there are more than about 100, the FDE raises a change request for a one-off import | Jensen Huang (the count) |
| Q-06 | Technical setup before a partner exists | Bow's Microsoft 365 administrator performs the Azure and Entra steps (`demo-topology.md`) | Elon Musk names that person |
| Q-07 | Support partner at go-live | A precondition, not a blocker; interim support from the delivery team (§10.1) | Jensen Huang owns procuring the partner |
| Q-08 | Accepted risks R-01 to R-06 | Provisionally accepted by Yash Dixit (FDE) | Elon Musk ratifies or refuses each at g3 |
| Q-09 | Candidate architecture and the store | Rework within approved scope (the FDE's instruction for revision 2): candidate A, store built in the portal (ADR-01, ADR-11). Business Central recorded as the future path | Elon Musk at g3 |
| Q-10 | Local runtime (the EA's direction said Node 20) | Node 24 LTS locally and in production. Node 20 reached end-of-life on 30 April 2026 | Elon Musk confirms the departure from his wording |
| Q-11 | story-01-01 and story-02-02 require runs against the real ERP data (definition of done) | Epic Reviews use the synthetic sample. The definition-of-done runs happen **locally on the FDE's Mac** with the real file once the ERP owner supplies it, and the file is deleted afterwards. Those two stories are done only then. The backlog is unchanged | Elon Musk names the ERP owner (C-10) |
| — | A-07: one discount per reseller | As approved. If terms prove richer, that is a BRD change | Elon Musk, Jensen Huang |
