# Baseline — Bow Electronics Reseller Portal

This is a greenfield repository: there is no existing system to assess.

The architecture that follows is unconstrained by prior structure. Record
here anything that does constrain it — an organisational standard, a
platform the client already runs, a technology they have committed to —
so a reader later understands what was a choice and what was a given.

## Given constraints

<!-- Platforms, standards, or commitments that shaped the design. -->

- **Bow has no IT operations team.** Anything built must be run on managed services by an external support partner in business hours. Answered by Yash Dixit (FDE), 2026-09-26. Carried as architecture C-05.
- **Bow's staff use Microsoft 365.** Bow's staff identities are therefore already held in Microsoft Entra ID, which points the design at Azure. Answered by Yash Dixit (FDE), 2026-09-26. Carried as architecture C-02.
- **The Excel ERP** is the only existing system the work touches. It is read once at go-live and then frozen (BRD NF-01, D-03). It has no named owner yet (NF-03). Carried as architecture C-01 and C-10.
- **No other system exists to integrate with.** There is no CRM, no order system and no stock system (BRD §2, D-02). Nothing the architecture adds replaces something else that runs today.
