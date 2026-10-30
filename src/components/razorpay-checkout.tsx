import { useState } from "react";
import { orderErrorMessage } from "@/lib/checkout-errors";
import type { OrderTier } from "@/lib/orders-api";
import { supabase } from "@/lib/supabase";
import { PUBLISH_PRICE_LABEL, PUBLISH_PRICE_PAISE } from "@/config/site";

/**
 * Razorpay's Checkout.js is always served from this one CDN URL for
 * every merchant — unlike the project's earlier self-hosted YouPI
 * script, there is no site-specific base URL to configure. Loaded
 * lazily by this component, the only place window.Razorpay is
 * consumed, when a signed-in owner actually starts checkout.
 */
const RAZORPAY_CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayScriptLoad: Promise<void> | null = null;

function ensureRazorpayScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve();
  }
  if (!razorpayScriptLoad) {
    razorpayScriptLoad = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = RAZORPAY_CHECKOUT_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        // Allow a later click to retry the load.
        razorpayScriptLoad = null;
        reject(
          new Error(
            "Couldn't load the payment service. Check your connection and try again.",
          ),
        );
      };
      document.head.appendChild(script);
    });
  }
  return razorpayScriptLoad;
}

interface RazorpayCheckoutProps {
  inviteId: string;
  /**
   * The signed-in owner's id. Still sent in the body for one release,
   * but /api/orders no longer trusts it: identity comes from the
   * session bearer token below, and the server only checks this value
   * against the session (a mismatch is rejected).
   */
  userId: string;
  tier: OrderTier;
  onSuccess?: (response: { order_id: string }) => void;
  onClose?: () => void;
  disabled?: boolean;
}

/**
 * Razorpay payment checkout button component.
 * Calls a server endpoint to create the order, then opens Razorpay's
 * hosted Checkout modal against the gateway order it returns.
 *
 * Important: the client-side handler is UX only — it redirects to the
 * success page, but marks nothing paid. The real order confirmation
 * happens server-side via webhook signature verification
 * (src/routes/api/webhooks/razorpay.ts), exactly as the project's
 * earlier YouPI integration worked.
 */
export function RazorpayCheckout({
  inviteId,
  userId,
  tier,
  onSuccess,
  onClose,
  disabled = false,
}: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // /api/orders requires the session access token — this component
      // and src/routes/api/orders.ts are ONE contract; ship and roll
      // back together. Fetch the session at click time (the browser
      // client auto-refreshes, so the token is fresh even if the page
      // has been open a while). No session → show a clear error and do
      // NOT POST: a signed-out click must create no order.
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        throw new Error("Your session has expired — please sign in again.");
      }

      // Load the gateway script before creating the order, so a script
      // failure never strands a created order with no way to pay it.
      await ensureRazorpayScript();

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId,
          inviteId,
          tier,
          amountMinor: PUBLISH_PRICE_PAISE, // the one publish price, in paise
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(orderErrorMessage(data.error));
      }

      if (!data.gateway_order_id) {
        throw new Error(
          "Couldn't start the payment. Please try again in a moment.",
        );
      }

      // Defensive re-check: ensureRazorpayScript resolving means the
      // gateway constructor should exist; never open a payment without it.
      if (typeof window === "undefined" || !window.Razorpay) {
        throw new Error(
          "Couldn't load the payment service. Check your connection and try again.",
        );
      }

      const razorpayKeyId = import.meta.env["VITE_RAZORPAY_KEY_ID"];
      if (!razorpayKeyId) {
        throw new Error("Payments are not configured yet.");
      }

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        order_id: data.gateway_order_id,
        name: "EasyInviteMaker",
        // Flat ₹599 for every design (src/config/site.ts) — the tier is
        // design metadata only and must not be described as a price tier.
        description: "Invitation publication",
        handler: function () {
          // Client-side callback is UX only — real confirmation comes
          // from the webhook. The gateway's own payment/signature
          // fields are deliberately NOT inspected or passed along
          // (DB-5): the success page shows a transaction reference
          // only from the verified order row, never from the client.
          window.location.href = `/order-success?order_id=${data.order_id}`;
          onSuccess?.({ order_id: data.order_id });
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            onClose?.();
          },
        },
      });
      rzp.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment initiation failed";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="razorpay-checkout">
      {error && <div className="error-message">{error}</div>}
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="btn btn-solid"
        type="button"
      >
        {isLoading ? "Creating order..." : `Pay ${PUBLISH_PRICE_LABEL} to Publish`}
      </button>
    </div>
  );
}

/**
 * Declare window.Razorpay for TypeScript — the minimal surface this
 * component uses (https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/).
 */
declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      order_id: string;
      name: string;
      description: string;
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => void;
      modal?: { ondismiss?: () => void };
    }) => { open: () => void };
  }
}
