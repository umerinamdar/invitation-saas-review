import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";

interface OrderFailedSearch {
  order_id?: string | undefined;
  reason?: string | undefined;
}

/** Shown whenever the failure reason is absent or not a known code. */
export const ORDER_FAILED_DEFAULT_MESSAGE =
  "We couldn't verify your payment. Your order has not been completed.";

/**
 * The only texts a `reason` code may ever produce. NF-6: this page used
 * to render the raw `reason` URL parameter verbatim — React escaping
 * stopped XSS, but anyone could still craft a branded "payment failed"
 * link displaying arbitrary text. The parameter is now treated purely
 * as a lookup key into this fixed map; unknown codes fall back to the
 * generic message, so crafted text can never reach the page. (No code
 * in the app currently links here with a reason; the codes cover the
 * gateway outcome vocabulary — failed, cancelled, expired, and
 * verification problems — so a future caller stays safe by default.)
 */
const ORDER_FAILED_MESSAGES: Readonly<Record<string, string>> = {
  payment_failed:
    "Your payment could not be completed. You have not been charged for this order.",
  payment_cancelled:
    "You cancelled the payment before it finished. Your invitation is saved — you can try again any time.",
  cancelled:
    "You cancelled the payment before it finished. Your invitation is saved — you can try again any time.",
  session_expired:
    "Your payment session expired before it finished. Please try paying again.",
  expired:
    "Your payment session expired before it finished. Please try paying again.",
  gateway_error:
    "The payment service ran into a problem on its side. Please try again in a few minutes.",
  verification_failed:
    "We couldn't verify your payment with the payment service. If money left your account, contact support with your order ID below.",
  verification_timeout:
    "We couldn't verify your payment with the payment service in time. If money left your account, contact support with your order ID below.",
  timeout:
    "We couldn't verify your payment with the payment service in time. If money left your account, contact support with your order ID below.",
};

/** Maps a `reason` URL code to its fixed customer message — never echoes input. */
export function reasonMessage(code: string | null | undefined): string {
  if (!code) return ORDER_FAILED_DEFAULT_MESSAGE;
  return (
    ORDER_FAILED_MESSAGES[code.trim().toLowerCase()] ??
    ORDER_FAILED_DEFAULT_MESSAGE
  );
}

export const Route = createFileRoute("/order-failed")({
  validateSearch: (search: Record<string, unknown>): OrderFailedSearch => ({
    order_id: (search["order_id"] as string | undefined) || undefined,
    reason: (search["reason"] as string | undefined) || undefined,
  }),
  head: () => ({
    meta: [
      { title: `Payment failed — ${BRAND}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderFailed,
});

function OrderFailed() {
  const search = useSearch({ from: "/order-failed" });
  const orderId = search.order_id;
  const message = reasonMessage(search.reason);

  return (
    <div className="site">
      <SiteHeader />
      <main className="auth status-page">
        <div className="status-icon error">
          <XCircle size={48} />
        </div>
        <h1>Payment verification failed</h1>
        <p className="lede">{message}</p>

        <div className="status-page-actions">
          <Link to="/publish" className="btn btn-solid">
            Try again
          </Link>
          <Link to="/dashboard" className="btn btn-quiet">
            Back to dashboard
          </Link>
        </div>

        <p className="status-note">
          Your design is saved. If you were charged, contact support with order ID: {orderId || "not available"}
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
