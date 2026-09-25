# Brief — Bow Electronics Reseller Portal

<!-- raise:captured-brief -->
**Drafted by the agent from a conversation with Yash Dixit (FDE) on 2026-09-25, and confirmed by them.**
This is a derived record of what was said, not a document the client wrote. A requirement that cites
it rests on that conversation; a fact the client has in writing belongs under `inputs/` as the document.

Yash Dixit relayed what the client (Bow Electronics) asked for; the client has not yet confirmed this
brief in their own words. Where an answer was the agent's recommendation accepted by the operator rather
than a statement attributed to the client, it is marked **(operator-accepted)**. The client confirms the
brief at the BRD gate.

## The request, in their words

Bow Electronics currently manages all reseller requests through telephone conversations, logs the
requests in Excel spreadsheets, and does the fulfilment process manually. They would like to build a web
portal where users (resellers, their admins, etc.) can log in and search the products Bow Electronics
has, and request a quote for the product they wish to buy in the quantity they want to buy.

Once a request is logged, the reseller gets a confirmation email with the details of what they requested
and a request ID, so they can track each request. The quote request is automatically sent to the
internal sales team, who have a separate login where they can view the request and, based on the
reseller relationship, build the quote using discounts etc., taking pricing from the ERP that holds the
catalog and pricing.

Resellers get a notification when a quote has been submitted, and can log in to the portal to review the
quote and approve it, request a change, or decline it.

The client is looking for a modern architecture that solves this problem end to end.

This is the client's preferred solution, recorded as their preference.

## The problem behind it

Requests get lost or delayed between the phone call and the spreadsheet. Resellers cannot see where their
quote stands, so they call again. Quote turnaround is slow and inconsistent, and deals are lost to faster
competitors. **(operator-accepted)**

Internal reps lack a proper view to prioritize requests and often lose track of when a request came in,
which results in lost business with key clients.

**Open point:** how often this happens and what it costs (calls per day, quote turnaround time, deals
lost) has not been measured. Recommended answer: not measured yet; quantify before launch to set the
baseline. Confirms: Jensen Huang (PO).

## Who feels it, and what they do today

It is felt on both sides.

- **Resellers** find the manual process very cumbersome and have to call the reps for updates.
- **Internal sales reps** take requests by phone, log them in Excel, and build quotes manually; they lack
  a view to prioritize requests and lose track of when requests came in.

**Open points** (confirms: Jensen Huang, PO):
- Whether a reseller admin role exists that manages its own company's users. Recommended answer: yes, as
  the request names "resellers, their admins".
- Whether a sales manager approves discounts above a threshold. Recommended answer: unknown; to be confirmed.
- Whether fulfilment is a team separate from sales. Recommended answer: unknown; to be confirmed.

## What exists today

- **ERP:** a home-grown Excel spreadsheet that holds the catalog and pricing. It is very slow and painful.
- **CRM:** none. Nothing tracks requests automatically.
- **Process:** reseller requests by phone, logged in Excel spreadsheets, fulfilled manually.

**Open points** (confirms: Elon Musk, EA):
- Where reseller relationship and discount terms are kept today. Recommended answer: in the Excel ERP or
  known only to the reps; to be confirmed.
- Which email platform and identity provider Bow uses, if any. Recommended answer: unknown; confirm
  before architecture.

## What done looks like

No request goes untracked: every quote request has an ID and a timestamp, and reps see all open requests
in one prioritized view.

**Open point:** who judges this outcome. Recommended answer: Jensen Huang (PO). Confirms: Jensen Huang.

**Pre-mortem risk (operator-accepted):** a year on, it failed because resellers kept phoning because the
portal was harder than a phone call, reps kept taking the calls, and requests still bypassed the system.

## Out of scope

All of the following is **(operator-accepted)**: the agent recommended it and Yash Dixit accepted it. No
client stakeholder has been named as saying so. Confirms: Jensen Huang (PO) and Elon Musk (EA).

**In scope, to set the boundary:** the portal (reseller and internal-sales logins, product search, quote
requests, the quote workflow, notifications) **and a proper catalog and pricing store that replaces the
Excel ERP as the source for quotes.**

**Out of scope:**
- Payments and invoicing.
- Order fulfilment and shipping after a quote is approved.
- Inventory and stock management.
- Migration of historical requests from the existing Excel spreadsheets.

## Questions and answers

1. **Who am I talking to?** Recommended: Yash Dixit (`fde-yash`), relaying the client. Answer: Yash Dixit.
2. **What did the client ask for, in their words?** Recommended: a web portal where resellers can order,
   check stock, see pricing or track orders themselves (to be replaced by what was said). Answer: the full
   request as recorded under "The request, in their words".
3. **What goes wrong with phone and Excel today, and what does it cost?** Recommended: requests lost or
   delayed between call and spreadsheet; resellers call again for status; slow, inconsistent turnaround;
   deals lost to faster competitors. Answer: as recommended. Costs not quantified (open point).
4. **Who lives with it today, on both sides?** Recommended: reseller buyers and a reseller admin; Bow's
   internal sales team; fulfilment/operations. Answer: felt on both sides. Resellers find it cumbersome
   and call reps for updates; reps lack a view to prioritize and lose track of when requests came in,
   losing business with key clients. Role details left open.
5. **What systems exist today, and what was tried before?** Recommended: an ERP of unknown make holding
   catalog and pricing; relationship terms in the ERP or reps' heads; corporate email; no CRM; nothing
   tried before. Answer: the ERP is a home-grown Excel spreadsheet that is very slow and painful; no CRM
   tracks requests; the client wants a modern architecture that solves the problem end to end.
6. **A year after launch, how will the client know it worked?** Recommended: (a) no request untracked;
   (b) quote turnaround down against a baseline; (c) fewer status calls; (d) less key-client business
   lost; judged by Jensen Huang. Answer: (a) only. Judge left open.
7. **Assume it failed a year on — why?** Recommended: resellers kept phoning because the portal was
   harder than a call, reps kept taking the calls, requests bypassed the system. Answer: as recommended.
8. **Is replacing the Excel ERP inside "end to end", and what is out?** Recommended: in: the portal plus
   a catalog and pricing store replacing the Excel ERP; out: payments and invoicing, post-approval
   fulfilment and shipping, inventory, historical migration. Answer: as recommended.

## Techniques used

- **Five whys:** traced phone-and-Excel to its effects: lost track of when requests arrived, no
  prioritization, repeat status calls, lost business with key clients.
- **Socratic:** reduced "what done looks like" to one outcome the client stands behind: no request
  untracked, with an ID, a timestamp and a prioritized view.
- **Pre-mortem:** surfaced the adoption risk that resellers and reps keep using the phone and bypass the
  portal.
- **Red-team:** surfaced that "end to end" could include replacing the Excel ERP. The recommended
  boundary puts a catalog and pricing store in scope and excludes payments, fulfilment, inventory and
  historical migration.
