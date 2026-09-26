# Backlog: Bow Electronics Reseller Portal

<!--
  STRUCTURE MATTERS. This document is read by the tooling at the backlog gate:
  every Epic becomes a tracked unit of delivery, and Build and QA run per Epic
  against what is written here. The gate refuses a backlog that does not follow
  the shape below, naming what is wrong.

  Required per Epic:   id, demonstrable-via (ui | backend), demo-notes
                       touches — on a multi-repository engagement only
  Required per Story:  id, at least one acceptance criterion

  The rest of the shape is for the people who read it: the Product Owner reads
  the objective, the story statements and "Demo — what you will see"; the
  build reads the criteria and the definition of done; QA reads all of it.
  Stories are published to the client's own board verbatim, so write every
  stakeholder-facing line in their vocabulary (artifacts/glossary.md).
-->

## Epic: 

- **id**: `epic-01`
- **objective**: What this Epic changes for the business, in one sentence, and
  the BRD objective it serves (O-01).
- **demonstrable-via**: `ui`
- **touches**: <!-- MULTI-REPOSITORY ENGAGEMENTS ONLY. The registered
      repositories this Epic changes, comma-separated, e.g.
      `- **touches**: atlas-api, atlas-db`. `raise repo list` names them.
      The Backlog gate refuses an Epic that names a repository nobody
      registered, and — on an engagement with repositories registered —
      one that names none. Omit the line entirely when the engagement has
      no registered repositories: the work happens in the one there is.
      Do not backtick more than one value on a line. -->
- **demo-notes**: Actor / action / visible result — the machine-readable
  record of how completion is shown. The Forward Deployed Engineer performs
  exactly this at the Epic Review.

**Demo — what you will see**

<!--
  Written for the Product Owner, in the second person, naming the screens by
  the names they use and never a system term. Two to five sentences. End with
  the stories the demo exercises.
-->

You open <screen>, <do the thing>, and see <the result you asked for>. Then
<the second thing>. Exercises: story-01-01, story-01-02.

### Story: {{STORY_TITLE}}

- **id**: `story-01-01`
- **screens**: <the screen or surface this story touches, by the client's name for it>

**As a** <role>, **I want** <capability>, **so that** <benefit>.

<!-- One criterion, one observable outcome. Field lists go in a table below
     the criteria, never inside one. -->

**Acceptance Criteria**

1. Given <initial state>, when <action>, then <one observable outcome>
2. Given <initial state>, when <action>, then <one observable outcome>

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`
- Unit and integration tests for the criteria pass at the reviewed commit
- <anything this story specifically needs: a migration applied, a feature flag, a document>

**Expected output**: <what exists when this story is done — a screen, an endpoint, a record — named>

### Story: {{STORY_TITLE}}

- **id**: `story-01-02`
- **screens**: <screen>

**As a** <role>, **I want** <capability>, **so that** <benefit>.

**Acceptance Criteria**

1. Given <initial state>, when <action>, then <one observable outcome>

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`

**Expected output**: <named>

---

## Epic: 

- **id**: `epic-02`
- **objective**: <one sentence, and the BRD objective it serves>
- **demonstrable-via**: `backend`
- **touches**: <!-- multi-repository engagements only; see the first Epic -->
- **demo-notes**: A backend Epic is demonstrated too — a request and its
  response, a job running, a record changing. "You can't see it" means the
  demo needs designing, not skipping.

**Demo — what you will see**

You <trigger the thing the way you would in the day job>, and watch <the
visible consequence> appear in <the place you would look for it>.
Exercises: story-02-01.

### Story: {{STORY_TITLE}}

- **id**: `story-02-01`
- **screens**: <surface — a report, an inbox, a job monitor>

**As a** <role>, **I want** <capability>, **so that** <benefit>.

**Acceptance Criteria**

1. Given <initial state>, when <action>, then <one observable outcome>

**Definition of done**

- Every criterion above verified and recorded in `ac-verification.md`

**Expected output**: <named>

---

## Coverage

<!--
  Map each requirement in the approved BRD to the Epic or Story that delivers
  it, and say explicitly where something is deliberately deferred. This section
  is what the Product Owner actually checks at the gate.
-->

| BRD requirement | Delivered by | Notes |
|---|---|---|
| BR-01 | epic-01 / story-01-01 | |
