/**
 * Task 9 (editor autosave deep dive).
 * Extends
 * src/test/editor-autosave.test.tsx (same mock scaffolding). The
 * existing suite proves serialization WITHIN one mount; these three
 * tests cover what it does not: serialization ACROSS a remount, the
 * goPublish await window, mirror-shape trust, and mirror lifetime.
 * The defect tests were reproduced against the pre-fix code before
 * the accompanying editor/local-draft changes were made.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  navigate: vi.fn(async () => {}),
  getInviteById: vi.fn(),
  saveInvite: vi.fn(),
  session: { user: { id: "user-1", email: "a@example.com" } },
  lastEditorConfig: null as null | Record<string, unknown>,
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
    config: Record<string, unknown>;
    onChange: (next: never) => void;
    toolbar?: React.ReactNode;
  }) => {
    hoisted.lastEditorConfig = config;
    const hosts = config["hosts"] as { person1: string; person2: string };
    return (
      <div>
        {toolbar}
        <button
          type="button"
          onClick={() =>
            onChange({
              ...config,
              hosts: { ...hosts, person1: "Meera" },
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
              hosts: { ...hosts, person1: "Zara" },
            } as never)
          }
        >
          Edit names again
        </button>
      </div>
    );
  },
}));

import { blankConfig } from "@/lib/invites-api";
import { clearLocalDraftData } from "@/lib/local-draft";
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

beforeEach(() => {
  localStorage.clear();
  hoisted.navigate.mockClear();
  hoisted.getInviteById.mockReset();
  hoisted.saveInvite.mockReset();
  hoisted.getInviteById.mockResolvedValue(draftRow());
  hoisted.saveInvite.mockResolvedValue(draftRow());
});

describe("autosave across unmount + remount", () => {
  // The C-5 promise chain lives in per-mount refs (saveChain,
  // generation, pendingSnapshot are useRef state). Unmounting and
  // remounting the editor mints a FRESH chain, so a PATCH still in
  // flight from the first mount can land AFTER the remounted
  // editor's newer save — the exact stale-overwrite C-5 was meant to
  // kill, one level up. Reachable: edit → Done → reopen the same
  // invite from the dashboard while the save is still in flight
  // (slow network), edit again, save.
  it("a save in flight at unmount still serialises the remounted editor's save", async () => {
    let resolveFirst!: (row: InviteRow) => void;
    hoisted.saveInvite.mockImplementationOnce(
      () =>
        new Promise<InviteRow>((resolve) => {
          resolveFirst = resolve;
        }),
    );

    const first = render(<Editor />);
    await screen.findByRole("button", { name: /publish/i });
    fireEvent.click(screen.getByRole("button", { name: "Edit names" }));
    await waitFor(() => expect(hoisted.saveInvite).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
    // First PATCH is now in flight (deferred). Leave and come back.
    first.unmount();
    render(<Editor />);
    await screen.findByRole("button", { name: /publish/i });
    fireEvent.click(screen.getByRole("button", { name: "Edit names again" }));

    // Desired: the remounted editor's PATCH must not START until the
    // orphaned one settles — otherwise resolution order, not edit
    // order, decides the stored config.
    await new Promise((r) => setTimeout(r, 1200));
    expect(hoisted.saveInvite).toHaveBeenCalledTimes(1); // today: 2

    resolveFirst(draftRow());
    await waitFor(() => expect(hoisted.saveInvite).toHaveBeenCalledTimes(2), {
      timeout: 3000,
    });
    const [, patch2] = hoisted.saveInvite.mock.calls[1] as [
      string,
      { config: { hosts: { person1: string } } },
    ];
    expect(patch2.config.hosts.person1).toBe("Zara");
  });
});

describe("goPublish while a save is in flight", () => {
  // goPublish awaits the chain for the snapshot that existed when it
  // was clicked, but the editor stays interactive during the await:
  // a NEWER edit made in that window schedules a snapshot goPublish
  // never looks at, and navigation proceeds — /publish then reads a
  // server row that may not yet contain the newest edit (the unmount
  // flush races publish's own read).
  it("an edit made while Publish is awaiting a save is not raced past", async () => {
    let resolveSave!: (row: InviteRow) => void;
    hoisted.saveInvite.mockImplementation(
      () =>
        new Promise<InviteRow>((resolve) => {
          resolveSave = resolve;
        }),
    );
    render(<Editor />);
    await screen.findByRole("button", { name: /publish/i });

    fireEvent.click(screen.getByRole("button", { name: "Edit names" }));
    // The save is still only a pending snapshot (its debounce has not
    // fired), so Publish is enabled — the reachable race window.
    expect(hoisted.saveInvite).not.toHaveBeenCalled();

    // Publish: goPublish executes that snapshot itself and awaits it.
    fireEvent.click(screen.getByRole("button", { name: /publish/i }));
    await waitFor(() => expect(hoisted.saveInvite).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
    // The customer corrects a name while the save is still landing.
    fireEvent.click(screen.getByRole("button", { name: "Edit names again" }));

    resolveSave(draftRow());
    // Desired: navigation must wait until the newer snapshot has
    // also been saved (goPublish should re-check pendingSnapshot
    // after the await). Today it navigates immediately.
    await new Promise((r) => setTimeout(r, 300));
    expect(hoisted.navigate).not.toHaveBeenCalled(); // today: called
  });
});

describe("mirror restore shape", () => {
  // The server path merges the stored config over blankConfig()
  // (toInvite); the mirror path trusts the mirrored JSON wholesale
  // (setConfig(mirror.config)). A mirror written by an older build —
  // or a partially-shaped one — reaches InviteEditor missing whole
  // branches (event/gallery/meta) that the editor dereferences.
  it("a partial mirror is merged over the blank config before use", async () => {
    localStorage.setItem(
      "invite-editor-mirror:user-1:invite-1",
      JSON.stringify({
        config: {
          hosts: { mode: "couple", person1: "Recovered", person2: "Vikram" },
        },
        themeId: "kesari-mandap",
        savedAt: Date.now(),
      }),
    );
    render(<Editor />);
    await screen.findByRole("button", { name: /publish/i });
    const config = hoisted.lastEditorConfig!;
    expect(config["event"]).toBeDefined(); // today: undefined
    expect(config["gallery"]).toBeDefined();
    expect(config["meta"]).toBeDefined();
    expect(
      (config["hosts"] as { person1: string }).person1,
    ).toBe("Recovered");
  });
});

describe("editor mirrors and identity change", () => {
  // The C-1 cross-account fix clears the /create draft + media key
  // when the signed-in identity changes (auth.tsx calls
  // clearLocalDraftData). Editor mirrors — a FULL copy of a customer's
  // invitation config per invite — are never cleared by anything:
  // they survive sign-out on a shared browser indefinitely, and
  // accumulate one key per invite forever (incl. deleted invites).
  // They are keyed by user id, so another account cannot RESTORE one
  // through the UI — this is a data-residue problem, not a live leak.
  it("the identity-change clear also removes the departing user's editor mirrors", () => {
    localStorage.setItem(
      "invite-editor-mirror:user-1:invite-1",
      JSON.stringify({ config: {}, themeId: "x", savedAt: 1 }),
    );
    localStorage.setItem(
      "invite-editor-mirror:user-2:invite-9",
      JSON.stringify({ config: {}, themeId: "x", savedAt: 1 }),
    );
    // auth.tsx passes the departing user id when the identity
    // changes away from user-1; the pinned behaviour is that only
    // that user's mirrors are removed.
    clearLocalDraftData("user-1");
    expect(
      localStorage.getItem("invite-editor-mirror:user-1:invite-1"),
    ).toBeNull(); // today: still present
    // Another user's mirror is theirs — it must survive.
    expect(
      localStorage.getItem("invite-editor-mirror:user-2:invite-9"),
    ).not.toBeNull();
  });
});
