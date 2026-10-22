import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Release Fix 9 (Agent C, C-3): MusicPicker's default option was
// labelled "<Theme> theme music / Default" for ALL 14 themes, but
// only Dubai Silk ships a theme track — the other 13 are silent
// until the customer picks the one library track or uploads their
// own. The default option's VALUE is unchanged (undefined = theme
// default); only its label must stop claiming music that isn't
// there.
import { MusicPicker } from "@/components/editor/music-picker";
import { themeDefaultLabel } from "@/lib/music";

describe("themeDefaultLabel (Fix 9 / C-3)", () => {
  it("names the theme music when the theme actually ships a track", () => {
    expect(themeDefaultLabel("Dubai Silk", true)).toBe(
      "Dubai Silk theme music",
    );
  });

  it("says no theme music when the theme is silent by default", () => {
    const label = themeDefaultLabel("Kesari Mandap", false);
    expect(label).toMatch(/^No theme music/);
    expect(label).not.toContain("Kesari Mandap theme music");
  });
});

describe("MusicPicker default option", () => {
  it("shows the honest label and still emits undefined (the theme default) on click", () => {
    const onChange = vi.fn();
    render(
      <MusicPicker
        value="/themes/dubai-silk/track.mp3"
        onChange={onChange}
        themeTrackName={themeDefaultLabel("Kesari Mandap", false)}
      />,
    );
    const option = screen.getByRole("button", { name: /no theme music/i });
    fireEvent.click(option);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
