import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Impl round 2 (Agent C, C-4): /create had no way to abandon the
// local draft — a stale or corrupt draft resurrected on every visit
// (clearDraft's only production caller was order-success). The
// "Start new" toolbar action clears the draft + its media key and
// resets the editor, after a confirmation.
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => ({
    ...opts,
    useSearch: () => ({}),
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
  useNavigate: () => vi.fn(async () => {}),
}));

vi.mock("@/components/editor/invite-editor", () => ({
  InviteEditor: ({
    config,
    toolbar,
  }: {
    config: { hosts: { person1: string } };
    toolbar?: React.ReactNode;
  }) => (
    <div>
      {toolbar}
      <p data-testid="person1">{config.hosts.person1 || "(blank)"}</p>
    </div>
  ),
}));

import { blankConfig } from "@/lib/invites-api";
import { readDraft, writeDraft } from "@/lib/local-draft";
import { Route as CreateRoute } from "@/routes/create";

const Create = (CreateRoute as unknown as { component: React.ComponentType })
  .component;

function seedDraft() {
  localStorage.clear();
  const config = blankConfig();
  config.hosts = { mode: "couple", person1: "Asha", person2: "Vikram" };
  writeDraft({ themeId: "kesari-mandap", config });
  localStorage.setItem("invite-draft-media-key", "old-media-key");
}

describe("/create Start new (impl round 2, C-4)", () => {
  beforeEach(() => {
    seedDraft();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("confirmed: draft + media key cleared, editor resets blank, fresh media key issued", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Create />);
    expect(await screen.findByTestId("person1")).toHaveTextContent("Asha");

    fireEvent.click(screen.getByRole("button", { name: /start new/i }));

    expect(await screen.findByTestId("person1")).toHaveTextContent("(blank)");
    // The autosave immediately persists the fresh blank draft; what
    // matters is the OLD design and media key are gone.
    expect(readDraft()?.config.hosts.person1 ?? "").toBe("");
    const mediaKey = localStorage.getItem("invite-draft-media-key");
    expect(mediaKey).toBeTruthy();
    expect(mediaKey).not.toBe("old-media-key");
  });

  it("cancelled: the draft is left exactly as it was", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<Create />);
    expect(await screen.findByTestId("person1")).toHaveTextContent("Asha");

    fireEvent.click(screen.getByRole("button", { name: /start new/i }));

    expect(screen.getByTestId("person1")).toHaveTextContent("Asha");
    expect(readDraft()?.config.hosts.person1).toBe("Asha");
    expect(localStorage.getItem("invite-draft-media-key")).toBe(
      "old-media-key",
    );
  });
});
