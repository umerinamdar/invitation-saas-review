import { useMemo, useState, type ReactNode } from "react";
import { Invitation } from "@/components/invitation";
import { getTheme, themes } from "@/themes";
import type { InviteConfig } from "@/lib/invites-api";

type Props = {
  config: InviteConfig;
  themeId: string;
  onChange: (next: InviteConfig) => void;
  onThemeChange: (id: string) => void;
  /** The bar above the form: save state, publish button, whatever fits. */
  toolbar: ReactNode;
};

/**
 * The form and its live preview. Shared by the signed-out /create route and
 * the signed-in editor so both paths are literally the same editor.
 */
export function InviteEditor({
  config,
  themeId,
  onChange,
  onThemeChange,
  toolbar,
}: Props) {
  // Remounting replays the opening, which is the part people want to re-watch.
  const [previewKey, setPreviewKey] = useState(0);
  const theme = useMemo(() => getTheme(themeId), [themeId]);
  const preview = useMemo(
    () => ({ ...config, slug: "preview", themeId }),
    [config, themeId],
  );

  const patch = (next: Partial<InviteConfig>) =>
    onChange({ ...config, ...next });
  const patchEvent = (next: Partial<InviteConfig["event"]>) =>
    onChange({ ...config, event: { ...config.event, ...next } });
  const patchHosts = (next: Partial<InviteConfig["hosts"]>) =>
    onChange({ ...config, hosts: { ...config.hosts, ...next } });

  return (
    <div className="editor">
      {toolbar}
      <div className="editor-body">
        <form className="editor-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Design</legend>
            <div className="theme-choices">
              {themes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`theme-choice ${option.id === themeId ? "is-active" : ""}`}
                  onClick={() => {
                    onThemeChange(option.id);
                    setPreviewKey((k) => k + 1);
                  }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Your names</legend>
            <label>
              Name
              <input
                value={config.hosts.person1}
                onChange={(e) => patchHosts({ person1: e.target.value })}
                placeholder="Aarav"
              />
            </label>
            <label>
              Partner's name
              <input
                value={config.hosts.person2 ?? ""}
                onChange={(e) => patchHosts({ person2: e.target.value })}
                placeholder="Anaya"
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>The day</legend>
            <label>
              Occasion
              <input
                value={config.event.typeLabel}
                onChange={(e) => patchEvent({ typeLabel: e.target.value })}
                placeholder="Wedding Ceremony"
              />
            </label>
            <label>
              Date and time
              <input
                type="datetime-local"
                value={config.event.startIso.slice(0, 16)}
                onChange={(e) => patchEvent(datePatch(e.target.value))}
              />
            </label>
            <label>
              Venue
              <input
                value={config.event.venueName}
                onChange={(e) => patchEvent({ venueName: e.target.value })}
                placeholder="The Grand Pavilion"
              />
            </label>
            <label>
              Google Maps link
              <input
                value={config.event.venueMapsUrl ?? ""}
                onChange={(e) => patchEvent({ venueMapsUrl: e.target.value })}
                placeholder="https://maps.app.goo.gl/..."
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Your functions</legend>
            {(config.subEvents ?? []).map((sub, index) => (
              <div className="sub-event-row" key={index}>
                <input
                  value={sub.label}
                  placeholder="Mehendi"
                  onChange={(e) =>
                    patch({
                      subEvents: replaceAt(config.subEvents, index, {
                        ...sub,
                        label: e.target.value,
                      }),
                    })
                  }
                />
                <input
                  value={sub.dateText}
                  placeholder="12 February"
                  onChange={(e) =>
                    patch({
                      subEvents: replaceAt(config.subEvents, index, {
                        ...sub,
                        dateText: e.target.value,
                      }),
                    })
                  }
                />
                <input
                  value={sub.timeText}
                  placeholder="6:00 PM"
                  onChange={(e) =>
                    patch({
                      subEvents: replaceAt(config.subEvents, index, {
                        ...sub,
                        timeText: e.target.value,
                      }),
                    })
                  }
                />
                <button
                  type="button"
                  className="row-remove"
                  aria-label={`Remove ${sub.label || "function"}`}
                  onClick={() =>
                    patch({
                      subEvents: (config.subEvents ?? []).filter(
                        (_, i) => i !== index,
                      ),
                    })
                  }
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() =>
                patch({
                  subEvents: [
                    ...(config.subEvents ?? []),
                    { label: "", dateText: "", timeText: "" },
                  ],
                })
              }
            >
              Add a function
            </button>
          </fieldset>

          <fieldset>
            <legend>Your story</legend>
            <label>
              A line for your guests
              <textarea
                rows={2}
                value={config.story?.quote ?? ""}
                onChange={(e) =>
                  patch({ story: { ...config.story, quote: e.target.value } })
                }
                placeholder="Two families, one celebration."
              />
            </label>
            <label>
              Together since
              <input
                type="date"
                value={config.story?.togetherSinceIso?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  patch({ story: sincePatch(config, e.target.value) })
                }
              />
            </label>
          </fieldset>
        </form>

        <div className="editor-preview">
          <div className="phone">
            {/* Rendered at true handset width, then scaled — see site.css. */}
            <div className="phone-screen">
              <Invitation key={previewKey} theme={theme} invite={preview} />
            </div>
          </div>
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => setPreviewKey((k) => k + 1)}
          >
            Replay the opening
          </button>
        </div>
      </div>
    </div>
  );
}

function replaceAt<T>(list: T[] | undefined, index: number, value: T): T[] {
  const next = [...(list ?? [])];
  next[index] = value;
  return next;
}

/** Clearing the field drops the keys rather than storing undefined. */
function sincePatch(
  config: InviteConfig,
  value: string,
): NonNullable<InviteConfig["story"]> {
  const {
    togetherSinceIso: _iso,
    togetherSinceText: _text,
    ...rest
  } = config.story ?? {};
  if (!value) return rest;
  return {
    ...rest,
    togetherSinceIso: `${value}T00:00:00+05:30`,
    togetherSinceText: new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

/** Dates are stored with the event's own offset, not the guest's. */
function datePatch(value: string): Partial<InviteConfig["event"]> {
  if (!value) return { startIso: "", dateText: "", dayText: "", timeText: "" };
  const startIso = `${value}:00+05:30`;
  const date = new Date(startIso);
  return {
    startIso,
    dateText: date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    dayText: date.toLocaleDateString("en-GB", { weekday: "long" }),
    timeText: `${date.toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })} onwards`,
  };
}
