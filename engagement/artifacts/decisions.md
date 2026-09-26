# Architecture Decisions — Bow Electronics Reseller Portal

**Prepared by**: Yash Dixit · **For review by**: Elon Musk

Each record below is a decision that would be expensive to reverse: where state lives, how people sign in, how records are kept, and what Bow is committing to run. Every record is **Proposed**. The operator made it on 2026-09-26, and it becomes **Accepted** only when Elon Musk (Enterprise Architect) agrees it at the architecture gate. No record claims a client stakeholder's agreement that has not been given.

The answers the FDE gave on 2026-09-26 are quoted where a decision rests on them: managed services plus a support partner, Microsoft 365, a managed identity service, random request IDs, TypeScript, and Node 24.

**Revision 2 (2026-09-26).** The FDE rejected revision 1 at g3 and asked for rework within the approved scope. As a result:
- ADR-01 now compares three candidate architectures.
- ADR-07 now sends email with a managed identity instead of an expiring SMTP password.
- ADR-10 names the frameworks.
- ADR-11 (the catalog and pricing store versus Business Central), ADR-12 (CI/CD) and ADR-13 (adapters and local stand-ins, at the EA's direction) are new.

Because no record here was ever accepted, the revised records are edited in place. The change is noted in each, so the reasoning that moved stays visible.

---

## ADR-01 — Candidate A: one web application with four modules and one database, built for Bow

- **Status**: Proposed
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE). To be agreed by Elon Musk (EA) at g3

**Context**

*Revised for revision 2: the three candidates of architecture §2.5 are now compared here.*

The backlog asks for about 25 screens across two audiences, a catalog and pricing store, and one email path. It must be delivered as written (C-12). Bow has no IT operations team and will run the portal through a support partner in business hours (architecture C-05). The volumes are unknown but, on every indication in the brief, small (§7.1). The forcing question: what is the smallest number of moving parts that delivers all six Epics and that a support partner can run without an on-call engineer?

**Decision**

One TypeScript web application (ADR-10), deployed as a single unit: a browser application and its server programming interface on one address. It holds four modules: Access, Catalog and pricing, Quote workflow, and Notifications. Each owns its own tables in one Azure SQL database, and another module may use them only through that module's code.

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| Separate services per area (catalog service, quote service, notification service), talking over a message broker | C-05: Bow cannot operate several deployables, a broker, and the distributed failure modes between them. Nothing in the backlog needs parts to scale or ship separately at these volumes |
| **Candidate B**: portal built on Azure, catalog and pricing in Dynamics 365 Business Central | The strongest alternative, and the right one if Bow buys an ERP for orders, invoicing and stock (ADR-11). Rejected on C-12: it cannot deliver epic-01 and story-04-01 as written (architecture §2.4). It also adds a second system to keep consistent, and a second partner |
| **Candidate C**: a low-code portal on Microsoft Power Pages with Dataverse | A competent choice for a Microsoft 365 company. Rejected on two constraints. First, BR-19 and A-08 need records that nobody can edit or delete, and in Dataverse an administrator can. Second, reseller users are licensed per user per month: US$200 per 100 authenticated users per site per month at list price, so about US$6,000 a month if 3,000 reseller users are active. The cost grows with every reseller Bow onboards. It would also need Power Platform skills that Bow does not have and its partner may not have |
| Buying a packaged quoting or B2B portal product | Not analysed in depth. The brief records a preference to build a portal, and the revision 2 instruction asks for the build-versus-buy analysis on the **catalog and pricing store** specifically, which is ADR-11 |
| Separate applications for the reseller side and the internal side | Would make the BR-03 boundary physical. But stories 01-04, 02-06 and 04-01 require a reseller user who reaches an internal page to be **refused and recorded by name**, which needs the reseller's session on the internal side. It would also be two deployments for the partner to run |

**Consequences**

- One deployment, one database, one set of logs: the least for the partner to learn and watch.
- The module boundaries are kept only by discipline and code review. Nothing in the runtime stops one module reading another's tables, and over years this is how a single application becomes hard to change.
- Everything scales together. The search page cannot be given more capacity without giving it to everything.
- A fault in the email worker runs in the same process as the pages, so a runaway worker can slow the whole portal.

**Revisit when**

Any real volume from NF-08 is more than twice the §7.1 assumption. Or a second channel appears (electronic quote exchange, an ordering step) that needs to change on its own schedule. Or Bow gains an in-house team that can run more than one service.

---

## ADR-02 — Hosted on Azure managed services

- **Status**: Proposed (region provisional)
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE), following the FDE's answers that Bow uses Microsoft 365 and will run on managed services with a partner. To be agreed by Elon Musk (EA) at g3

**Context**

Something has to run the application, the database, email and sign-in, and Bow cannot run servers (C-05). Bow's staff accounts are already in Microsoft 365, so Microsoft Entra ID is already Bow's identity system (C-02). The forcing question: on which platform can every component be a managed service, with the fewest vendors for Bow to hold contracts with?

**Decision**

Use Azure App Service (Linux, two instances in production), Azure SQL Database (vCore General Purpose, serverless, 0.5–2 vCores, auto-pause off in production; 35-day point-in-time restore, geo-redundant backups), Azure Communication Services Email, Azure Key Vault and Application Insights. Production and test run in one Azure subscription owned by Bow. The region is **provisional**: Bow's home geography, confirmed by Elon Musk once NF-07 (which data protection law applies) is answered.

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| AWS or Google Cloud equivalents | Technically equal. Rejected because staff sign-in is Bow's Microsoft Entra ID either way, so another cloud adds a second vendor, a second bill and a second set of partner skills for no gain |
| Azure Container Apps or Kubernetes (AKS) | Container orchestration is more than a business-hours partner should have to run for one application (C-05). App Service gives deployment slots, scaling and patching without it |
| Virtual machines | Bow, or the partner, would own patching, backups and failover. That is exactly the capability Bow lacks |
| Azure SQL Database, DTU Standard S2 (≈ US$59 a month) | Much cheaper. Rejected by the FDE on 2026-09-26: Microsoft's documentation shows ledger (ADR-04) with vCore tiers, and support on DTU Standard could not be confirmed. The whole of BR-19's guarantee rests on ledger |
| A single App Service instance | Cheaper. But every platform patch or instance fault is then an outage, and N-05 (99.5 %) would depend on luck |

**Consequences**

- Bow is committed to Azure for this portal. Moving would mean re-platforming the database, email and hosting, although the application itself uses no Azure-only programming interface except the sign-in services.
- Bow must hold an Azure subscription, pay a monthly bill, and name who owns it (at most two people with owner rights, R-01).
- Running cost is about US$540–710 a month for production and test together at §7.1 volumes (architecture §10.3). *(Revised for revision 2: revision 1 said "low hundreds", before the App Service and General Purpose prices were checked.)* The FDE produces the real figure with Azure's pricing calculator for Bow's region before the gate.
- The region, once data is in it, is expensive to change. That is why it waits for NF-07 and is not guessed.

**Revisit when**

NF-07 names a law that requires data in a region Azure does not offer. Or Bow leaves Microsoft 365. Or the support partner changes to one without Azure skills.

---

## ADR-03 — Staff sign in with Bow's Microsoft 365 accounts; resellers with invitation-only Entra External ID accounts; the application decides who may do what

- **Status**: Proposed
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE), who chose a managed identity service on 2026-09-26. To be agreed by Elon Musk (EA) at g3

**Context**

NF-02 asked how people sign in. Two audiences must sign in separately (BR-03). Resellers are external and must not register themselves (story-02-01). Deactivation and role removal must bite on the very next action (story-06-02 c4, story-01-05 c2). And "named users", "internal admin" and "role manager" are distinctions Jensen Huang controls. The forcing question: where are identities held, and where is the rule of who may do what held?

**Decision**

- **Staff** sign in through Bow's own Entra ID tenant. A valid Bow account admits a person only if they are on the portal's **internal users list**.
- **Reseller users** sign in through a Microsoft Entra External ID tenant created for the portal. Accounts exist only by invitation from a rep or the reseller's admin. Invitations are single-use and expire after 7 days.
- **Authorisation lives in the application's database**: which reseller a user belongs to, admin or not, active or not, and the four internal roles (price maintainer, discount setter, internal admin, role manager). It is read on every page and action. The portal stores no passwords.

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| The portal's own email-link sign-in (a one-time link emailed at each sign-in) | Considered as the no-vendor option. Rejected because account security then equals mailbox security with no second factor, and the FDE chose a managed service on 2026-09-26 |
| The portal's own passwords, resets and multi-factor | The most to build and secure. It holds credentials Bow would then be responsible for, with no benefit over a managed service |
| Internal roles as Entra ID groups or app roles | Role changes reach the portal only when the user's token is renewed (up to about an hour), which fails story-01-05 c2 and c4. Changing groups also needs an Entra administrator, a skill Bow does not have in-house. Jensen Huang's naming decisions would then sit outside the portal's own record |
| One External ID tenant for both staff and resellers | Staff would have a second password to manage. More importantly, when Bow disables a leaver's Microsoft 365 account they would still be able to sign in to the portal |

**Consequences**

- A rep who leaves Bow loses access as soon as Bow disables their Microsoft 365 account. The portal does nothing extra.
- Two sign-in configurations to maintain, and an External ID tenant for the partner to administer.
- External ID charges per monthly active user above its free allowance. At §7.1 volumes this is expected to fall within the free allowance, to be confirmed in the FDE's pricing.
- The application must get authorisation right on every page and action. That is where T-01 to T-08 live, and QA tests each one.
- Every reseller user must have an email address that no other reseller uses (story-02-01 c4, story-06-01 c3). A person who works for two resellers cannot be modelled.

**Revisit when**

A large reseller asks to use its own company sign-in. Or Bow moves off Microsoft 365. Or Microsoft changes External ID pricing or retires it.

---

## ADR-04 — Records that must never change are append-only ledger tables

- **Status**: Proposed
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE). To be agreed by Elon Musk (EA) at g3

**Context**

BR-19 requires requests, every quote version and every response to be kept and undeletable for at least five years. A-08 says these may be US export records (D-10 to D-12). Story-05-07 c3 requires a direct delete to be refused. The forcing question: who is the design protecting the records from? The screens are the easy part. The hard part is a well-meaning administrator "fixing" a quote in the database.

**Decision**

Requests' lines, sent quote versions and their lines, responses, price changes, discount changes, ownership changes, refused attempts and ERP load runs are Azure SQL Database **append-only ledger tables**. The database refuses every update and delete on these, including from administrators. Rows that must change but keep their history (the product, the request's status and owner, the reseller user) are **updatable ledger tables**, which keep every earlier version automatically. Ledger digests are written to immutable storage so that tampering can be detected. The application's database login also has no update right on a request's ID, received time, reseller or how it arrived.

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| Ordinary tables with delete and update withheld from the application's login | Stops the application, but not an administrator. The case BR-19 and A-08 care about is a person, not the code |
| A soft-delete flag | A "deleted" record is one query from invisible, and the flag itself can be cleared. It does not meet "cannot be deleted by any user" |
| Event sourcing (the record is the list of events, and screens are rebuilt from them) | Meets immutability by construction. Rejected on operability: the partner would have to understand rebuilding views to fix anything (C-05). Ledger tables give the same guarantee in ordinary tables |
| A nightly copy to separate archive storage | Protects against loss, not against edits made before the copy, and adds a second store to reconcile |

**Consequences**

- A mistake cannot be corrected in place, not even by Bow. A wrongly sent quote is superseded by a new version. A bad load row is corrected by a price change. That is the point, and it will be felt.
- Ledger tables limit schema changes: columns can be added, but data cannot be rewritten. Mistakes in the data model cost more after go-live, so the model in architecture §5.1 deserves the EA's attention now.
- Storage only grows. At §7.1 volumes this is a few gigabytes a year.
- It ties the design to Azure SQL Database or SQL Server 2022 or later, which is one more reason ADR-02 is expensive to reverse.

**Revisit when**

NF-07 names a law requiring personal data to be erased on request (R-04). Names would then need to sit outside the ledger with a pseudonymous key, which is a data model change. Also revisit if the retention period is set longer or shorter than five years.

---

## ADR-05 — A quote copies the store price and the standard discount when the rep starts it; a sent quote is an immutable version

- **Status**: Proposed
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE). To be agreed by Elon Musk (EA) at g3

**Context**

BR-11 requires every line's store price to be traceable. BR-18 and BR-20 require that later price and discount changes never move a sent quote. The backlog assumes the line price is the price when the rep **started** the quote (story-04-02 c5). NF-01 forbids a hand-typed price. The forcing question: does a quote line hold values, or pointers to values held elsewhere?

**Decision**

Starting a draft quote copies each product's current store price, and the reseller's standard discount or "none on file", into the draft. Sending writes an append-only quote version whose lines hold the store price, standard discount, discount applied, net price, line total and reason as values. Nothing in a sent quote points at a current price or discount. On send, the server uses only the copied store price and ignores any price the page submits.

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| Lines reference the product, and the price is looked up from price history by the send time | Correct in principle. But every display of an old quote then depends on the price history being complete and correct forever, and a single history error silently rewrites past quotes. It also contradicts the backlog's "price when started" rule |
| Take the price at the moment of sending | Contradicts story-04-02 c5 as approved. It would be a backlog change for Jensen Huang, not an architecture choice |
| Store only the net price | Loses the inputs. BR-11 asks for store price, standard discount, discount applied and reason, so that a discount can be explained to an auditor or a reseller |

**Consequences**

- A draft left open for days carries a stale price. The rep sees the copied price and date. The backlog accepted this reading, and it is its cost.
- Every quote line stores five numbers. The storage is trivial.
- A revised quote (story-05-02) is a new draft that copies prices again on the day it is built, so version 2 can differ from version 1 for reasons the reseller did not cause.

**Revisit when**

Jensen Huang reverses the "price when started" assumption. Or prices start changing daily, which makes stale drafts common.

---

## ADR-06 — Request IDs are random 8-character codes, not a counter

- **Status**: Proposed
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE), who chose this on 2026-09-26. To be agreed by Elon Musk (EA) at g3

**Context**

BR-06 requires an ID that is never reused. Resellers hold it on emails and read it out on the phone, so it is effectively printed and cannot be changed after go-live. Two further facts force a choice. First, a sequential ID tells any reseller comparing two of its own IDs how many requests Bow received in between, which is commercial information about Bow's volume. Second, a counter restored from a backup hands out again numbers already printed on resellers' emails. We have seen this happen on another engagement (practice lesson, voltway-returns-portal, 2026-09-23).

**Decision**

A request ID is `Q-` followed by 8 characters in two groups (for example `Q-7K3M-9TPX`), drawn at random from 31 characters that cannot be confused (no 0/O, 1/I/L, and so on). A unique constraint refuses a duplicate, and the application draws again if one occurs. The ID is drawn only after a request passes validation, so a refused request uses no ID (story-02-04 c4).

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| Sequential per year, e.g. `Q-2026-000123` | Easier to say, and sorts by age. Rejected because it reveals Bow's volume to every reseller, and because after any restore the counter must be moved past the highest ID ever issued, a manual step that is forgotten under pressure |
| A GUID | Unique and unguessable, but 36 characters cannot be read out on a phone call, which is how BR-15 requests arrive |
| Sequential ID internally, random code shown | Two identifiers per request, and reps would end up quoting the wrong one |

**Consequences**

- Harder to read out than a short number. The grouping and the confusion-free alphabet are there to help.
- IDs carry no order. The open requests list orders by received time, which is what BR-09 asks for anyway.
- About 850 billion possible codes (31⁸). At 1,000 requests every day for five years (about 1.8 million IDs), a draw that repeats an existing ID is expected about twice in total. The unique constraint refuses it and the application draws again, so no reseller ever sees it. The chance that one of the few IDs a restore loses is drawn again is negligible, at less than one in 100,000 per lost ID over five years.
- After a restore, a request the restore lost can be re-entered, but gets a new ID. The runbook tells the reseller (architecture §10).

**Revisit when**

Resellers or reps report that IDs are misheard on the phone often enough to matter. Or Bow wants to share request IDs with another system that needs numbers.

---

## ADR-07 — Emails go through an outbox in the database and a background worker to Azure Communication Services, signed in with the application's managed identity

- **Status**: Proposed
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE). To be agreed by Elon Musk (EA) at g3

**Context**

BR-07 and BR-13 require an email within 15 minutes, and require that when one cannot be sent the request is still recorded **and** Bow can see the failure. A request must never be lost because email was down, and an email must never be lost because the page crashed after the request was saved. The forcing question: how does a failed email become visible instead of silent, without making the request depend on the email?

**Decision**

- The event (a request recorded, a quote sent, a response given, a user added) and its email are written in **one database transaction**, with the email as a row in an outbox table.
- A background worker inside the application picks pending rows every 30 seconds, using a database lock so that two instances never pick the same row. It sends them to Azure Communication Services Email, from Bow's domain, through the service's own programming library, signed in with the application's **managed identity**. *(Revised for revision 2: revision 1 used SMTP with a password that expires every 12 months. A managed identity has no password, so that failure disappears.)* Locally, the email adapter captures mail instead of sending it (ADR-13).
- A refusal is retried every minute for 10 minutes. After that the row is marked failed with the provider's reason. Failed confirmation and quote ready emails show on the failed emails list, and the partner is alerted on any failure.
- "Cannot be sent" means refused when sending (backlog assumption). An email accepted and later bounced is not caught (R-02).

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| Send the email inside the page request | If email is down, either the request fails (breaks BR-07's "stays recorded") or the email is lost silently (breaks "Bow can see it failed") |
| A message queue service (Azure Service Bus) between the application and the sender | Solves the same problem with one more managed service to pay for, watch and understand (C-05). The outbox gives the same guarantee inside the database the partner already runs |
| SMTP to Communication Services with an application password (revision 1's choice) | Works, but the password expires every 12 months, and when nobody rotates it all email stops (the old T-17). The managed identity removes the secret entirely |
| Send from a Bow Microsoft 365 mailbox | Microsoft 365 limits how much a mailbox may send and is moving away from the sign-in method applications use to send mail. Failures come back as bounce messages in a mailbox, not as refusals the portal can list |

**Consequences**

- An email can occasionally be sent twice: if the worker crashes after the service accepts it but before the row is marked. A duplicate confirmation is harmless. This is accepted.
- Bow's DNS owner must add the service's domain records (SPF, DKIM) before go-live, or emails land in spam (T-18).
- The email adapter now depends on Azure's managed identity, so Stage 1 needs a stand-in (ADR-13). The permission to send can still be removed by mistake during a change. The failed list and the alert make that visible within 15 minutes (T-17).
- The worker shares the web application's process (ADR-01).

**Revisit when**

Bow needs bounce detection (R-02). Or email volume exceeds 10,000 a day. Or a second outbound channel appears (text messages, electronic quote exchange).

---

## ADR-08 — One stored status per request, changed only by guarded transitions; Expired is worked out when read

- **Status**: Proposed
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE). To be agreed by Elon Musk (EA) at g3

**Context**

BR-16 requires the reseller and the internal sales team to see the same status, always. Story-03-03 and story-05-05 require exactly one owner and exactly one response under simultaneous attempts. Story-05-04 requires a quote past its valid-until date to show Expired and refuse approval, and its DoD asks Architecture to decide whose calendar day "today" is. The forcing question: where does status live, and what makes Expired happen?

**Decision**

- A request holds one stored status: Received, Being quoted, Quote sent, Change requested, Approved or Declined. It changes only through one transition function that states, for each move, the status it requires. For example, "take" requires no owner; "approve" requires that the version is the current one, Quote sent, and not expired. Each move is a single conditional database update, so a second simultaneous attempt finds the condition false and is refused with the winner's name.
- **Expired is never stored.** A request shows Expired when its stored status is Quote sent and today, in Bow's business time zone, is after the current version's valid-until date. Both page sets and the approve action use the same function.
- Bow's business time zone is Bow's head-office time zone (decided by Yash Dixit, FDE, 2026-09-26). It is held as a configuration setting, and Elon Musk confirms which zone that is.

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| A nightly job that sets expired quotes to Expired | Between midnight and the job's run, a reseller could approve an expired quote (fails BR-12). The job is one more thing for the partner to watch, and when it fails, quotes silently never expire |
| Separate statuses held for the reseller view and the internal view | This is the defect BR-16 exists to prevent |
| Application-level locks for take and respond | Locks held in the application's memory fail with two instances (ADR-02), and locks held elsewhere need another service |
| "Today" in each reseller's own time zone | Resellers' locations are not recorded, and a quote would then expire at different moments for different people looking at it |

**Consequences**

- Reports that count Expired requests must use the same function, not the stored column. A report written directly against the database will get it wrong. The column is named so that this is hard to miss.
- A reseller in another time zone sees "valid until 30 Oct (end of day, Bow time)", which may be earlier or later than their own midnight.
- Every new action needs its entry in the transition function, which is a small cost in discipline.

**Revisit when**

Bow sells across time zones enough that "end of day, Bow time" causes disputes. Or a report or integration needs Expired as stored data.

---

## ADR-09 — Product search uses the database's full-text index

- **Status**: Proposed
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE). To be agreed by Elon Musk (EA) at g3

**Context**

BR-04 requires search by full part number and by words in the description, excluding closed products, within N-01 (95 % in ≤ 1.0 s). The catalog size is unknown (NF-08). The design assumes 250,000 products. The forcing question: does search need its own engine?

**Decision**

Part numbers are matched exactly, ignoring case, on an index. Description words use Azure SQL Database full-text search, on a `product_search` table kept in step with `product` in the same transaction. *(Revised for revision 2: SQL Server does not allow full-text indexes on ledger tables, and `product` is one.)* Locally the same search runs on SQLite FTS5 (ADR-13). Search text is passed as a parameter and treated only as words (T-13). Closed products are excluded in the same query.

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| Azure AI Search as a separate search service | Better ranking, typo tolerance and scale. But it is a second copy of the catalog that has to be kept in step with the store. Closing a product would then take effect in search only after that copy updates (BR-18), and it is another service for the partner (C-05) |
| Plain `LIKE '%word%'` matching | Scans the whole table. At 250,000 products it will not meet N-01 under load |

**Consequences**

- No typo tolerance and basic ranking. A buyer who misspells "capacitor" finds nothing, and the page says so (story-02-02 c6).
- No partial part-number search (for example, all parts starting "GRM188"). The BRD asks only for the full part number.
- Full-text indexing is asynchronous, so a newly added product may take a few seconds to be found by description (by part number it is found at once).

**Revisit when**

The real catalog is over 500,000 products, N-01 is missed in the load test, or Jensen Huang asks for typo tolerance or partial part-number search.

---

## ADR-10 — Built in TypeScript on Node.js: a browser application and a server programming interface on one address, with the session held on the server

- **Status**: Proposed
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE), who chose TypeScript on 2026-09-26 **against the architect's recommendation of C#**. To be agreed by Elon Musk (EA) at g3

**Context**

The language and framework decide who can support the portal for years. The screens are forms and lists. The backlog repeatedly requires that an action "sent directly, without using the page" is refused (story-01-04 c5, story-02-03 c4, story-05-01 c7, story-05-07 c3, story-06-03 c2). The forcing question: which stack is the portal built in, and how is the browser trusted with the session?

**Decision**

- TypeScript throughout, on **Node.js 24 LTS**: on the FDE's Mac (Stage 1) and on Azure App Service (Stage 2). *(The EA's direction named Node 20. It reached end-of-life on 30 April 2026, and the FDE chose Node 24 on 2026-09-26. Elon Musk to confirm.)*
- Browser: React 19 built with Vite 7, React Router 7, Fluent UI React v9, TanStack Query 5. Server: NestJS 11 on Fastify 5. Shared validation: Zod 4. Database access: Kysely 0.28. Full stack and versions in architecture §4.3.
- A browser application draws the screens and calls a server programming interface. Both are served from the same address.
- The server holds the session. Sign-in with Entra ID or External ID happens on the server, and the browser receives only a session cookie. That cookie cannot be read by page script and is sent only on the portal's own requests. Access tokens never reach the browser.
- Every changing call also carries an anti-forgery token (T-21).
- Every authorisation check happens on the server's interface. The browser hiding a button is never the control.
- Database access uses Kysely, a typed query builder with dialects for both SQL Server and SQLite (ADR-13). The ledger tables, column grants, triggers and full-text indexes are hand-written SQL migrations for each database, because no data library models them.

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| C# on ASP.NET Core with pages rendered on the server (the architect's recommendation) | Fewer moving parts: no separate interface to secure, and the skill set most common among Microsoft-ecosystem support partners (ADR-02). **Rejected by the FDE's decision on 2026-09-26.** The FDE's reason is to be stated at the gate, so the EA can weigh it. The architect's case is kept here so it can be revisited |
| TypeScript with tokens held in the browser (a pure single-page application talking to the interface with bearer tokens) | Tokens in the browser can be stolen by any script injected into the page, and signing out cannot revoke them before they expire. The server-held session keeps N-08 and N-09 (next action refused) simple |
| Java with Spring | Capable, but less common among Microsoft-ecosystem partners and not what the FDE chose |
| Prisma (an object-relational mapper) instead of Kysely | Popular and productive, but it models neither ledger tables nor SQLite triggers. It would hide the SQL where the design's guarantees live (§5.3, §5.6) |
| Next.js (server-rendered React framework) instead of NestJS and a Vite React app | Merges browser and server into one framework. But its server side is built for rendering pages rather than for a guarded interface with modules, and its release pace would be harder for a business-hours partner to follow |
| Node 20, as the EA's direction worded it | End-of-life since 30 April 2026: no security fixes, and libraries are dropping it. The FDE chose Node 24 |

**Consequences**

- Two things to build and secure: the browser application and the interface. Every backlog "sent directly" criterion is now a direct call to the interface, and QA tests each one at the interface, not through the screen.
- Cross-site request forgery becomes a live threat (T-21) and needs its own control and test.
- The support partner must have TypeScript/Node skills as well as Azure skills. Among Microsoft-ecosystem partners that narrows the field, and it becomes a selection criterion for the partner contract (Q-07).
- The ledger tables and full-text search sit outside what the data library understands. Those parts are plain SQL that the partner must be able to read.
- A richer, more responsive interface is possible. The self-refreshing open requests list (N-03) is natural in this stack.

**Revisit when**

The support partner Bow contracts has no Node capability. Or Bow later needs a public interface for electronic quote exchange (BRD §4.2), which would be a separate, versioned interface, never the portal's private one.

---

## ADR-11 — The catalog and pricing store is built in the portal's database; Business Central is recorded as the future path, not adopted

- **Status**: Proposed (new in revision 2)
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE), who instructed that the store must deliver the approved backlog as written and that a bought product which would change the backlog is recorded as a considered option, not the decision. To be agreed by Elon Musk (EA) at g3

**Context**

Bow is replacing a spreadsheet ERP. It already pays for Microsoft 365, so Dynamics 365 Business Central is an obvious question. The store must deliver epic-01 and story-04-01 as written (C-12). The forcing question: should Bow's product and price master live in a product it buys, or in the portal?

**Decision**

Build the store as the portal's catalog and pricing module (architecture §2.4, option 1). Keep that module's storage behind its own code, so that it is the only thing that moves if Bow later adopts an ERP.

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| **Dynamics 365 Business Central** as the store (candidate B) | Cannot deliver the approved backlog as written (C-12, architecture §2.4). story-01-01 c4 (duplicate rows both refused) needs a pre-check outside Business Central. The price and discount history lives in a change log that permitted users can delete, which is weaker than BR-17 with BR-19. story-01-04 c3–c4 and story-04-01 c4 (a reseller refused **and recorded** on a store page) cannot be tested when resellers have no Business Central account. story-01-05's naming becomes Business Central administration. Search needs a synchronised copy, so closing a product disappears from search late (BR-18). Costs about US$240 a month in licences for 3 named users (Essentials at US$80, list), plus a second partner |
| Dataverse as the store | Administrators can delete audit history (BR-17, BR-19). Per-user licensing (ADR-01, candidate C) |
| Keep the Excel ERP and read it from the portal | Forbidden by NF-01 and D-06 |

**Consequences**

- Bow gets a store that does exactly what the backlog asks and nothing more. It is not an ERP. Orders, invoicing and stock, if Bow later wants them, will need a real ERP.
- If that ERP is Business Central, the store's data must be migrated into it, and epic-01's stories revisited through the change process. The catalog and pricing module is drawn so that only its storage moves. Quote lines keep their copied prices (ADR-05), so past quotes are unaffected.
- Converting approved quotes into Business Central sales orders would open a path to shipment. Before that is built, a screening gate that shipment cannot bypass must be designed, following the `electronics-distribution-compliance-screening-gate` playbook (architecture §2.4, §8.4).

**Revisit when**

Bow decides to buy an ERP for orders, invoicing or stock. Or the reseller terms prove richer than one discount per reseller (A-07), which would make an ERP's pricing engine worth its cost.

---

## ADR-12 — GitHub Actions and Bicep: one artifact built once, promoted from test to production through a staging slot, with contract tests on both databases

- **Status**: Proposed (new in revision 2)
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE). To be agreed by Elon Musk (EA) at g3

**Context**

Bow has no IT team, and will inherit the repository and the pipeline at handover. A partner must be able to rebuild everything, including after losing a region (§7.3). The forcing question: where do code, pipeline and infrastructure definitions live, and what stops an unreviewed change reaching production?

**Decision**

- The repository is on GitHub, in an organisation owned by Bow from the start. The delivery team works inside it.
- GitHub Actions runs the pull request checks, builds one artifact, deploys it to test, and then, after a named approval, deploys it to the production staging slot and swaps it in (architecture §4.6).
- Every Azure resource is defined in Bicep in the same repository.
- The pipeline signs in to Azure by federated identity, with no stored secret.
- Database contract tests run on SQLite and on SQL Server 2022 (a container on the CI runner) for every pull request (§5.6).

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| Azure DevOps (Repos and Pipelines) | Equally capable and Microsoft's own. Rejected because GitHub's free organisation plan covers this pipeline's use, GitHub is more commonly known by TypeScript developers (ADR-10), and its code scanning and dependency alerts come with it. It would be the right choice if Bow's partner works only in Azure DevOps |
| Terraform instead of Bicep | Works across clouds, which Bow does not need (ADR-02). It is one more tool and state file for the partner to manage |
| Deploying from developers' machines | Nothing records what reached production, or who approved it (T-22). A lost laptop loses the ability to redeploy |

**Consequences**

- Bow must own a GitHub organisation, and name who holds its owner role. Two people, as for Azure (R-01).
- The SQL Server contract tests make each CI run a few minutes longer. That is the price of the Mac staying free of Docker.
- Every production change needs a named approver who is reachable. In business-hours support, releases happen in business hours.

**Revisit when**

The support partner works only in Azure DevOps. Or CI minutes exceed the free allowance for three months running.

---

## ADR-13 — Every external dependency sits behind an adapter with a local stand-in and a real implementation; Stage 1 runs entirely on the FDE's Mac

- **Status**: Proposed (new in revision 2)
- **Date**: 2026-09-26
- **Decided by**: Directed by Elon Musk (EA), relayed by Yash Dixit (FDE) on 2026-09-26. Designed by the architect. Node 24 instead of the direction's Node 20 was the FDE's decision. To be confirmed by Elon Musk at g3

**Context**

Elon Musk directed that demos and Epic Reviews run locally on the FDE's Mac, with stand-ins for every external dependency and real integrations later. One command starts, one resets, the only prerequisite is Node, and there is no Docker, Azure or Microsoft 365 account. Revision 1's demo plan needed an Azure subscription, two sign-in tenants and a verified email domain before the first demo: about three weeks of lead time on a client with no IT team. The forcing question: how does the same code run against stand-ins on a Mac and against Microsoft's services in production, without the stand-ins ever reaching production?

**Decision**

- Six dependencies each sit behind an interface: staff sign-in, reseller sign-in and invitations, database, email, clock, and telemetry. Each has a local stand-in and a real implementation, chosen by configuration at start-up (architecture §4.7). Configuration and secrets are also read through one interface.
- The local database is SQLite (via `better-sqlite3`, installed by npm). The same Kysely queries run on both engines, with per-engine migrations where they differ (§5.6).
- A start-up guard refuses to run with any stand-in on a non-local address or in production mode, and refuses mixed configurations that were not declared. The `/dev` pages are left out of the production build.
- `./scripts/dev.sh` starts everything, and `./scripts/reset.sh` restores the fictional seed (§4.8).
- Stage 2 switches the real adapters on in Azure before go-live. No Epic Review depends on it.

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| Demos in the Azure test environment (revision 1) | Contradicts the EA's direction. It also puts about three weeks of Bow-side setup (subscription, tenants, domain) in front of the first demo |
| Local SQL Server in a container, so the Mac runs the production engine | Needs Docker, which the direction excludes, and SQL Server images with full-text search are not official for Apple silicon |
| PGlite (PostgreSQL compiled for Node) as the local database | Installable by npm too, but its dialect is no closer to SQL Server than SQLite's. Kysely's SQLite support is more mature, and `better-sqlite3` is the most widely used embedded database for Node |
| Stand-ins built into the production code with runtime flags, and no guard | The pick-a-user sign-in would then be one wrong setting away from letting anyone in as anyone (T-23) |
| Mocking Microsoft's own services locally (emulators) | No emulator exists for Entra ID or External ID. Communication Services has none either. The stand-ins would be incomplete copies of services Bow does not control |

**Consequences**

- **Epic Reviews prove the portal's behaviour, not Microsoft's.** Lockout (T-20), invitation expiry by External ID (T-11), real delivery and spam placement (T-18), ledger immunity against administrators (T-16), true concurrency (N-10) and speed (N-01) are proved only in CI on SQL Server or in Stage 2. Architecture §4.7 and §5.6 list each one. Stage 2 is **required before go-live**, even though no Epic Review depends on it.
- Two database migration sets must be kept in step. The contract tests on both engines are what keep them honest, and a gap between them is the most likely thing to go wrong.
- Money and percentages are whole numbers in both databases (§5.2), because SQLite has no exact decimal type.
- The start-up guard and the `/dev` pages are security-relevant code (T-23), and QA tests them.
- The definition-of-done runs of story-01-01 and story-02-02 against the real ERP file happen locally on the FDE's Mac when the ERP owner supplies it (Q-11). The file is commercially sensitive and is deleted afterwards.

**Revisit when**

Stage 2 begins (the real adapters become the default in Azure; the stand-ins remain for development). Or a stand-in behaves differently enough from its real service that a Stage 2 test fails on something an Epic Review passed.
