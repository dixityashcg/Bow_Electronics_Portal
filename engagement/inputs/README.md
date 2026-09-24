# Inputs — what the client has provided

Put the client's material here, one file per source. Any format works —
markdown and plain text read best; PDFs, Word and spreadsheets are fine as
they are. This folder is exempt from the line-ending rule that keeps
artifact hashes stable, so binaries here are safe.

- `brief.md` — the request in the client's own words: who asked, when,
  and what for. The Discovery phase reads this first.
- `notes-<date>.md` — one per discovery conversation.
- `existing-<system>.md` — what is there today, per system.

This folder is part of the record: commit it, and a colleague on a fresh
clone sees it. It is input, not output — the artifacts the phases produce
live under `artifacts/`, and client documents are never pasted into them.
