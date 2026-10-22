# G1 — YouPI re-pay semantics: sandbox protocol + written questions

**G1 is UNRESOLVED.** Nothing in the repository proves what YouPI does
when `pay()` is invoked a second time for an order id that already has
a successful payment. Round 3.7 made duplicate ORDERS impossible
(migration 0005 + API reuse) and capped duplicate PUBLICATION at one,
but duplicate CHARGES turn entirely on this gateway behaviour.

**Do not enable live payments on reused orders until G1 is closed** —
either by running the sandbox protocol below against a test YouPI
instance, or by written answers to Q1–Q7 from the provider, tied to a
named gateway version.

Source: post-3.7 audit `mission/evidence/post37-audit-g1.log` (§3),
which refines backlog questions Q1–Q4 with the audit's findings.

---

## Part 1 — Sandbox scenario script (T0–T5)

Run against a **test/sandbox YouPI instance only — never the
production instance or VPA**. Follow the gateway's own suggested
abuse limits (low-value transactions only, ≤20 payment attempts/day
per receiving account, test data where possible).

Setup needed:

- The app deployed against the test instance (`VITE_YOUPI_CHECKOUT_URL`
  / `YOUPI_API_BASE_URL` pointed at it).
- One test invite priced ₹599.
- Gateway admin access to list payment sessions.
- Ability to observe webhooks (app logs + the `webhook_deliveries`
  table).

**Record for EVERY step:** timestamp · `pay()`/create response · HTTP
status + body if the REST endpoint is used · paymentId(s) issued ·
`GET /api/v1/payments/{paymentId}` status for each · webhook events +
deliveryIds received · orders-row state in Supabase after the step.
Fill the **Actual** column as you go.

| Step | Scenario | Expected (per documented contract / safe behaviour) | Actual |
|---|---|---|---|
| T0 | **Version/contract control:** re-invoke `pay()` for an order with a DIFFERENT amount before any payment. | Rejection — `409 ORDER_AMOUNT_MISMATCH`. If observed → the deployed version implements the documented contract. If not → note the version gap and treat ALL documented behaviours as unproven for this instance. | |
| T1 | **Baseline success:** create an order via the app (`POST /api/orders`), `pay()` with the returned order_id, complete the test payment. | One session, one SUCCESS webhook, order `paid`, invite published. | |
| T2 | **POST-SUCCESS re-invocation (the decisive test):** call `pay()` again with the SAME order_id and SAME amount (fresh browser tab). | (a) gateway reports already-paid / returns the SUCCESS session and no new payment can be made → SAFE signal; (b) a NEW session (new paymentId, status ACTIVE) opens and a second test payment can be completed → **G1 CONFIRMED UNSAFE**; (c) hard error (record which code) → SAFE signal if consistent. If (b): complete the second payment and record — second SUCCESS webhook? second bank credit/UTR? (App-side expectation: the handler treats it as already-paid, no second publication; Q6b stays clean because there is one ORDER — detection is via gateway records + bank credits.) | |
| T3 | **Settled-but-undelivered variant:** repeat T1 with the app's webhook endpoint temporarily unreachable (or delivery paused); complete the payment; then — BEFORE restoring delivery — re-invoke `pay()` with the same order_id. Restore delivery afterwards. | The re-invocation reports already-paid. After delivery is restored, exactly one fulfilment lands. Record whether it reported already-paid or collected again (new session/paymentId). | |
| T4 | **Two-device concurrent variant:** open `pay()` for the same order_id in two browsers/devices near-simultaneously. | Record 200-existing-session vs `409 DEVICE_SESSION_MISMATCH` behaviour through youpi.js (tests whether the browser SDK inherits the REST contract). If a 409 path is offered, follow its suggested `END_SESSION_AND_CREATE_NEW` flow and record whether the resulting session can accept a payment — and, after completing payment in one session, whether the other can still pay. | |
| T5 | **Expiry-then-retry (designed flow):** open `pay()`, let the 5-minute window lapse (EXPIRED), re-invoke `pay()` with the same order_id; complete it. Then immediately attempt T2 once more on the now-paid order_id (post-expiry-cycle success). | After EXPIRED: a new session is expected; completing it yields exactly one SUCCESS and one publication. The final T2 attempt on the paid order_id behaves per T2's outcome. | |

### Closing criteria

- **G1 closes SAFE** only if T2, T3 and T4 (including the
  `END_SESSION_AND_CREATE_NEW` path) ALL show that no second
  completable payment session can be created for an order_id with a
  SUCCESS, **and** T5 shows expiry-retry still works. Then backlog
  Q-16 may be re-marked (with this evidence attached): duplicate
  charges are prevented by gateway semantics + migration 0005.
- **G1 closes UNSAFE** if ANY of T2/T3/T4 yields a second session that
  reaches SUCCESS for the same order_id. Then reused orders must be
  treated as unsafe. Required direction (owner decision): stop
  returning the same order_id to `pay()` after any gateway session
  exists (retire-and-recreate with a fresh order id per attempt —
  needs the D2 staleness design), or move session creation server-side
  via `POST /api/v1/payments` with an Idempotency-Key if the provider
  confirms its semantics (Q5). Keep Q6b/gateway reconciliation as the
  detection control meanwhile.

---

## Part 2 — Written questions for the provider (Q1–Q7)

Send to the YouPI maintainers/provider. Ask for answers tied to a
named gateway version. Record the answers (or the reply reference)
below each question.

**Q1a.** While a payment session for an order_id is ACTIVE, what does
a second `window.Youpi.pay()` (browser SDK) do — return the existing
session, reject, or create a new one? Does the browser SDK behave
identically to `POST /api/v1/payments` (200 existing session / 409
DUPLICATE_SESSION_DETECTED)?

_Answer:_

**Q1b.** After a session for an order_id has reached SUCCESS, what
does a further `pay()`/createPayment with the same order_id and
amount do?

_Answer:_

**Q2.** If a payment has settled but the SUCCESS webhook has not yet
been delivered/acknowledged, does `pay()` report the order as already
paid, or can it collect a second payment?

_Answer:_

**Q3.** Does the gateway enforce at most one successful payment per
order_id (across all sessions, not per session)? If yes, where is the
check implemented and what does the second attempt receive?

_Answer:_

**Q4.** Session expiry is documented as 5 minutes (EXPIRED). After
EXPIRED or CANCELLED, is the order_id immediately reusable for a new
session? Is there any TTL after which an order_id with a SUCCESS
becomes reusable again?

_Answer:_

**Q5.** Does youpi.js send an Idempotency-Key when creating a session?
If a merchant creates sessions via `POST /api/v1/payments` with an
Idempotency-Key, exactly what is deduplicated (same key+orderId? key
alone?) and for how long?

_Answer:_

**Q6.** The 409 DuplicateSessionResponse suggests action
END_SESSION_AND_CREATE_NEW. If a merchant/customer follows that action
after the original session succeeded, can the new session accept a
second payment for the same order_id?

_Answer:_

**Q7.** Which released version(s) implement the documented contract
(ORDER_AMOUNT_MISMATCH on amount-changing reuse; idempotent session
return)? Is there a changelog entry for order/session semantics?

_Answer:_
