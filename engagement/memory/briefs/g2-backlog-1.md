# Handoff — g2-backlog

Compiled by rule from the engagement record at this decision. It is the boundary the next phase starts from; read it before the inputs.

## Decided

- approved by Mark Zuckerberg (BA) — evidence: Jensen Huang via meeting

## Changed since the last boundary

- artifact: engagement/artifacts/backlog.md
- artifact: engagement/internal/backlog-critique.md
- artifact: engagement/assessments/backlog-assessment.md

## Open

- workslop: 30 hit(s) in the phase's artifacts (2.6 per thousand)

## Carried forward

- A requirement that gives a unit of work one owner and lets only that owner hand it on reads as contention control, but it also decides what happens when the owner leaves: the work is stuck, and that is the very loss the system was bought to stop. Decomposition surfaces this only when someone writes the unhappy path for the owner's absence, not for two people acting at once. The fix usually adds a role the requirements never named — here an internal admin who can reassign — so it is scope, not detail: write it as its own story, trace it to the ownership requirement, and flag it as an extension for the approver to confirm rather than folding it into an existing story. Worth checking wherever a requirement says 'one owner at a time'.
- When a rep keys in a request that arrived earlier by phone or email, a system-stamped received time records when it was entered, not when it arrived. Every oldest-first queue, turnaround figure and 'untracked by next day' measure built on that time is then quietly wrong for exactly the requests the manual-entry path exists to capture, including the bulk re-entry on go-live day. Ask at decomposition whether 'received' means arrived or entered for every path that is not self-service, before the criteria fix one reading.
