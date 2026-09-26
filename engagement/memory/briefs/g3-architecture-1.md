# Handoff — g3-architecture

Compiled by rule from the engagement record at this decision. It is the boundary the next phase starts from; read it before the inputs.

## Decided

- rejected by Yash Dixit (FDE) — evidence: operator_asserted

## Changed since the last boundary

- artifact: engagement/artifacts/architecture.md
- artifact: engagement/artifacts/decisions.md
- artifact: engagement/internal/architecture-critique.md
- artifact: engagement/assessments/architecture-assessment.md
- artifact: engagement/artifacts/demo-topology.md

## Open

- workslop: 5 hit(s) in the phase's artifacts (0.4 per thousand)

## Carried forward

- When customers hold an identifier on paper, choosing its format is an architecture decision, not a detail. A counter has two costs that are easy to miss: any customer comparing two of their own IDs learns the business's volume, and a restore from backup hands out again numbers already printed on customers' emails. Random codes from an alphabet with no look-alikes remove both. But do the birthday arithmetic before writing down a collision rate: 1.8 million draws from 850 billion codes repeat an existing ID about twice, not once in centuries. The unique constraint and a redraw make that harmless, and the record has to say so correctly, because an EA who checks the arithmetic and finds it wrong stops trusting the rest of the record.
