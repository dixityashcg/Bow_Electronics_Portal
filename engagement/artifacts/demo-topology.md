# Demo topology — Bow Electronics Reseller Portal

**Revision 2, 2026-09-26.** At the direction of Elon Musk (EA), relayed by Yash Dixit (FDE), every Epic's demonstration and Epic Review runs **locally on the FDE's Mac**, with a stand-in for every external dependency (architecture §4.7, ADR-13). Revision 1's plan ran demos in an Azure test environment. That environment, and every real integration, is now a later stage and is not a condition of any Epic Review (below).

**What every demo runs on.**
- **The runtime.** One command, `./scripts/dev.sh`, starts the whole portal on `http://localhost:3000`: both sign-in entrances, the internal side, the store, the local mailbox at `/dev/mailbox` and the development sign-in at `/dev/sign-in`. Before each Epic Review, `./scripts/reset.sh` restores the fictional seed data (architecture §4.8). `./scripts/reset.sh --after-epic NN` starts from the state the previous Epic's demo leaves.
- **The only prerequisite** is Node.js 24 LTS on the Mac. There is no Docker, and no Azure or Microsoft 365 account. The EA's direction said Node 20, but Node 20 reached end-of-life on 30 April 2026, so the FDE chose Node 24 on 2026-09-26. Elon Musk to confirm (architecture Q-10).
- **Sign-in.** At `/dev/sign-in`, pick a seeded user: reseller admin, reseller buyer, rep, price maintainer, discount setter, internal admin or role manager. This is the same interface that Entra ID and External ID will sit behind in Stage 2.
- **Email.** Every email is captured, not sent. "Open the mailbox" in the backlog's demo-notes means `/dev/mailbox`, filtered to that recipient. "Email sending switched off" (epic-02 step 10) means the **Refuse sending** switch on that page.
- **Data.** A synthetic Excel price list of about 2,000 fictional parts, including deliberately bad rows. Fictional resellers, users and signed standard discounts. No real Bow data is used in any demo.

**Not an Epic Review prerequisite, but still required by the approved backlog.** story-01-01's definition of done requires one run against a copy of the real ERP spreadsheet, and story-02-02's a check against the loaded ERP data. Those runs happen **on the same Mac, with the same command**, once the ERP owner (named by Elon Musk, architecture C-10) supplies the file. The file is deleted afterwards. The two stories count as done only after that. The Epic Review itself does not wait for it (architecture Q-11).

## Later stage — Azure and the real integrations (not a condition of any Epic Review)

Required before go-live, in this order. None of it blocks an Epic Review. Where the owner is `ea-elon`, Elon Musk owns naming the person and making sure the step happens, and **Bow's Microsoft 365 administrator performs it** (architecture Q-06), following the FDE's written instructions.

| Stage 2 step | Owner | Lead time |
| --- | --- | --- |
| Bow Azure subscription with two named owners (R-01), set up by Bow's Microsoft 365 administrator (Q-06) | ea-elon | 10 business days |
| The portal registered as an application in Bow's Entra ID | ea-elon | 2 business days after the administrator is named |
| Entra External ID tenants (test and production) | ea-elon | 3 business days |
| A sending domain in Communication Services, with SPF and DKIM records added by Bow's DNS owner | ea-elon | 5 business days |
| Test and production environments provisioned from Bicep, and the pipeline deploying to them (ADR-12) | fde-yash | 3 business days after the subscription |
| Real adapters switched on in test; the Stage 2 checks run (architecture §4.7, §5.6: lockout, invitation expiry, delivery and SPF/DKIM, ledger verification, concurrency, the N-01 load test, the restore drill) | fde-yash | 10 business days |
| Go-live load rehearsal with the real ERP file in test | ea-elon (via the ERP owner) | 5 business days after the owner is named |

## Epic: epic-01
- **runtime**: local — `./scripts/dev.sh` on the FDE's Mac, `http://localhost:3000`; start from `./scripts/reset.sh` (empty store; the demo loads `seed/sample-erp.xlsx` through the real load, story-01-01); sign in at `/dev/sign-in` as rep Pat (price maintainer), rep Sam, and role manager Morgan
- **run by**: fde-yash
- **prerequisites**:

| Prerequisite | Owner | Lead time |
| --- | --- | --- |
| Node.js 24 LTS installed on the Mac (`nvm install 24`) | fde-yash | 10 minutes, once |
| `./scripts/reset.sh` run before the review | fde-yash | 1 minute |

## Epic: epic-02
- **runtime**: local — `./scripts/dev.sh` on the FDE's Mac, `http://localhost:3000`; start from `./scripts/reset.sh --after-epic 01` (store loaded, one product closed for quoting); sign in at `/dev/sign-in` as a rep, then Demo Reseller A's admin and Demo Reseller B's user; emails at `/dev/mailbox`, with **Refuse sending** for step 10
- **run by**: fde-yash
- **prerequisites**:

| Prerequisite | Owner | Lead time |
| --- | --- | --- |
| `./scripts/reset.sh --after-epic 01` run before the review | fde-yash | 1 minute |

## Epic: epic-03
- **runtime**: local — `./scripts/dev.sh` on the FDE's Mac, `http://localhost:3000`; start from `./scripts/reset.sh --after-epic 02`; sign in as rep Sam and rep Alex in two browser windows (one of them private, so their sessions stay separate), and as internal admin Jo; emails at `/dev/mailbox`
- **run by**: fde-yash
- **prerequisites**:

| Prerequisite | Owner | Lead time |
| --- | --- | --- |
| `./scripts/reset.sh --after-epic 02` run before the review | fde-yash | 1 minute |

## Epic: epic-04
- **runtime**: local — `./scripts/dev.sh` on the FDE's Mac, `http://localhost:3000`; start from `./scripts/reset.sh --after-epic 03` (open requests from Demo Resellers A and B; neither has a standard discount, while seeded Resellers C–E carry signed discounts); sign in as rep Lee (discount setter), a rep not named, and rep Sam; emails at `/dev/mailbox`
- **run by**: fde-yash
- **prerequisites**:

| Prerequisite | Owner | Lead time |
| --- | --- | --- |
| `./scripts/reset.sh --after-epic 03` run before the review | fde-yash | 1 minute |

## Epic: epic-05
- **runtime**: local — `./scripts/dev.sh` on the FDE's Mac, `http://localhost:3000`; start from `./scripts/reset.sh --after-epic 04`, which seeds one sent quote and a second quote sent "yesterday" with valid-until yesterday, created through the portal's own operations with the clock adapter moved back a day (architecture §4.7); sign in as a Demo Reseller A user who is not the requester, and as rep Sam; emails at `/dev/mailbox`
- **run by**: fde-yash
- **prerequisites**:

| Prerequisite | Owner | Lead time |
| --- | --- | --- |
| `./scripts/reset.sh --after-epic 04` run before the review | fde-yash | 1 minute |

## Epic: epic-06
- **runtime**: local — `./scripts/dev.sh` on the FDE's Mac, `http://localhost:3000`; start from `./scripts/reset.sh --after-epic 02` (Demo Reseller A with an admin and a buyer who has made a request); sign in as Demo Reseller A's admin, another buyer, and Demo Reseller B's user; invitations at `/dev/mailbox`
- **run by**: fde-yash
- **prerequisites**:

| Prerequisite | Owner | Lead time |
| --- | --- | --- |
| `./scripts/reset.sh --after-epic 02` run before the review | fde-yash | 1 minute |
