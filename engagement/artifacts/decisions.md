# Architecture Decisions — Bow Electronics Reseller Portal

**Prepared by**: Yash Dixit · **For review by**: Elon Musk

Each record below is a decision that would be expensive to reverse: where state lives, how people sign in, how records are kept, and what Bow is committing to run. Every record is **Proposed**. The operator made it on 2026-09-26, and it becomes **Accepted** only when Elon Musk (Enterprise Architect) agrees it at the architecture gate. No record claims a client stakeholder's agreement that has not been given.

The answers the FDE gave on 2026-09-26 are quoted where a decision rests on them: managed services plus a support partner, Microsoft 365, a managed identity service, and random request IDs.

---

## ADR-01 — One web application with four modules and one database, built for Bow

- **Status**: Proposed
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE). To be agreed by Elon Musk (EA) at g3

**Context**

The backlog asks for about 25 screens across two audiences, a catalog and pricing store, and one email path. Bow has no IT operations team and will run the portal through a support partner in business hours (architecture C-05). The volumes are unknown but, on every indication in the brief, small (§7.1). The forcing question: what is the smallest number of moving parts that delivers all six Epics and that a support partner can run without an on-call engineer?

**Decision**

One TypeScript web application (ADR-10), deployed as a single unit: a browser application and its server programming interface on one address. It holds four modules: Access, Catalog and pricing, Quote workflow, and Notifications. Each owns its own tables in one Azure SQL database, and another module may use them only through that module's code.

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| Separate services per area (catalog service, quote service, notification service), talking over a message broker | C-05: Bow cannot operate several deployables, a broker, and the distributed failure modes between them. Nothing in the backlog needs parts to scale or ship separately at these volumes |
| A low-code portal on Microsoft Power Pages with Dataverse | A competent choice for a Microsoft 365 company. Rejected on two constraints. First, BR-19 and A-08 need records that nobody can edit or delete, and in Dataverse an administrator can. Second, reseller users are licensed per user per month, so the cost grows with every reseller Bow onboards. It would also need Power Platform skills that Bow does not have and its partner may not have |
| Buying a packaged quoting or B2B portal product | Not put to the client. The brief records a preference to build a portal, and on 2026-09-26 the FDE chose not to reopen buy-versus-build. Recorded so that the EA can reopen it at the gate if he wants to |
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

Use Azure App Service (Linux, two instances in production), Azure SQL Database (General Purpose, 35-day point-in-time restore, geo-redundant backups), Azure Communication Services Email, Azure Key Vault and Application Insights. Production and test run in one Azure subscription owned by Bow. The region is **provisional**: Bow's home geography, confirmed by Elon Musk once NF-07 (which data protection law applies) is answered.

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| AWS or Google Cloud equivalents | Technically equal. Rejected because staff sign-in is Bow's Microsoft Entra ID either way, so another cloud adds a second vendor, a second bill and a second set of partner skills for no gain |
| Azure Container Apps or Kubernetes (AKS) | Container orchestration is more than a business-hours partner should have to run for one application (C-05). App Service gives deployment slots, scaling and patching without it |
| Virtual machines | Bow, or the partner, would own patching, backups and failover. That is exactly the capability Bow lacks |
| A single App Service instance | Cheaper. But every platform patch or instance fault is then an outage, and N-05 (99.5 %) would depend on luck |

**Consequences**

- Bow is committed to Azure for this portal. Moving would mean re-platforming the database, email and hosting, although the application itself uses no Azure-only programming interface except the sign-in services.
- Bow must hold an Azure subscription, pay a monthly bill, and name who owns it (at most two people with owner rights, R-01).
- Running cost is indicatively in the low hundreds of US dollars a month for production and test together at §7.1 volumes. The FDE produces the real figure with Azure's pricing calculator for Bow's region before the gate.
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

## ADR-07 — Emails go through an outbox in the database and a background worker to Azure Communication Services

- **Status**: Proposed
- **Date**: 2026-09-26
- **Decided by**: Yash Dixit (FDE). To be agreed by Elon Musk (EA) at g3

**Context**

BR-07 and BR-13 require an email within 15 minutes, and require that when one cannot be sent the request is still recorded **and** Bow can see the failure. A request must never be lost because email was down, and an email must never be lost because the page crashed after the request was saved. The forcing question: how does a failed email become visible instead of silent, without making the request depend on the email?

**Decision**

- The event (a request recorded, a quote sent, a response given, a user added) and its email are written in **one database transaction**, with the email as a row in an outbox table.
- A background worker inside the application picks pending rows every 30 seconds, using a database lock so that two instances never pick the same row. It sends them over SMTP to Azure Communication Services Email, from Bow's domain.
- A refusal is retried every minute for 10 minutes. After that the row is marked failed with the provider's reason. Failed confirmation and quote ready emails show on the failed emails list, and the partner is alerted on any failure.
- "Cannot be sent" means refused when sending (backlog assumption). An email accepted and later bounced is not caught (R-02).

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| Send the email inside the page request | If email is down, either the request fails (breaks BR-07's "stays recorded") or the email is lost silently (breaks "Bow can see it failed") |
| A message queue service (Azure Service Bus) between the application and the sender | Solves the same problem with one more managed service to pay for, watch and understand (C-05). The outbox gives the same guarantee inside the database the partner already runs |
| Send from a Bow Microsoft 365 mailbox | Microsoft 365 limits how much a mailbox may send and is moving away from the sign-in method applications use to send mail. Failures come back as bounce messages in a mailbox, not as refusals the portal can list |

**Consequences**

- An email can occasionally be sent twice: if the worker crashes after the service accepts it but before the row is marked. A duplicate confirmation is harmless. This is accepted.
- Bow's DNS owner must add the service's domain records (SPF, DKIM) before go-live, or emails land in spam (T-18).
- The sending credential expires every 12 months, and if nobody rotates it all email stops. The failed list and the alert make that visible within 15 minutes, and the runbook schedules the rotation (T-17).
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

Part numbers are matched exactly, ignoring case, on an index. Description words use Azure SQL Database full-text search. Search text is passed as a parameter and treated only as words (T-13). Closed products are excluded in the same query.

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

- TypeScript throughout, on a current long-term-support Node.js release on Azure App Service.
- A browser application draws the screens and calls a server programming interface. Both are served from the same address.
- The server holds the session. Sign-in with Entra ID or External ID happens on the server, and the browser receives only a session cookie. That cookie cannot be read by page script and is sent only on the portal's own requests. Access tokens never reach the browser.
- Every changing call also carries an anti-forgery token (T-21).
- Every authorisation check happens on the server's interface. The browser hiding a button is never the control.
- Database access uses a TypeScript data library that supports SQL Server. The ledger tables, column grants and full-text index are created by hand-written SQL migrations, because such libraries do not model them.

**Alternatives rejected**

| Alternative | Why not |
|---|---|
| C# on ASP.NET Core with pages rendered on the server (the architect's recommendation) | Fewer moving parts: no separate interface to secure, and the skill set most common among Microsoft-ecosystem support partners (ADR-02). **Rejected by the FDE's decision on 2026-09-26.** The FDE's reason is to be stated at the gate, so the EA can weigh it. The architect's case is kept here so it can be revisited |
| TypeScript with tokens held in the browser (a pure single-page application talking to the interface with bearer tokens) | Tokens in the browser can be stolen by any script injected into the page, and signing out cannot revoke them before they expire. The server-held session keeps N-08 and N-09 (next action refused) simple |
| Java with Spring | Capable, but less common among Microsoft-ecosystem partners and not what the FDE chose |

**Consequences**

- Two things to build and secure: the browser application and the interface. Every backlog "sent directly" criterion is now a direct call to the interface, and QA tests each one at the interface, not through the screen.
- Cross-site request forgery becomes a live threat (T-21) and needs its own control and test.
- The support partner must have TypeScript/Node skills as well as Azure skills. Among Microsoft-ecosystem partners that narrows the field, and it becomes a selection criterion for the partner contract (Q-07).
- The ledger tables and full-text search sit outside what the data library understands. Those parts are plain SQL that the partner must be able to read.
- A richer, more responsive interface is possible. The self-refreshing open requests list (N-03) is natural in this stack.

**Revisit when**

The support partner Bow contracts has no Node capability. Or Bow later needs a public interface for electronic quote exchange (BRD §4.2), which would be a separate, versioned interface, never the portal's private one.
