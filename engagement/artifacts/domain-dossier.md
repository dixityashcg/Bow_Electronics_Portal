# Domain dossier — Bow Electronics Reseller Portal

The declared industry (electronics distribution) models the flow from purchase order to shipment to
invoice. This engagement stops earlier: at a quote the reseller approves, requests a change to, or
declines (inputs/brief.md, "Out of scope"). The claims below are the ones that bear on a quote
workflow, a catalog and pricing store, and the records a quote leaves behind. The rest of the bank is
listed under Open research for the operator to take to the client.

## Claims

### D-01 — What Bow asked for
- **claim**: Bow Electronics asks for a web portal where resellers log in, search Bow's products and request a quote for a product and quantity, with a confirmation email carrying a request ID, a separate internal sales login to build the quote from the ERP's pricing, and a reseller notification when the quote is submitted so they can approve, request a change or decline.
- **source**: inputs/brief.md
- **quote**: "They would like to build a web portal where users (resellers, their admins, etc.) can log in and search the products Bow Electronics has, and request a quote for the product they wish to buy in the quantity they want to buy."
- **retrieved**: 2026-09-25
- **status**: verified
- **answers**: electronics-distribution-questions#8

### D-02 — How requests are handled today
- **claim**: Today every reseller request arrives by telephone, is logged in Excel spreadsheets, and is fulfilled manually; there is no CRM and nothing tracks requests automatically.
- **source**: inputs/brief.md
- **quote**: "Bow Electronics currently manages all reseller requests through telephone conversations, logs the requests in Excel spreadsheets, and does the fulfilment process manually."
- **retrieved**: 2026-09-25
- **status**: verified
- **answers**: electronics-distribution-questions#8

### D-03 — The ERP is a home-grown spreadsheet
- **claim**: Bow's catalog and pricing are held in a home-grown Excel spreadsheet the client calls its ERP, which it describes as very slow and painful.
- **source**: inputs/brief.md
- **quote**: "**ERP:** a home-grown Excel spreadsheet that holds the catalog and pricing. It is very slow and painful."
- **retrieved**: 2026-09-25
- **status**: verified
- **answers**: electronics-distribution-questions#4

### D-04 — The problem as stated
- **claim**: Requests are lost or delayed between the phone call and the spreadsheet, resellers call again for status, quote turnaround is slow and inconsistent, and reps lose track of when a request arrived — costing business with key clients; none of this has been measured.
- **source**: inputs/brief.md
- **quote**: "Internal reps lack a proper view to prioritize requests and often lose track of when a request came in, which results in lost business with key clients."
- **retrieved**: 2026-09-25
- **status**: verified
- **answers**: electronics-distribution-questions#8

### D-05 — What done looks like, to the client
- **claim**: The one outcome the client stands behind is that no request goes untracked: every quote request has an ID and a timestamp, and reps see all open requests in one prioritized view.
- **source**: inputs/brief.md
- **quote**: "No request goes untracked: every quote request has an ID and a timestamp, and reps see all open requests in one prioritized view."
- **retrieved**: 2026-09-25
- **status**: verified
- **answers**: electronics-distribution-questions#8

### D-06 — The recommended scope boundary
- **claim**: In scope is the portal and a catalog and pricing store that replaces the Excel ERP as the source for quotes; payments and invoicing, post-approval fulfilment and shipping, inventory, and migration of historical requests are out — recommended by the agent and accepted by the operator, not yet confirmed by a client stakeholder.
- **source**: inputs/brief.md
- **quote**: "**In scope, to set the boundary:** the portal (reseller and internal-sales logins, product search, quote requests, the quote workflow, notifications) **and a proper catalog and pricing store that replaces the Excel ERP as the source for quotes.**"
- **retrieved**: 2026-09-25
- **status**: verified
- **answers**: electronics-distribution-questions#4

### D-07 — Quotation is a recognised electronic exchange in the trade
- **claim**: The X12 standard defines a Request for Quotation transaction set (840) with which a buyer solicits price, delivery schedule and other terms from a seller — so some resellers may expect to send quote requests electronically rather than through a portal.
- **source**: https://www.stedi.com/edi/x12/transaction-set/840
- **quote**: "potential buyers with the ability to solicit price, delivery schedule, and other items from potential sellers of goods and services."
- **retrieved**: 2026-09-25
- **status**: verified

### D-08 — And a Response to Request for Quotation (843)
- **claim**: The X12 standard defines a Response to Request for Quotation transaction set (843) with which a seller returns price, delivery schedule and other terms in answer to a request.
- **source**: https://www.stedi.com/edi/x12/transaction-set/843
- **quote**: "The transaction set can be used to provide potential buyers with price, delivery schedule, and other terms from potential sellers of goods and services, in response to a request for such information."
- **retrieved**: 2026-09-25
- **status**: verified

### D-09 — A purchase order is a separate exchange from a quote
- **claim**: In X12 the purchase order (850) is its own transaction set and is not meant for order changes or acknowledgments — an approved quote is not, by itself, an order in the trade's standard exchanges.
- **source**: https://www.stedi.com/edi/x12/transaction-set/850
- **quote**: "This X12 Transaction Set contains the format and establishes the data contents of the Purchase Order Transaction Set (850) for use within the context of an Electronic Data Interchange (EDI) environment."
- **retrieved**: 2026-09-25
- **status**: verified

### D-10 — US export recordkeeping reaches negotiations, not only shipments
- **claim**: Where Bow is subject to US jurisdiction and exports, EAR recordkeeping applies to all negotiations connected with an export transaction — which can include quotes — though a mere preliminary inquiry or offer to do business does not count.
- **source**: https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-762
- **quote**: "This part also applies to all negotiations connected with those transactions, except that for export control matters a mere preliminary inquiry or offer to do business and negative response thereto shall not constitute negotiations"
- **retrieved**: 2026-09-25
- **status**: verified
- **answers**: electronics-distribution-questions#6

### D-11 — Retained records include correspondence and contracts
- **claim**: Records the EAR requires to be retained include memoranda, notes, correspondence and contracts.
- **source**: https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-762
- **quote**: "The records required to be retained under this part 762 include the following: (1) Export control documents as defined in part 772 of the EAR, [...] (2) Memoranda; (3) Notes; (4) Correspondence; (5) Contracts;"
- **retrieved**: 2026-09-25
- **status**: verified
- **answers**: electronics-distribution-questions#6

### D-12 — Five-year retention
- **claim**: Records required by the EAR must be kept for five years from the latest of the export, any known reexport or diversion, or any other termination of the transaction.
- **source**: https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-762
- **quote**: "All records required to be kept by the EAR must be retained for five years from the latest of the following times:"
- **retrieved**: 2026-09-25
- **status**: verified
- **answers**: electronics-distribution-questions#6

### D-13 — Classification is the exporter's responsibility
- **claim**: Under the EAR the exporter is responsible for classifying the items in a transaction correctly, and a wrong or missing classification does not remove the obligation to obtain a licence when one is required.
- **source**: https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-732/section-732.3
- **quote**: "The exporter, reexporter, or transferor is responsible for correctly classifying the items in a transaction, which may involve submitting a classification request to BIS. Failure to classify or have classified the item correctly does not relieve the person of the obligation to obtain a license when one is required by the EAR."
- **retrieved**: 2026-09-25
- **status**: verified
- **answers**: electronics-distribution-questions#6

### D-14 — A screening match requires due diligence before proceeding
- **claim**: If a party to a transaction appears to match an entry on the US Consolidated Screening List, additional due diligence should be done before going ahead.
- **source**: https://www.trade.gov/consolidated-screening-list
- **quote**: "In the event that a company, entity, or person on the list appears to match a party potentially involved in your export transaction, additional due diligence should be conducted before proceeding."
- **retrieved**: 2026-09-25
- **status**: verified
- **answers**: electronics-distribution-questions#6

## Open research
- electronics-distribution-questions#1 — Whether Bow sells anything beyond standard sell-through (consignment, blanket orders, drop-ship). The brief describes only a quote for a product and quantity. Nothing in inputs/; take to the client.
- electronics-distribution-questions#2 — How credit holds work and who releases them. Not in inputs/; fulfilment and invoicing are out of scope, but a reseller on credit hold requesting a quote is a boundary case. Take to the client.
- electronics-distribution-questions#3 — Currency exposure between quote and settlement, and who decides to reprice. Not in inputs/. Bears on quote validity; recorded as an assumption in the BRD.
- electronics-distribution-questions#4 — Where reseller-specific pricing and discount terms live today, and whether they have ever been reconciled. inputs/brief.md says catalog and pricing are in the Excel ERP and leaves relationship terms open (in the ERP or known only to reps). Take to Elon Musk (EA).
- electronics-distribution-questions#5 — Returns/RMA. Out of scope of a quote workflow; not researched.
- electronics-distribution-questions#6 — Which export regime applies to Bow's catalogue, and whether Bow is subject to US jurisdiction at all. The brief does not state Bow's country or whether it exports. D-10 to D-14 apply only if it does; recorded as an assumption in the BRD.
- electronics-distribution-questions#7 — Which channel is authoritative for lead time. The brief does not mention lead times. Whether a quote shows a lead time is recorded as an assumption.
- electronics-distribution-questions#8 — What was tried before. inputs/brief.md records "nothing tried before" as the recommendation, and the answer given was about the current state rather than past attempts. Take to the client.
- electronics-distribution-questions#9 to #15 — Freight tracking, certificates of conformance, supplier master data, blanket-order releases, partner feed samples, franchise pricing sign-off, quarantine thresholds. All sit in fulfilment, supply or inventory, which the brief puts out of scope. Not researched. #14 (franchise boundaries on pricing) touches discounting and is raised as an assumption in the BRD.
- Industry considerations not covered by the bank — part lifecycle states (active, NRND, last-time-buy, obsolete), quote validity and requote, contract versus spot pricing, allocation under shortage. None is mentioned in inputs/brief.md. Lifecycle and quote validity bear directly on a quote; both are raised as assumptions in the BRD.
