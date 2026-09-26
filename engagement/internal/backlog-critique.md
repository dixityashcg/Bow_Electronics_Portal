# Critique — Bow Electronics Reseller Portal

**Status**: Draft · **Prepared by**: QA Engineer – Electronics Distribution (reviewing persona `qa--electronics-distribution`, with the `senior-reviewer` stance; composed differently from the authoring BA persona) · **For**: the g2-backlog decision

## 1. What was challenged

The draft backlog (6 Epics, 31 stories at the time of review), read against the approved BRD (BR-01 to BR-20, NF-01 to NF-10, A-01 to A-15), the `backlog` rubric and the glossary. **Lenses**: pre-mortem ("four months from now the Epic Review demo fails, QA cannot test, or the PO rejects the backlog — why?") and red-team. The review covered:

- **Unmet-if clauses**: every BR's clause, checked for a criterion that would catch it.
- **Invented scope**: coverage checked in both directions.
- **Criteria**: one assertion each, and a test on the boundary value itself.
- **Demos**: each run as a stranger would run it, with the delivery-order claims checked.
- **Unhappy paths and authorisation**: covered on actions, not only on pages.
- **Glossary drift**: terms in stakeholder text that the glossary does not define.
- **Domain risks**: pricing layers, product lifecycle, and compliance after approval.

## 2. Where it is weakest

Ranked by cost. Each was fixable by the author. **What was done** follows each one.

1. **A BR-20 Unmet clause could pass untested (story-04-04).** With no standard discount on file, a quote at 8% with no reason passed every criterion. *Applied:* story-04-04 criterion 4 refuses it.
2. **The load summary could report a failed load and still pass (story-01-01).** Duplicate part numbers were not handled. *Applied:* a criterion that loaded plus not-loaded equals N, a criterion that duplicate part numbers are refused, and the fields moved to tables.
3. **The delivery order hid dependencies across Epics.**
   - story-01-04 needs reseller users.
   - epic-03 needs story-02-05 and story-02-06.
   - The Expired status in story-03-01 needs epic-05.
   - story-06-02 criterion 4 needs epic-05.

   *Applied:* the Delivery order section now says plainly that the order is largely fixed. The Expired check moved to story-05-04, the deactivated-requester check moved to story-05-01, the epic-03 demo-notes name epic-02 as a prerequisite, and the story-01-04 DoD notes the test reseller user.
4. **No story named the internal users allowed to change prices or discounts** (BR-17, BR-20). *Applied:* new story-01-05, with revocation; demos for epic-01 and epic-04 use it.
5. **The epic-05 expired-quote demo could not be run as written**, because a quote cannot be sent with a past date. *Applied:* the demo-notes prepare a quote the day before.
6. **Authorisation was tested on pages, not on actions.** *Applied:* direct-action refusals added to story-01-04 c5, story-02-03 c4, story-05-01 c7 and story-05-07 c3. The BR-01 check the coverage table claimed was missing from story-04-05; it is now c8.
7. **Unhappy paths were missing.** *Applied:* story-06-02 now ends a deactivated user's live session (c4) and stops the last admin deactivating themselves (c5, stated as an assumption). Also added: stale version-1 approval (story-05-02 c7), change request on an answered quote (story-05-05 c5), closed product at rep entry (story-03-04 c8), and flag states (story-03-05 c3). *Not built:* bounced emails are stated as an assumption for Elon Musk (NF-02), not added as scope.
8. **Some boundaries missed the threshold.** *Applied:*
   - quantity 1 accepted (story-02-04 c5)
   - valid-until today accepted (story-04-05 c4)
   - a rounding case between cents (story-04-02 DoD)
   - discounts limited to 0–100% (story-04-01 c5, story-04-02 c7)
   - the store price on a line is the one in force when the quote was started (story-04-02 c5)

   The last two are stated as assumptions for Jensen Huang.
9. **Field lists sat inside criteria**, and story-05-06 walked seven statuses in one criterion. *Applied:* the fields are in tables (the load summary, price history, refused attempt record, emails, failed emails entry, discount history, quote line, response record), and story-05-06 is split into three paths.
10. **Some criteria were untraced.** *Applied:* story-01-03 c2 and story-03-02 c4 were removed. story-02-02 c6 and story-02-04 c5 are kept and listed as usability choices for Jensen Huang to confirm.
11. **Glossary drift.** *Applied:* 11 terms added. "Reseller buyer" is replaced by the BRD's "reseller user". The quote request entry now allows several products (A-02).
12. **Currency, and a deactivated requester's quote ready email, were premises nobody owned.** *Applied:* both added to the assumptions table.

## 3. What survives the challenge

- **Coverage** is complete in both directions, and the §4.2 exclusions are written as absences someone can check.
- **Concurrency** is handled with its own tests: simultaneous take (story-03-03) and simultaneous response (story-05-05).
- **Refusals** check the state as well as the message ("price is unchanged").
- **Sent quotes do not move** when the price, the discount or the product's status changes (story-04-06).
- **Expiry** is tested on its boundary (story-05-04 c4).
- **Failed emails** are visible to the internal sales team (BR-07, BR-13).
- **Tests use real data**: a copy of the real ERP and the loaded catalog.
- **An empty discount list** is a deliberate tripwire (story-04-04 c6), and the demos forbid running with an empty store or no discounts on file.
- **Domain framing**: the store owns a product's lifecycle status, and the one standard discount is ring-fenced by A-07 and NF-10.

## 4. Open questions for the decider

Put to the operator on 2026-09-26, in one message. Their decisions follow each question.

1. **An absent or departed rep's requests (D2-Q4).** As decided, only the owner hands a request on, so a departed rep's requests are stuck. *Recommended:* any rep may reassign an owned request with a recorded reason. *Implies:* story-03-03 c4 is amended and a criterion is added. It is within BR-10's wording. — **Decision:** Not the recommendation. A few Bow users, chosen by Bow's stakeholders, hold an internal admin role that can reassign any open request when a rep leaves mid-process. Reps still cannot take over each other's requests (D2-Q4 stands for reps). *Applied:* new story-03-06, recorded as D2-C1. It extends BR-10 with a role the BRD does not name, and is marked for Jensen Huang to confirm at the g2-backlog review.
2. **A rep adding a phone caller as a user (D2-Q5).** An unverified caller added to Reseller A then sees all of A's quotes, which is a way around BR-01. *Recommended:* keep D2-Q5, and email the reseller's admin whenever Bow adds a user. *Implies:* one criterion each in story-02-01 and story-03-04. — **Decision:** As recommended. *Applied:* story-02-01 c6 and story-03-04 c9, recorded as D2-C2.
3. **The received time for requests a rep enters (BR-06, BR-09, NF-05).** An email entered the next day, and every request re-entered at go-live, gets the time of entry. That distorts oldest-first, O-02 and O-01. *Recommended:* the rep states when the request arrived, it is then fixed, and the list sorts by time arrived. *Implies:* one criterion in story-03-04 and story-03-01's order rule. It departs from BR-06 as worded, so a g1-brd change. — **Decision:** As recommended: raise a change request on BR-06 against g1-brd. The backlog stays as written until that change is decided. The operator raises it (`/raise-change`); the agent does not.
4. **How an abandoned request leaves the reps' list (D2-Q2).** Only approval or decline closes a request. *Recommended:* raise it as a change request against g1-brd (a rep closing with a reason, or a decline allowed on an expired quote). Keep the backlog as approved meanwhile. *Implies:* nothing now. It adds a status to BR-16 if approved. — **Decision:** As recommended: raise a change request against g1-brd. Nothing changes in the backlog now. The operator raises it.
5. **Whether Bow screens before shipping today (A-08).** *Recommended:* Elon Musk confirms A-08 before the epic-05 review. The approval wording agreed under A-05 adds "subject to Bow's export checks". *Implies:* one DoD line in story-05-01, no build. — **Decision:** Not selected. No DoD line is added. A-08 stays as the BRD records it.
