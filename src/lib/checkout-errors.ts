/**
 * Impl round 2 (Agent D, D-1): /api/orders answers failures with
 * machine codes ("invite_already_paid", …) which the checkout used
 * to throw verbatim into the customer's face. Map the known codes
 * to plain language; anything unknown gets a generic message — a
 * raw code never renders.
 */
export function orderErrorMessage(code: unknown): string {
  switch (code) {
    case "invite_already_paid":
      return "This invitation has already been paid for and published — you'll find its live link on your dashboard.";
    case "invite_not_publishable":
      return "This invitation can't be published in its current state. If it's archived, it can no longer be published.";
    case "invitation_incomplete":
      return "Your invitation is missing a few details. Head back to the editor, fill in the highlighted items, then try again.";
    case "duplicate_active_order":
      return "A checkout for this invitation is already in progress. Give it a moment, then check your dashboard before trying again.";
    default:
      return "We couldn't start the payment just now. Please try again in a moment.";
  }
}
