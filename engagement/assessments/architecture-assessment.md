# Self-assessment — Solution Architecture

<!--
  Internal working evidence. This does NOT go to the client, and its content
  must not appear in the deliverable.

  The criteria below are generated from the phase's rubric — the same rubric
  the operator reviews at the gate. Do not add, remove, or reword them here.
  An assessment that could restate its own criteria would be a second copy of
  them, and the two would drift within a release.

  Every criterion needs a verdict. Write one of:

    Pass    — the deliverable meets it, and you can say where
    Fail    — it does not; name the exact section, row, or id that fails
    N/A     — it does not apply, with the reason

  A blank cell, or one reading "partially" or "see below", is not a verdict.
  `raise phase complete` refuses the phase until every criterion carries one,
  because an unreadable verdict read as a pass is the failure this file exists
  to prevent.
-->

**Rubric**: `architecture` · **Deliverable**: architecture

| Criterion | Verdict | Where it fails, or why not applicable |
|---|---|---|
| `requirements-traced` (**blocking**) | Pass | architecture §9.1 maps BR-01–BR-20 and NF-01–NF-10 to components or a stated deferral (NF-03 owner, NF-07, NF-08 provisional; NF-04/05/06/10 are go-live commitments). §9.2 maps every component back, including the three the stories only delegate: refused attempts list (story-01-04 DoD), role manager (story-01-05 c5, story-03-06 c4), one-time submission key (T-12 mitigation of BR-06). |
| `decisions-carry-alternatives` (**blocking**) | Pass | decisions.md ADR-01 to ADR-10 each list 2–4 rejected alternatives with the constraint that eliminated each (C-05 operability, story criteria, BR-19, token renewal delay, etc.). ADR-01 states honestly that buy-vs-build was not put to the client. ADR-10 is the weakest: its main alternative, C# (the architect's recommendation), was eliminated by the FDE's decision, and the reason is still to be stated at the gate. Its other two alternatives name constraints (tokens held in the browser; partner skills). |
| `decisions-carry-consequences` (**blocking**) | Pass | Each ADR's Consequences names costs: e.g. ADR-04 mistakes uncorrectable in place and schema changes constrained; ADR-06 harder to read out; ADR-07 duplicate sends, credential expiry; ADR-09 no typo tolerance. |
| `decisions-have-revisit-conditions` (**blocking**) | Pass | Every ADR has a Revisit when with a volume, dependency or event (e.g. ADR-01 volumes >2× §7.1; ADR-09 >500,000 products or N-01 missed). |
| `trust-boundaries-drawn` (**blocking**) | Pass | architecture §8.1 names B1–B9 where control changes hands, three inside the system (B2 reseller-to-reseller, B3 non-admin-to-admin, B6 rep-to-privileged); §5.4 gives each data class with who reads and changes it. |
| `threats-name-consequences` (**blocking**) | Pass | §8.2 T-01–T-19 each name the data and the party, e.g. T-01 Reseller B learns Reseller A's net prices and can derive its discount; T-14 every quote from go-live carries a wrong price. |
| `accepted-risks-owned` (**blocking**) | Pass | §8.3 R-01–R-05 each name Yash Dixit (FDE) as provisional acceptor on 2026-09-26, to be ratified by Elon Musk at g3 — no stakeholder recorded as accepting what they have not seen. Yash Dixit confirmed the provisional acceptance in session on 2026-09-26. R-06 (no web application firewall) was added from the critique. |
| `mitigations-are-testable` (**blocking**) | Pass | Every §8.2 mitigation carries a QA: line stating the attempt and observable outcome (e.g. T-15 run the load twice; second refused, store unchanged). T-20 (lockout) and T-21 (cross-site forgery) were added from the critique, each with a QA attempt. |
| `nonfunctional-targets-are-numbers` (**blocking**) | Pass | §7.2 N-01–N-12, N-14 each have a number and a verification method; N-13 accessibility recorded as not committed; N-05 marked not client-committed pending Jensen Huang. Sizing assumptions stated in §7.1 because NF-08 is uncounted. |
| `existing-system-constraints-carried` (**blocking**) | N/A | Greenfield: no as-is assessment §6. The baseline's given constraints (no IT team, Microsoft 365, Excel ERP, no other systems) are carried as architecture C-01, C-02, C-05, C-10. |
| `summary-readable-cold` (advisory) | Pass | §1 names approach, five decisions, running cost (indicative, to be priced by FDE) and what it does not attempt; §1–§2 use Bow's names (the ERP, catalog and pricing store) and explain Entra ID / External ID / Communication Services at first use. Weakness: Azure product names remain dense for a business sponsor. |
| `buildable-in-slices` (advisory) | Pass | §9.3: only epic-01 carries the walking skeleton; epic-02 adds two external services; epic-03–06 add only pages and module code. The fixed epic-01→05 chain is the backlog's business-process order, not the architecture's. For the FDE to judge. |
| `operable-by-this-client` (advisory) | Fail | Passed in form (managed services only, one app, one DB, runbooks in §10) but it depends on a support partner who is not yet contracted and on an Azure subscription owner Bow has not named. Without the partner, nobody at Bow can restore, rotate the email credential (T-17) or respond to alerts. Recorded in §10 as a go-live precondition. The FDE decided it does **not** block go-live (interim delivery-team support), which weakens this further. The choice of TypeScript (ADR-10) also narrows which Microsoft-ecosystem partners can take it on, and the one-off setup rests on a Microsoft 365 administrator nobody has named yet. The EA judges. |
| `decisions-worth-recording` (advisory) | Pass | Ten records, each expensive to reverse (data residency, immutability, printed IDs, identity, platform, language). Checked for missing: Azure region folded into ADR-02 as provisional rather than its own record; personal-data erasure design deferred into ADR-04's revisit condition. For the FDE to judge whether ADR-09 (search) earns its place. |

## What to check for each criterion

- `requirements-traced` — every approved requirement appears against a component or a stated deferral, and no component exists that traces to no requirement (§9 Traceability)
- `decisions-carry-alternatives` — every decision record names at least one rejected alternative with the constraint that eliminated it, or states explicitly that none was considered and why (decisions.md, each ADR)
- `decisions-carry-consequences` — every decision record states at least one cost, limitation, or thing it forecloses — not only benefits (decisions.md, each ADR)
- `decisions-have-revisit-conditions` — every decision record names the condition under which it should be reopened — a volume, a date, or a change in a dependency (decisions.md, each ADR)
- `trust-boundaries-drawn` — the threat model names each boundary where control changes hands, and each data class with who may read and change it (§8 Security)
- `threats-name-consequences` — every threat states what specifically happens if it fires, naming the data and the party, rather than a category such as breach or injection (§8 Security)
- `accepted-risks-owned` — every accepted risk names the person who accepted it and the date (§8 Security)
- `mitigations-are-testable` — every mitigation is phrased as something QA could attempt and observe, rather than as an instruction to implement (§8 Security)
- `nonfunctional-targets-are-numbers` — every non-functional target states a number and how it will be measured, or is recorded as not committed (§7 Non-functional targets)
- `existing-system-constraints-carried` — for a brownfield engagement, every constraint from the as-is assessment appears in the design or is explicitly addressed (§3 Constraints, as-is assessment §6)
- `summary-readable-cold` — the executive summary names the approach, the decisions that matter most, what it costs to run and what it does not attempt, and §1–§2 use the client's names for their systems with no unexplained acronym (§1 Executive summary, §2 Context)
- `buildable-in-slices` — whether the Epics in the approved backlog can each be built and demonstrated against this design, rather than requiring most of the architecture to exist first — judged by FDE
- `operable-by-this-client` — whether the client's own team could run, monitor, and recover this — as opposed to whether it is well designed in the abstract — judged by EA
- `decisions-worth-recording` — whether each decision recorded would genuinely be expensive to reverse, and whether any decision of that kind is missing — judged by FDE

## Weakest points

<!--
  Report these to the operator in plain language, before they ask.

  An assessment that finds nothing wrong is not a strong result — it is one
  that was not run. Every real deliverable has a weakest point, and naming it
  yourself is what makes the rest of the assessment worth reading.
-->

1. **Operability rests on a support partner who does not exist yet.** Every runbook, alert and restore in §10 has that partner as its actor. Until the contract is signed, the design is operable only by the delivery team.
2. **Sizing is assumed, not measured** (§7.1, NF-08). N-01 and ADR-01/ADR-09 rest on 250,000 products and 1,000 requests a day, which are guesses. Real counts may well be far smaller, which is safe, but they have not been confirmed.
3. **Ledger tables make every data-model mistake permanent.** §5.1 has to be right before go-live, and the EA should review it with that in mind.
4. **Rep-entered received time** (Q-02): the requests re-entered on go-live day all take the go-live timestamp, so the oldest-first list is wrong on its first morning.
5. **Region and personal-data law are unknown** (NF-07, R-04). The region is the most expensive thing here to change later, and it is still provisional.
6. **Running cost is indicative only.** The FDE must price it before the gate. Stating a figure I cannot verify would be worse.
7. **ADR-10's rejected alternative has no stated reason.** The FDE chose TypeScript over the recommended C#, and the reason is to be given at the gate. Until it is, the record shows a decision whose main alternative was eliminated by preference, not by a constraint.
8. **The setup depends on a Microsoft 365 administrator nobody has named.** If Bow has none, epic-01 cannot start on time (demo-topology).
