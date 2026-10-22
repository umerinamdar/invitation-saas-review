import { supabase } from "./supabase";

export type OrderStatus = "created" | "paid" | "failed" | "refunded";
export type OrderTier = "classic" | "royal";

export interface OrderRow {
  id: string;
  user_id: string;
  invite_id: string | null;
  tier: OrderTier;
  amount_minor: number;
  currency: string;
  gateway: string;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  status: OrderStatus;
  created_at: string;
  paid_at: string | null;
}

export interface PaymentFields {
  paymentId: string;
  utr?: string;
  amountPaise: number;
}

/**
 * Retrieve a single order by ID.
 *
 * This browser module intentionally contains no order writes (DB-1):
 * order creation happens in the /api/orders route and fulfilment in
 * src/lib/orders-server.ts, both with the service-role client. The
 * pre-Batch-2 browser copies of createOrder / markOrderPaid /
 * markOrderFailed (plus the dead listOrdersForUser / hasInvitePaidOrder
 * readers) were deleted — orders RLS default-denies browser writes
 * today, but leaving privileged helpers in client code invited a
 * future caller to wire them into the UI. Reads here are owner-scoped
 * by the "read own orders" RLS policy; another user's id returns null.
 */
export async function getOrderById(orderId: string): Promise<OrderRow | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  return data as OrderRow | null;
}
