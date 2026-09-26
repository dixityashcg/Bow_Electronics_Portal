# Demo topology — Bow Electronics Reseller Portal

Each Epic's demonstration runs in the **Azure test environment** (architecture §4, ADR-02), not on a laptop. There are three reasons:
- Both sign-in services are Microsoft cloud tenants, and they are needed from the first demo.
- The epic-01 demo loads a copy of Bow's real price list, which should not sit on a laptop.
- The epic-05 demo needs a quote sent the day before, kept in a database that stays up overnight.

The test environment is an App Service and an Azure SQL database in Bow's Azure subscription. Emails go to real test mailboxes in Bow's Microsoft 365 tenant, so the demo shows real email delivery. The build team's own development runs locally. That is not where demos happen.

For the "email sending switched off" steps (epic-02 step 10), the test environment's sending credential is replaced with an invalid one in the App Service settings and restored afterwards. The test environment's retry window is set to 1 minute (production: 10) so that the failure appears during the demo.

`<test>` below means the test environment's address, which is assigned when the environment is provisioned.

**Who performs the setup.** Bow has no IT operations team, but it does have a Microsoft 365 administrator. That person performs the one-off Azure and Entra steps below: creating the subscription, registering the application, creating the External ID tenant, and creating test accounts and mailboxes (decided by Yash Dixit, FDE, 2026-09-26). Elon Musk owns naming them and making sure it happens. Yash Dixit's team supplies step-by-step instructions for each step, so the administrator needs no Azure experience. Rows marked *(M365 admin)* are performed by that person.

The owners in the tables are the engagement's people: `fde-yash` (Yash Dixit), `ea-elon` (Elon Musk), `po-jensen` (Jensen Huang), and `partner`, meaning the support partner once contracted; until then, `fde-yash` stands in.

## Epic: epic-01
- **runtime**: Azure test environment — App Service `https://<test>/sales` (HTTPS, port 443), Azure SQL test database, empty store; the store is filled during the demo by the go-live load from a copy of the real ERP spreadsheet; deployed from the build pipeline
- **run by**: fde-yash
- **prerequisites**:

| Prerequisite | Owner | Lead time |
| --- | --- | --- |
| Bow Azure subscription created, with two named owners (R-01) *(M365 admin)* | ea-elon | 10 business days |
| Bow's Microsoft 365 administrator named, as the person who performs the setup (Q-06) | ea-elon | 3 business days |
| Portal registered as an application in Bow's Entra ID *(M365 admin)* | ea-elon | 2 business days after the administrator is named |
| Excel ERP owner named (NF-03, C-10) | ea-elon | 5 business days |
| A copy of the real ERP spreadsheet, and its columns mapped with the ERP owner (story-01-01 DoD) | ea-elon (via the named ERP owner) | 5 business days after the owner is named |
| Test staff accounts in Bow's Entra ID for Jensen Huang (role manager), a price maintainer, rep Pat, and a rep with no role | ea-elon | 2 business days (M365 admin) |
| Two role managers named for seeding (architecture §10) | po-jensen | 2 business days |
| Test environment provisioned and the build pipeline deploying to it | fde-yash | 3 business days after the subscription |

## Epic: epic-02
- **runtime**: Azure test environment — `https://<test>/` (reseller entrance) and `https://<test>/sales`, port 443; store already loaded in the epic-01 demo; reseller sign-in via the portal's External ID test tenant; emails through Azure Communication Services to Bow Microsoft 365 test mailboxes
- **run by**: fde-yash
- **prerequisites**:

| Prerequisite | Owner | Lead time |
| --- | --- | --- |
| epic-01 demo data still in the test database (loaded store) | fde-yash | none |
| Entra External ID tenant for the portal created in Bow's subscription *(M365 admin, following the FDE's instructions)* | ea-elon | 3 business days |
| A sending domain for test email (a Bow subdomain), with its SPF and DKIM records added by Bow's DNS owner | ea-elon | 5 business days |
| Four test mailboxes in Bow's Microsoft 365 (Reseller A admin, Reseller A buyer, Reseller B user, rep) | ea-elon | 2 business days (M365 admin) |
| A product closed for quoting in the epic-01 demo (demo step 3) | fde-yash | none |

## Epic: epic-03
- **runtime**: Azure test environment — `https://<test>/sales`, port 443; data from the epic-01 and epic-02 demos; two rep accounts and one internal admin account
- **run by**: fde-yash
- **prerequisites**:

| Prerequisite | Owner | Lead time |
| --- | --- | --- |
| Test staff accounts for rep Sam, rep Alex and internal admin Jo | ea-elon | 2 business days (M365 admin) |
| Jensen Huang confirms who gives the internal admin role (story-03-06 DoD) | po-jensen | before the demo |
| A second browser profile or machine, so two reps are signed in at once (demo step 5) | fde-yash | none |

## Epic: epic-04
- **runtime**: Azure test environment — `https://<test>/sales` and `https://<test>/`, port 443; an open request from the epic-03 demo; Reseller A with no discount at the start, Reseller B left with none
- **run by**: fde-yash
- **prerequisites**:

| Prerequisite | Owner | Lead time |
| --- | --- | --- |
| A discount setter named (story-01-05) with a test account | po-jensen | 2 business days |
| Default quote validity period named (A-14, story-04-05 DoD) | po-jensen | before the demo |
| Net price rounding rule agreed (story-04-02 DoD, architecture §5.2) | po-jensen | before the build of story-04-02 |

## Epic: epic-05
- **runtime**: Azure test environment — `https://<test>/` and `https://<test>/sales`, port 443; a sent quote from the epic-04 demo, plus a second quote sent the business day before the demo with valid-until set to that day
- **run by**: fde-yash
- **prerequisites**:

| Prerequisite | Owner | Lead time |
| --- | --- | --- |
| The second quote sent the day before, valid until that day (demo-notes) | fde-yash | 1 business day |
| Bow's business time zone configured (Q-03, ADR-08) | ea-elon | before the build of story-05-04 |
| Wording of the approval statement agreed (story-05-01 DoD) | po-jensen | before the demo |

## Epic: epic-06
- **runtime**: Azure test environment — `https://<test>/`, port 443; Reseller A with an admin and a buyer who has made a request (from the epic-02 demo)
- **run by**: fde-yash
- **prerequisites**:

| Prerequisite | Owner | Lead time |
| --- | --- | --- |
| Two further Microsoft 365 test mailboxes (a new buyer and a second buyer at Reseller A) | ea-elon | 2 business days (M365 admin) |
