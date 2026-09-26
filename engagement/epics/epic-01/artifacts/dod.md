# Definition of done — epic-01: The catalog and pricing store replaces the Excel ERP

<!--
  Written BEFORE the code, by the agent that has not yet written it. One row
  per acceptance criterion: the command that proves it, and what its outcome
  must show. `raise dod record` fingerprints this table with the commit at
  declaration; `raise dod run` executes each command in the operator's shell
  and records the outcomes — a `pass` in the build's matrix is worth
  something only when the declared check passed.

  Expect grammar: `exit 0` · `contains "text"` · `file path/to/artifact` —
  joined with `and`. A check that needs more is a script the command calls.
  A command the phase's loadout denies (push, deploy, apply) is refused
  before it runs.
-->

| AC | Command | Expect | Repo |
|---|---|---|---|
| <story-id>#<n> | `<command that proves it>` | exit 0 and contains "<what its output must show>" | <registered repository, or blank> |

<!--
  The fourth column is for MULTI-REPOSITORY engagements: the registered
  repository the check runs in. Blank — or the three-column form, which still
  parses — means the engagement root.

  On an engagement with registered repositories, a check with no repository
  runs where there is no code: `npm test` at the engagement root exits 127 and
  is recorded as a failed check, which reads as a statement about the build
  and is really a statement about a working directory. `raise repo list` names
  the registered repositories.
-->
