# Defect Log — epic-01: The catalog and pricing store replaces the Excel ERP

**Raised by**: independent QA agents · **Overseen by**: Yash Dixit

<!--
  A client deliverable, and the artifact the build team works from. It is
  separate from the QA report because it has a different life: the report
  describes one moment, and this log stays open across fixes and re-tests.

  QA does not fix what QA finds. Every entry is routed back and re-tested.
-->

## Open defects

<!--
  One block per defect — not a single table row, because a defect that fits in
  a table row is usually missing its reproduction.

  Severity by consequence, never by how hard it was to find. Five levels, the
  same five the QA phase names and the exit criteria read:
    Critical — data lost, data disclosed to the wrong party, or money or
               entitlement wrongly moved
    High     — an acceptance criterion is not met on a path a normal user
               takes
    Major    — documented behaviour is wrong on a path a normal user takes
    Medium   — wrong behaviour needing unusual input or sequence, and a
               workaround exists
    Minor    — wording or presentation, no behavioural consequence

  High and Major both mean **not shippable without a ruling**: one breaks what
  was agreed, the other breaks what was written down, and neither is a
  judgement the Epic Review can skip. Medium and Minor are the operator's call.
-->

### D-01 — {{SHORT_TITLE}}

- **Severity**:
- **Status**: Open
- **Traces to**: <!-- the acceptance criterion, target, or security
      expectation this violates. A defect whose expectation traces to nothing
      is either a criterion gap or a preference — say which. -->

**Starting state**

**Steps**

1.

**Observed**

**Expected**

**Consequence** <!-- What happens if this ships, and why it was not noticed
      already. -->

**Hypothesis (not established)** <!-- Optional. If you have a theory about
      cause, label it. An unlabelled guess sends someone to the wrong file. -->

---

## Criterion questions

<!--
  Failures where the acceptance criterion appears wrong rather than the code
  are NOT defects and do not go to the build team. They live in their own
  artifact, `criterion-questions.md` beside this log, with the answer you
  recommend and the operator's answer recorded against each. Filing one of
  these as a defect sends the build team to change code that was never
  specified.
-->

See `criterion-questions.md`.

## Closed defects

| # | Severity | Summary | Fixed in build | Re-tested |
|---|---|---|---|---|
