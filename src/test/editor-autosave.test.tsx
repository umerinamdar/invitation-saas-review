import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Release Fix 4 (Agent A, D4): the editor's 900 ms debounced autosave
// cleared its pending timer in the effect cleanup, which also runs on
// UNMOUNT — so closing the tab or navigating away within the window
// silently lost the last edits (only the Publish button flushed).
// The pending save must now FLUSH on unmount with the latest config.
const hoisted = vi.hoisted(() => ({
  navigate: vi.fn(async () => {}),
  getInviteById: vi.fn(),
  saveInvite: vi.fn(),
  // Stable identity, like the real AuthProvider's state: a fresh
  // object per render would re-run the editor's load effect forever
  // and keep rescheduling saves that were never user edits.
  session: { user: { id: "user-1", email: "a@example.com" } },
}));

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ session: hoisted.session, loading: false }),
  useUser: () => hoisted.session.user,
  signOut: vi.fn(async () => {}),
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => ({
    ...opts,
    useParams: () => ({ id: "invite-1" }),
  }),
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
}));

vi.mock("@/lib/invites-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/invites-api")>();
  return {
    ...actual,
    getInviteById: hoisted.getInviteById,
    saveInvite: hoisted.saveInvite,
  };
});

vi.mock("@/components/editor/invite-editor", () => ({
  InviteEditor: ({
    config,
    onChange,
    toolbar,
  }: {
    config: { hosts: { person1: string; person2: string } };
    onChange: (next: never) => void;
    toolbar?: React.ReactNode;
  }) => (
    <div>
      {toolbar}
      <button
        type="button"
        onClick={() =>
          onChange({
            ...config,
            hosts: { ...config.hosts, person1: "Meera" },
          } as never)
        }
      >
        Edit names
      </button>
      <button
        type="button"
        onClick={() =>
          onChange({
            ...config,
            hosts: { ...config.hosts, person1: "Zara" },
          } as never)
        }
      >
        Edit names again
      </button>
    </div>
  ),
}));

import { blankConfig } from "@/lib/invites-api";
import type { InviteRow } from "@/lib/supabase";
import { Route as EditorRoute } from "@/routes/editor.$id";

const Editor = (EditorRoute as unknown as { component: React.ComponentType })
  .component;

function draftRow(): InviteRow {
  const config = blankConfig();
  config.hosts = { mode: "couple", person1: "Asha", person2: "Vikram" };
  return {
    id: "invite-1",
    user_id: "user-1",
    slug: "asha-vikram-x1",
    preview_token: "preview-token",
    theme_id: "kesari-mandap",
    occasion: "wedding",
    config: config as unknown as Record<string, unknown>,
    status: "draft",
    event_date: null,
    published_at: null,
    created_at: "2026-10-21T00:00:00Z",
    updated_at: "2026-10-21T00:00:00Z",
  };
}

describe("editor autosave flush on unmount (Fix 4 / D4)", () => {
  beforeEach(() => {
    localStorage.clear();
    hoisted.getInviteById.mockReset();
    hoisted.saveInvite.mockReset();
    hoisted.getInviteById.mockResolvedValue(draftRow());
    hoisted.saveInvite.mockResolvedValue(draftRow());
  });

  it("edit, then unmount inside the debounce window → the latest config is saved", async () => {
    const { unmount } = render(<Editor />);
    // Load completes (draft row → Publish button in the toolbar).
    await screen.findByRole("button", { name: /publish/i });

    fireEvent.click(screen.getByRole("button", { name: "Edit names" }));
    // Debounce intact: nothing saved yet.
    expect(hoisted.saveInvite).not.toHaveBeenCalled();

    unmount();
    // Impl round 2 (C-5): saves run through a promise chain, so the
    // flushed request fires a microtask after unmount, not inline.
    await waitFor(() => expect(hoisted.saveInvite).toHaveBeenCalledTimes(1));
    const [id, patch] = hoisted.saveInvite.mock.calls[0] as [
      string,
      { config: { hosts: { person1: string } }; theme_id: string },
    ];
    expect(id).toBe("invite-1");
    expect(patch.config.hosts.person1).toBe("Meera");
    expect(patch.theme_id).toBe("kesari-mandap");
  });

  it("unmount with no pending edit saves nothing", async () => {
    const { unmount } = render(<Editor />);
    await screen.findByRole("button", { name: /publish/i });
    unmount();
    expect(hoisted.saveInvite).not.toHaveBeenCalled();
  });
});

describe("editor save chain, failure retention, mirror (impl round 2, C-5/C-6/C-7)", () => {
  beforeEach(() => {
    localStorage.clear();
    hoisted.getInviteById.mockReset();
    hoisted.saveInvite.mockReset();
    hoisted.getInviteById.mockResolvedValue(draftRow());
    hoisted.saveInvite.mockResolvedValue(draftRow());
  });

  it("back-to-back saves are serialized: the second PATCH starts only after the first settles and carries the newer config (C-5)", async () => {
    let resolveFirst!: (row: InviteRow) => void;
    const firstPromise = new Promise<InviteRow>((resolve) => {
      resolveFirst = resolve;
    });
    hoisted.saveInvite.mockImplementationOnce(() => firstPromise);
    render(<Editor />);
    await screen.findByRole("button", { name: /publish/i });

    fireEvent.click(screen.getByRole("button", { name: "Edit names" }));
    await waitFor(() => expect(hoisted.saveInvite).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });

    fireEvent.click(screen.getByRole("button", { name: "Edit names again" }));
    // The second snapshot's debounce fires, but its PATCH must NOT
    // start while the first is still in flight.
    await new Promise((r) => setTimeout(r, 1200));
    expect(hoisted.saveInvite).toHaveBeenCalledTimes(1);

    resolveFirst(draftRow());
    await waitFor(() => expect(hoisted.saveInvite).toHaveBeenCalledTimes(2), {
      timeout: 3000,
    });
    const [, patch2] = hoisted.saveInvite.mock.calls[1] as [
      string,
      { config: { hosts: { person1: string } } },
    ];
    expect(patch2.config.hosts.person1).toBe("Zara");
    expect(await screen.findByText("Saved")).toBeTruthy();
  });

  it("a failed save keeps its snapshot pending: unmount retries it (C-6)", async () => {
    hoisted.saveInvite.mockRejectedValueOnce(new Error("network down"));
    hoisted.saveInvite.mockResolvedValue(draftRow());
    const { unmount } = render(<Editor />);
    await screen.findByRole("button", { name: /publish/i });

    fireEvent.click(screen.getByRole("button", { name: "Edit names" }));
    await waitFor(() => expect(hoisted.saveInvite).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
    expect(await screen.findByText(/could not save/i)).toBeTruthy();

    unmount();
    await waitFor(() => expect(hoisted.saveInvite).toHaveBeenCalledTimes(2));
    const [, patch] = hoisted.saveInvite.mock.calls[1] as [
      string,
      { config: { hosts: { person1: string } } },
    ];
    expect(patch.config.hosts.person1).toBe("Meera");
  });

  it("an edit is mirrored locally at once; a successful save clears the mirror (C-7)", async () => {
    render(<Editor />);
    await screen.findByRole("button", { name: /publish/i });

    fireEvent.click(screen.getByRole("button", { name: "Edit names" }));
    const raw = localStorage.getItem("invite-editor-mirror:user-1:invite-1");
    expect(raw).toBeTruthy();
    const mirror = JSON.parse(raw!) as {
      config: { hosts: { person1: string } };
    };
    expect(mirror.config.hosts.person1).toBe("Meera");

    await waitFor(() => expect(hoisted.saveInvite).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
    await waitFor(() =>
      expect(
        localStorage.getItem("invite-editor-mirror:user-1:invite-1"),
      ).toBeNull(),
    );
  });

  it("a mirror newer than the server row is restored on load and queued for saving (C-7)", async () => {
    const config = blankConfig();
    config.hosts = { mode: "couple", person1: "Recovered", person2: "Vikram" };
    localStorage.setItem(
      "invite-editor-mirror:user-1:invite-1",
      JSON.stringify({
        config,
        themeId: "kesari-mandap",
        savedAt: Date.now(),
      }),
    );
    render(<Editor />);
    await screen.findByRole("button", { name: /publish/i });
    await waitFor(() => expect(hoisted.saveInvite).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
    const [, patch] = hoisted.saveInvite.mock.calls[0] as [
      string,
      { config: { hosts: { person1: string } } },
    ];
    expect(patch.config.hosts.person1).toBe("Recovered");
  });
});
