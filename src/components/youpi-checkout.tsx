import { useState } from "react";
import { orderErrorMessage } from "@/lib/checkout-errors";
import type { OrderTier } from "@/lib/orders-api";
import { supabase } from "@/lib/supabase";
import { PUBLISH_PRICE_LABEL, PUBLISH_PRICE_PAISE } from "@/config/site";

/**
 * Audit fix (recommendation 1): the YouPI checkout script used to be
 * injected site-wide from the root route's head — every page, including
 * guests' invitations, loaded a payment script it could never use. It
 * is now loaded lazily by this component, the only place window.Youpi
 * is consumed, when a signed-in owner actually starts checkout. The
 * script element carries the same attributes the root injection used
 * (src from VITE_YOUPI_CHECKOUT_URL, data-youpi-key, data-currency).
 */
let youpiScriptLoad: Promise<void> | null = null;

function ensureYoupiScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Youpi) {
    return Promise.resolve();
  }
  if (!youpiScriptLoad) {
    youpiScriptLoad = new Promise<void>((resolve, reject) => {
      const base = import.meta.env["VITE_YOUPI_CHECKOUT_URL"];
      if (!base) {
        reject(new Error("YouPI checkout is not configured."));
        return;
      }
      const script = document.createElement("script");
      script.src = `${base}/youpi.js`;
      script.async = true;
      script.setAttribute(
        "data-youpi-key",
        import.meta.env["VITE_YOUPI_MERCHANT_PUBLIC_KEY"] || "",
      );
      script.setAttribute("data-currency", "INR");
      script.onload = () => resolve();
      script.onerror = () => {
        // Allow a later click to retry the load.
        youpiScriptLoad = null;
        reject(
          new Error(
            "Couldn't load the payment service. Check your connection and try again.",
          ),
        );
      };
      document.head.appendChild(script);
    });
  }
  return youpiScriptLoad;
}

interface YouPiCheckoutProps {
  inviteId: string;
  /**
   * The signed-in owner's id. Still sent in the body for one release,
   * but /api/orders no longer trusts it: identity comes from the
   * session bearer token below, and the server only checks this value
   * against the session (a mismatch is rejected).
   */
  userId: string;
  tier: OrderTier;
  onSuccess?: (response: { order_id: string; utr: string }) => void;
  onClose?: () => void;
  disabled?: boolean;
}

/**
 * YouPI payment checkout button component.
 * Calls a server endpoint to create the order, then initiates the YouPI checkout modal.
 *
 * Important: The client-side handler is UX only. The real order confirmation
 * happens server-side via webhook signature verification.
 */
export function YouPiCheckout({
  inviteId,
  userId,
  tier,
  onSuccess,
  onClose,
  disabled = false,
}: YouPiCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Batch 2 / Task 4: /api/orders requires the session access token
      // — this component and src/routes/api/orders.ts are ONE contract;
      // ship and roll back together. Fetch the session at click time
      // (the browser client auto-refreshes, so the token is fresh even
      // if the page has been open a while). No session → show a clear
      // error and do NOT POST: a signed-out click must create no order.
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        throw new Error("Your session has expired — please sign in again.");
      }

      // Load the gateway script before creating the order, so a script
      // failure never strands a created order with no way to pay it.
      await ensureYoupiScript();

      // First server-side order creation
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          // Field names must match /api/orders exactly — this used to
          // send `invite_id` and no userId, so every order 400'd.
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

      setOrderId(data.order_id);

      // Defensive re-check: ensureYoupiScript resolving means the
      // gateway object should exist; never open a payment without it.
      if (typeof window === "undefined" || !window.Youpi) {
        throw new Error(
          "Couldn't load the payment service. Check your connection and try again.",
        );
      }

      // Open YouPI checkout modal
      window.Youpi.pay({
        order_id: data.order_id,
        amount: (PUBLISH_PRICE_PAISE / 100).toFixed(2), // Convert paise to rupees
        currency: "INR",
        name: "EasyInviteMaker",
        // Flat ₹599 for every design (src/config/site.ts) — the tier is
        // design metadata only and must not be described as a price tier.
        description: "Invitation publication",
        handler: function (resp: { status: string; order_id: string; utr: string }) {
          // Client-side callback is UX only—real confirmation comes from webhook
          if (resp.status === "SUCCESS") {
            // Redirect to success page to show the user, but don't mark order paid yet.
            // The gateway UTR is deliberately NOT put in the URL (DB-5):
            // the success page shows a transaction reference only from
            // the verified order row, and the raw reference has no
            // business sitting in browser history or URL logs.
            window.location.href = `/order-success?order_id=${resp.order_id}`;
            onSuccess?.(resp);
          }
        },
        onClose: function () {
          setIsLoading(false);
          onClose?.();
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment initiation failed";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="youpi-checkout">
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
 * Declare window.Youpi for TypeScript.
 */
declare global {
  interface Window {
    Youpi: {
      pay: (options: {
        order_id: string;
        amount: string;
        currency: string;
        name: string;
        description: string;
        handler: (response: { status: string; order_id: string; utr: string }) => void;
        onClose: () => void;
      }) => void;
    };
  }
}
