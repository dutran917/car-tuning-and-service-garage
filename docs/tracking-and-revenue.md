# Tracking, attribution and revenue operations

## Data flow

```text
Ad / organic visit
  → consent-aware browser touchpoint storage
  → quote submission
  → POST /api/leads (validation, same-origin, honeypot, rate limit)
  → PostgreSQL Lead + Attribution (transaction, unique lead ID)
  → operator updates qualification / appointment / quote / order
  → order receipts, direct costs, refunds, marketing costs
  → internal report/export
  → optional idempotent outbox delivery to ad platforms after consent
```

`Lead` is the first-party source of truth. `Attribution` keeps first touch, last non-direct touch and session touch separately. Direct visits do not overwrite last non-direct. The platform's reported attribution remains distinct from these internal touchpoint rules.

## Consent and browser events

No advertising or analytics tag runs until the visitor chooses a relevant consent option. GTM is loaded from `NEXT_PUBLIC_GTM_ID`; IDs remain empty by default. If consent is denied, page and CTA events are not pushed to the data layer and campaign/click IDs are removed before database persistence. Necessary lead form data is still handled to answer the explicit enquiry. The consent banner uses local storage and can be reset by clearing site data.

| Event | Business moment | Destination fields |
| --- | --- | --- |
| `page_view` | Route view | `page_type` |
| `view_service` / `view_package` / `view_project` | Content view | relevant slug/ID; add only when page is published |
| `click_phone` / `click_zalo` / `click_facebook` / `click_quote` | Link activation | `page_type` |
| `form_start` | First form focus | `page_type` |
| `generate_lead` | Persisted API response (`201`) only; retries with an existing idempotency key do not emit it again | `event_id`, `lead_id`, optional `package_id` |
| `qualify_lead` | Operator marks lead qualified | `lead_id` |
| `appointment_booked` | Appointment is confirmed | appointment and lead IDs |
| `sale_won` | Order confirmed as won | order/lead IDs and confirmed booked value |
| `purchase` | Payment is actually received per agreed business rule | transaction ID, confirmed value, `VND` |
| `refund` / `order_cancelled` | Refund or cancellation recorded | order/transaction ID and actual amount |

Never send contact details or raw customer notes to analytics. Reloading a page cannot create another lead conversion; only the API's successful create response emits `generate_lead`. The client event uses the unique lead ID. The backend currently does not enqueue marketing conversions; implement an authenticated operator action plus outbox enqueue before enabling offline delivery.

## Revenue reporting

Join marketing costs to attribution campaign/platform, then lead to appointments, quotations and orders. Report unique lead count, qualified leads, appointment count, won orders, booked revenue, collected revenue, refunds, direct costs and gross profit independently. Distinguish funnel rate denominator in every report. CPL = spend/leads; qualified CPL = spend/qualified leads; CAC = spend/won customers; ROAS = attributed revenue/spend; ROI = (gross profit − spend)/spend. A missing cost or denominator yields “insufficient data”. A quotation is not revenue and ROAS is not profit.

## Verification checklist after IDs and database are configured

1. Run GTM Preview; verify no GTM request before consent and consent states after accept/reject.
2. Verify `page_view`/CTA events in the browser data layer and GA4 DebugView only with analytics consent. Check no PII fields are present.
3. Submit a lead with UTM and click IDs; confirm one database lead, one attribution row and a unique ID. Repeat with no consent and confirm identifiers are absent.
4. Submit invalid data, honeypot data, a foreign origin and repeated requests; confirm 400/403/429 behavior and no lead record.
5. Disable database connectivity; confirm 503 and no success state/event.
6. Reload after a success and confirm no second `generate_lead`.
7. In the operator workflow, qualify, book, quote, win, collect, refund and cancel using idempotent event keys; reconcile counts and values against database rows before enabling offline ad imports.
8. Submit sitemap in Search Console, inspect canonical/robots and use Rich Results Test for published schema. Use platform tag diagnostics only after consent and valid production IDs exist.
