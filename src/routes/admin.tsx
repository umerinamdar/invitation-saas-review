import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { BRAND, SiteFooter, SiteHeader } from "@/components/site/chrome";
import { useAuth } from "@/lib/auth";
import {
  getAdminOverview,
  isCurrentUserAdmin,
  listRecentInvites,
  listRecentOrders,
  type AdminInviteRow,
  type AdminOrderRow,
  type AdminOverview,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Admin — ${BRAND}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

/** Integer paise → ₹ with Indian digit grouping (₹1,198, ₹599.50). */
function formatRupees(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** First segment of a uuid — enough to recognise a row while scanning;
 *  the full id is one SQL query away when it is actually needed. */
function shortId(id: string): string {
  return id.slice(0, 8);
}

const ORDER_STATUSES = ["created", "paid", "failed", "refunded"] as const;

function Admin() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [orders, setOrders] = useState<AdminOrderRow[] | null>(null);
  const [invites, setInvites] = useState<AdminInviteRow[] | null>(null);
  const [error, setError] = useState("");

  // Same signed-out gate as the dashboard.
  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    (async () => {
      try {
        const admin = await isCurrentUserAdmin();
        if (!active) return;
        if (!admin) {
          // Silent bounce, exactly like a route that is not for you:
          // no "not an admin" copy that would confirm to a curious
          // signed-in user what this URL is for.
          await navigate({ to: "/dashboard" });
          return;
        }
        setIsAdmin(true);
        // Data fetching starts ONLY here — after the admin check has
        // resolved true. (RLS would narrow a non-admin's results to
        // their own rows anyway; the admin read policies in
        // migration 0007 are the boundary, this ordering is hygiene.)
        const [nextOverview, nextOrders, nextInvites] = await Promise.all([
          getAdminOverview(),
          listRecentOrders(),
          listRecentInvites(),
        ]);
        if (!active) return;
        setOverview(nextOverview);
        setOrders(nextOrders);
        setInvites(nextInvites);
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Could not load.");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [session, navigate]);

  if (loading || !session || !isAdmin) {
    return (
      <div className="site">
        <SiteHeader />
        <main className="auth">
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : (
            <LoaderCircle className="loading-spinner" />
          )}
        </main>
      </div>
    );
  }

  const totalOrders = overview
    ? Object.values(overview.ordersByStatus).reduce((sum, n) => sum + n, 0)
    : 0;

  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="page-head dash-head">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Site overview</h1>
            <p className="dash-email">{session.user.email}</p>
          </div>
        </section>

        <section className="dash">
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          {!overview && !error && <LoaderCircle className="loading-spinner" />}

          {overview && (
            <ul className="dash-list">
              <li>
                <div>
                  <h3>{formatRupees(overview.totalRevenuePaise)}</h3>
                  <p>Total revenue — paid orders only</p>
                </div>
              </li>
              <li>
                <div>
                  <h3>{totalOrders}</h3>
                  <p>
                    Orders —{" "}
                    {ORDER_STATUSES.map(
                      (status) =>
                        `${overview.ordersByStatus[status] ?? 0} ${status}`,
                    ).join(" · ")}
                  </p>
                </div>
              </li>
              <li>
                <div>
                  <h3>{overview.totalInvites}</h3>
                  <p>Invitations created</p>
                </div>
              </li>
              <li>
                <div>
                  <h3>{overview.totalUsers}</h3>
                  <p>Registered customers</p>
                </div>
              </li>
            </ul>
          )}

          <section>
            <h2>Recent orders</h2>
            {orders === null && !error && (
              <LoaderCircle className="loading-spinner" />
            )}
            {orders?.length === 0 && <p>No orders yet.</p>}
            {orders && orders.length > 0 && (
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Customer</th>
                    <th>Invitation</th>
                    <th>Paid at</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{formatDate(order.created_at)}</td>
                      <td>
                        {formatRupees(order.amount_minor)}
                        {order.currency !== "INR" ? ` ${order.currency}` : ""}
                      </td>
                      <td>
                        <span className={`status status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{shortId(order.user_id)}</td>
                      <td>
                        {order.invite_id ? shortId(order.invite_id) : "—"}
                      </td>
                      <td>{order.paid_at ? formatDate(order.paid_at) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section>
            <h2>Recent invitations</h2>
            {invites === null && !error && (
              <LoaderCircle className="loading-spinner" />
            )}
            {invites?.length === 0 && <p>No invitations yet.</p>}
            {invites && invites.length > 0 && (
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Slug</th>
                    <th>Theme</th>
                    <th>Status</th>
                    <th>Customer</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((invite) => (
                    <tr key={invite.id}>
                      <td>{formatDate(invite.created_at)}</td>
                      <td>{invite.slug}</td>
                      <td>{invite.theme_id}</td>
                      <td>
                        <span className={`status status-${invite.status}`}>
                          {invite.status}
                        </span>
                      </td>
                      <td>{shortId(invite.user_id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
