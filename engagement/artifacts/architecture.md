# Solution Architecture — Bow Electronics Reseller Portal

**Status**: Draft · **Prepared by**: Yash Dixit · **For approval by**: Elon Musk

<!--
  Read cold by an Enterprise Architect who will be held accountable for
  approving it, and later by the client's own team who will run it. §1 and §2
  are for the business reader as much as the technical one: no unexplained
  acronym, the client's names for their systems (artifacts/glossary.md).
  In an existing codebase, reference the as-is assessment throughout.
-->

## 1. Executive summary

<!-- What we are building, in the shape it will take, in five sentences: the
     approach, the two or three decisions that matter most, what it costs to
     run, and what it deliberately does not attempt. -->

## 2. Context

<!-- How this sits against the existing system and its neighbours: who calls
     it, what it calls, where the data comes from and goes. A diagram is
     welcome; the prose must stand without it. -->

## 3. Constraints

<!-- Everything the design had to respect rather than choose: from the as-is
     assessment (brownfield), the BRD's non-functional requirements, the
     client's platform standards, the team that will operate it. Each with its
     source. -->

| # | Constraint | Source | How the design respects it |
|---|---|---|---|
| C-01 | | as-is assessment §6 / BRD NF-01 | |

## 4. Components

| Component | Responsibility | Owned by | Notes |
|---|---|---|---|

## 5. Data

<!-- Entities, ownership, and where data lives. Flag anything sensitive and
     who may read and change it. -->

## 6. Decisions

<!--
  One entry per decision that would be expensive to reverse. The rejected
  alternative is not optional: a decision without one is an assumption in
  disguise. Each carries the condition under which it should be revisited.
-->

### AD-01 — <decision>

**Context**

**Decision**

**Alternative rejected, and why**

**Consequences**

**Revisit when**

## 7. Non-functional targets

<!-- Numbers QA can test against. "Fast" is not testable. A target not
     committed to is recorded as not committed, never omitted. -->

| Attribute | Target | How it will be verified | Source |
|---|---|---|---|
| Latency | | | |
| Availability | | | |

## 8. Security

<!-- Trust boundaries, data classes, threats with the consequence if each
     fires, mitigations phrased as something QA can attempt, and accepted
     risks with who accepted them and when. Say what is deliberately not
     addressed in this engagement. -->

| Trust boundary | Threat | Consequence if it fires | Mitigation (testable) | Verified at |
|---|---|---|---|---|

| Accepted risk | Accepted by | Date | Revisit when |
|---|---|---|---|

## 9. Traceability

<!-- Every approved requirement against a component or a stated deferral, and
     every Epic against the components it touches — so nothing is built that
     traces to nothing, and nothing approved is silently dropped. -->

| BRD requirement | Component(s) | Deferred? |
|---|---|---|

| Epic | Components touched | Notes |
|---|---|---|
