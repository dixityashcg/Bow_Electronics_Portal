---
schemaVersion: 32
id: 1b556667573d116233e44b58a9dfb7126a6264205972deeafcc8512fda8b2f3a
recordedAt: 2026-09-26T18:56:30.656Z
recordedBy:
  id: fde-yash
  name: Yash Dixit
  role: FDE
invocationMode: non_interactive
tool:
  cli: 4.11.1
  pack: 4.11.1
kind: hook_decision
host: claude
event: pre-tool
decision: deny
reason: Decisions are recorded by the named human operator at the terminal — an agent never originates one (RAISE Principle I). Present the brief and stop; once the operator gives their explicit answer, relay it with --relay.
summary: 'raise gate reject g3-architecture --approver fde-yash --comments "Rework as an enterprise architecture: map capabilities to systems of record and assess build versus buy for catalog, pricing and stock (including the Microsoft ERP given our M365 estate); compare two or three candidate architectures; add C4 context, container and deployment diagrams, a data model and the request-to-quote sequence; g'
sessionId: 2a8147c2-35b8-4dfe-9de7-e79e4c0e37ea
---

# Hook pre-tool deny on claude: Decisions are recorded by the named human operator at the terminal — an agent never originates one (RAISE Principle I). Present the brief and stop; once the operator gives their explicit answer, relay it with --relay.

