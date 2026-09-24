# Verifying this engagement record without RAISE

You do not need RAISE, a network connection, or anything beyond `git` to check
this record. That is deliberate: a record only its own tool can verify asks you
to trust the tool you are auditing.

## What this record is

Every decision in this engagement is an immutable file under
`engagement/ledger/`, one file per event, committed as it was made. Each
file carries its own SHA-256 in its front matter, and each sits in a git commit.

Integrity comes from git's commit graph. A commit hashes its tree, the tree
hashes every file, and every later commit hashes its ancestor — so altering an
event from three weeks ago changes that commit's id and every id after it.

## Check that the history is intact

    git fsck
    git log --oneline -- engagement/ledger

Every event file should appear in exactly **one** commit. An event touched by
two commits was changed after it was written, which is not something this
product ever does.

    git log --format='%h %cI' --name-only -- engagement/ledger

## Check who made each decision

If `engagement/keys/allowed-signers` exists, decisions were signed with SSH keys:

    git -c gpg.ssh.allowedSignersFile=engagement/keys/allowed-signers \
        log --show-signature -- engagement/ledger

Or, for one line per commit:

    git -c gpg.ssh.allowedSignersFile=engagement/keys/allowed-signers \
        log --format='%h %G? %GS' -- engagement/ledger

`%G?` reads `G` for a good signature by a listed key, `U` for a good
signature by a key **not** listed here, and `N` for no signature.

**`U` is not a pass.** It means the signature is cryptographically valid and
attributable to nobody this engagement trusts.

**Pass the file explicitly**, as shown. Without it git reports `N` even for
correctly signed commits — the same code an unsigned commit gets.

The principal in that file is the participant id, so a signature attributes
directly to the person the ledger names.

## Check an artifact is the one that was approved

Each gate decision records the SHA-256 of what it approved:

    grep -A4 sha256 engagement/ledger/*gate_decision*
    shasum -a 256 engagement/artifacts/<file>

## Check how each decision arrived

Some gate decisions are typed by the operator; some are relayed by an AI
agent after asking the operator. The record distinguishes them permanently —
a relayed decision carries the marker `relayed: true` in its front matter:

    grep -l "relayed: true" engagement/ledger/*gate_decision* || echo "none relayed"

A decision without the marker was recorded directly: interactively when its
`invocationMode` says `interactive`, under the operator's own scripted
attestation when it says `non_interactive`.

What the marker means, stated plainly: a relayed approval proves what was
recorded — not what the agent displayed to the operator before relaying, nor
that the operator's answer occurred as described. A signature on a relayed
decision proves which registered key recorded it, not that the named operator
was at the keyboard.

## What this record does not prove

Stated because a reader who discovers an unstated gap will reasonably assume
there are others.

- **The first key registration is unsigned by construction.** There was no
  trusted key yet to sign it, so it rests on the repository's access control.
- **A compromised workstation signs whatever it is asked to.** A signature
  proves which key was used, not that its holder intended the content.
- **Timestamps are self-reported** by the machine that recorded them. The
  *order* of events is protected by the commit graph; wall-clock time is not.
- **An agent-relayed decision proves less than a keyboard one** — see "Check
  how each decision arrived" above; the record marks these rather than hiding
  them.
- If no `allowed-signers` file is present, nothing here establishes **who**
  recorded any of it — only that the history was not rewritten.

## A note on tooling

This procedure needs git 2.34 or newer for SSH signature verification. That is
a claim about your workstation rather than about this repository; `git
--version` settles it.
