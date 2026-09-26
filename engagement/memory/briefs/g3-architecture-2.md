# Handoff — g3-architecture

Compiled by rule from the engagement record at this decision. It is the boundary the next phase starts from; read it before the inputs.

## Decided

- approved by Yash Dixit (FDE) — evidence: Elon Musk via meeting

## Changed since the last boundary

- artifact: engagement/artifacts/architecture.md
- artifact: engagement/artifacts/decisions.md
- artifact: engagement/internal/architecture-critique.md
- artifact: engagement/assessments/architecture-assessment.md
- artifact: engagement/artifacts/demo-topology.md

## Open

- workslop: 6 hit(s) in the phase's artifacts (0.3 per thousand)

## Carried forward

- When customers hold an identifier on paper, choosing its format is an architecture decision, not a detail. A counter has two costs that are easy to miss: any customer comparing two of their own IDs learns the business's volume, and a restore from backup hands out again numbers already printed on customers' emails. Random codes from an alphabet with no look-alikes remove both. But do the birthday arithmetic before writing down a collision rate: 1.8 million draws from 850 billion codes repeat an existing ID about twice, not once in centuries. The unique constraint and a redraw make that harmless, and the record has to say so correctly, because an EA who checks the arithmetic and finds it wrong stops trusting the rest of the record.
- When a design runs one database engine locally and another in production, a feature combination the production engine forbids passes every local test and every demo, and fails at the first real deployment. Here an updatable ledger table was also given a full-text index. SQL Server does not allow that, and the SQLite stand-in never complained. It was caught only by reading Microsoft's ledger limitations page while checking a reviewer's claim about tiers. Before committing to a guarantee that rests on an engine feature (ledger, temporal tables, full-text), read that feature's limitations page against every table that uses it, and run contract tests against the real engine from the first story, not from the cloud stage.
