import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Release Fix 3 (Agent A, D3): /publish's handlePublish used to insert
// a NEW invite row on every attempt. Abandon checkout and retry, and
// each orphaned row could arm its own ₹599 order — defeating the
// per-invite order guard from Round 3.7. The draft now remembers the
// row created from it: a retry reuses that row (syncing the latest
// draft config onto it) and checkout arms for the same invite id;
// if that row has since been published, no new row and no checkout.
const hoisted = vi.hoisted(() => ({
  session: {
    user: { id: "user-1", email: "a@example.com" },
  } as null | { user: { id: string; email: string } },
  navigate: vi.fn(async () => {}),
  createInvite: vi.fn(),
  getInviteById: vi.fn(),
  saveInvite: vi.fn(async () => ({})),
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ session: hoisted.session, loading: false }),
  useUser: () => hoisted.session?.user ?? null,
  signOut: vi.fn(async () => {}),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => opts,
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string;
    children?: React.ReactNode;
  }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useNavigate: () => hoisted.navigate,
  useSearch: () => ({}),
}));

vi.mock("@/lib/invites-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/invites-api")>();
  return {
    ...actual,
    createInvite: hoisted.createInvite,
    getInviteById: hoisted.getInviteById,
    saveInvite: hoisted.saveInvite,
  };
});

vi.mock("@/components/razorpay-checkout", () => ({
  RazorpayCheckout: ({ inviteId }: { inviteId: string }) => (
    <div data-testid="checkout" data-invite={inviteId} />
  ),
}));

import { LocaleProvider } from "@/i18n/locale-context";
import { blankConfig, type InviteConfig } from "@/lib/invites-api";
import { readDraft, setDraftInviteId, writeDraft } from "@/lib/local-draft";
import type { InviteRow } from "@/lib/supabase";
import { draftInviteReuse, Route as PublishRoute } from "@/routes/publish";

const Publish = (PublishRoute as unknown as { component: React.ComponentType })
  .component;

function validConfig(): InviteConfig {
  const config = blankConfig();
  config.hosts = { mode: "couple", person1: "Asha", person2: "Vikram" };
  config.event = {
    ...config.event,
    startIso: "2027-02-12T10:00:00+05:30",
    dateText: "12 February 2027",
    venueName: "Palm Grove",
  };
  return config;
}

function row(overrides: Partial<InviteRow> = {}): InviteRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "user-1",
    slug: "asha-vikram-x1",
    preview_token: "preview-token",
    theme_id: "kesari-mandap",
    occasion: "wedding",
    config: validConfig() as unknown as Record<string, unknown>,
    status: "draft",
    event_date: null,
    published_at: null,
    created_at: "2026-10-21T00:00:00Z",
    updated_at: "2026-10-21T00:00:00Z",
    ...overrides,
  };
}

function seedDraft(withInviteId: boolean) {
  localStorage.clear();
  writeDraft({ themeId: "kesari-mandap", config: validConfig() });
  if (withInviteId) setDraftInviteId("11111111-1111-4111-8111-111111111111");
}

async function clickPay() {
  const button = await screen.findByRole("button", {
    name: /pay .* to publish/i,
  });
  fireEvent.click(button);
}

describe("draftInviteReuse decision", () => {
  it("no stored row (or it vanished) → create fresh", () => {
    expect(draftInviteReuse(null, "user-1")).toBe("create");
  });

  it("own draft row → reuse", () => {
    expect(draftInviteReuse(row(), "user-1")).toBe("reuse");
  });

  it("own published row → published (never insert, never re-charge)", () => {
    expect(draftInviteReuse(row({ status: "published" }), "user-1")).toBe(
      "published",
    );
  });

  it("own archived row → create fresh", () => {
    expect(draftInviteReuse(row({ status: "archived" }), "user-1")).toBe(
      "create",
    );
  });

  it("another account's row is never reused or treated as published", () => {
    // getInviteById can return a stranger's PUBLISHED row (published
    // rows are anonymously readable) — e.g. a draft id left in a
    // shared browser. It must not block or hijack this user's flow.
    expect(draftInviteReuse(row({ user_id: "someone-else" }), "user-1")).toBe(
      "create",
    );
    expect(
      draftInviteReuse(
        row({ user_id: "someone-else", status: "published" }),
        "user-1",
      ),
    ).toBe("create");
  });
});

describe("publish draft-invite reuse (Fix 3 / D3)", () => {
  beforeEach(() => {
    hoisted.createInvite.mockReset();
    hoisted.getInviteById.mockReset();
    hoisted.saveInvite.mockClear();
    hoisted.createInvite.mockResolvedValue(row());
    hoisted.getInviteById.mockResolvedValue(row());
  });

  it("first attempt inserts one row, stores its id on the draft, and arms checkout for it", async () => {
    seedDraft(false);
    // Impl round 2 (C-3): the id is generated client-side and must
    // ALREADY be on the draft when createInvite is called, and the
    // insert must carry that same id explicitly.
    let idSeenByInsert: string | undefined;
    let idStoredBeforeInsert: string | undefined;
    hoisted.createInvite.mockImplementation(
      async (_u: string, _t: string, _c: unknown, id?: string) => {
        idSeenByInsert = id;
        idStoredBeforeInsert = readDraft()?.draftInviteId;
        return row({ id: id ?? "11111111-1111-4111-8111-111111111111" });
      },
    );
    render(
      <LocaleProvider>
        <Publish />
      </LocaleProvider>,
    );
    await clickPay();
    const checkout = await screen.findByTestId("checkout");
    expect(idSeenByInsert).toBeTruthy();
    expect(idStoredBeforeInsert).toBe(idSeenByInsert);
    expect(checkout).toHaveAttribute("data-invite", idSeenByInsert);
    expect(hoisted.createInvite).toHaveBeenCalledTimes(1);
    expect(readDraft()?.draftInviteId).toBe(idSeenByInsert);
  });

  it("a lost insert response retries onto its OWN row — no duplicate (C-2 + C-3 sequence)", async () => {
    seedDraft(false);
    let insertedRow: InviteRow | null = null;
    hoisted.createInvite.mockImplementation(
      async (_u: string, _t: string, _c: unknown, id?: string) => {
        // The row lands server-side, then the response is lost.
        insertedRow = row({ id: id! });
        throw new Error("network response lost");
      },
    );
    const first = render(
      <LocaleProvider>
        <Publish />
      </LocaleProvider>,
    );
    await clickPay();
    expect(await screen.findByText(/network response lost/i)).toBeTruthy();
    expect(hoisted.createInvite).toHaveBeenCalledTimes(1);
    first.unmount();

    // Retry: the reuse lookup now finds the row the first attempt
    // actually created, because its id was stored before inserting.
    hoisted.getInviteById.mockResolvedValue(insertedRow);
    render(
      <LocaleProvider>
        <Publish />
      </LocaleProvider>,
    );
    await clickPay();
    const checkout = await screen.findByTestId("checkout");
    expect(checkout).toHaveAttribute("data-invite", insertedRow!.id);
    expect(hoisted.createInvite).toHaveBeenCalledTimes(1);
    expect(hoisted.saveInvite).toHaveBeenCalledWith(
      insertedRow!.id,
      expect.objectContaining({ theme_id: "kesari-mandap" }),
    );
  });

  it("a transient reuse-lookup failure does NOT insert a duplicate — it errors (C-2)", async () => {
    seedDraft(true);
    hoisted.getInviteById.mockRejectedValue(
      Object.assign(new Error("fetch failed"), { code: "ECONNRESET" }),
    );
    render(
      <LocaleProvider>
        <Publish />
      </LocaleProvider>,
    );
    await clickPay();
    expect(await screen.findByText(/fetch failed/i)).toBeTruthy();
    expect(hoisted.createInvite).not.toHaveBeenCalled();
    expect(screen.queryByTestId("checkout")).toBeNull();
  });

  it("a genuine not-found lookup (PGRST116) still creates fresh (C-2)", async () => {
    seedDraft(true);
    hoisted.getInviteById.mockRejectedValue(
      Object.assign(new Error("JSON object requested, no rows"), {
        code: "PGRST116",
      }),
    );
    render(
      <LocaleProvider>
        <Publish />
      </LocaleProvider>,
    );
    await clickPay();
    const checkout = await screen.findByTestId("checkout");
    expect(checkout).toBeTruthy();
    expect(hoisted.createInvite).toHaveBeenCalledTimes(1);
  });

  it("retry reuses the stored row: no second insert, latest config saved onto it, same checkout", async () => {
    seedDraft(true);
    render(
      <LocaleProvider>
        <Publish />
      </LocaleProvider>,
    );
    await clickPay();
    const checkout = await screen.findByTestId("checkout");
    expect(checkout).toHaveAttribute(
      "data-invite",
      "11111111-1111-4111-8111-111111111111",
    );
    expect(hoisted.createInvite).not.toHaveBeenCalled();
    expect(hoisted.saveInvite).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      expect.objectContaining({ theme_id: "kesari-mandap" }),
    );
  });

  it("when the stored row is already published: no insert, no checkout, a plain explanation", async () => {
    seedDraft(true);
    hoisted.getInviteById.mockResolvedValue(
      row({ status: "published", published_at: "2026-10-22T00:00:00Z" }),
    );
    render(
      <LocaleProvider>
        <Publish />
      </LocaleProvider>,
    );
    await clickPay();
    expect(await screen.findByText(/already published/i)).toBeTruthy();
    expect(hoisted.createInvite).not.toHaveBeenCalled();
    expect(screen.queryByTestId("checkout")).toBeNull();
  });
});
