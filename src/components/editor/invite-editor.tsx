import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Invitation } from "@/components/invitation";
import { getTheme, themes } from "@/themes";
import { MusicPicker } from "./music-picker";
import { PhotoPicker } from "./photo-picker";
import type { InviteConfig } from "@/lib/invites-api";
import {
  collectInviteMediaPaths,
  signInviteMediaPaths,
  type MediaUrlMap,
} from "@/lib/media-url";
import { supabase } from "@/lib/supabase";
import {
  getDraftIssues,
  mapsUrlWarning,
  type DraftIssueField,
} from "@/lib/draft-validation";
import type { GalleryImage } from "@/invites/types";
import { themeDefaultLabel } from "@/lib/music";
import { useLocale } from "@/i18n/locale-context";
import { useUser } from "@/lib/auth";
import type { MediaUploadScope } from "@/lib/media-upload";

/**
 * Shown in the live preview only, for any photo slot the couple hasn't
 * uploaded to yet — so the preview looks finished from the start instead of
 * showing empty gaps. Never written into `config`, so it can never end up
 * in a saved draft or a published invitation.
 */
const SAMPLE_GALLERY: GalleryImage[] = [
  {
    slot: "childhood",
    url: "/demo/sample-couple/together.jpg",
    alt: "Sample photo of a couple in festive Indian wedding attire",
    width: 900,
    height: 900,
  },
  {
    slot: "forever",
    url: "/demo/sample-couple/forever.jpg",
    alt: "Sample photo of a couple walking together outdoors at golden hour",
    width: 900,
    height: 900,
  },
];

type Props = {
  config: InviteConfig;
  themeId: string;
  onChange: (next: InviteConfig) => void;
  onThemeChange: (id: string) => void;
  /** Existing invite row id, when the editor is backed by the database. */
  inviteId?: string | undefined;
  /** Stable local-draft key, when /create has not created an invite row. */
  draftMediaKey?: string | undefined;
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
  inviteId,
  draftMediaKey,
  toolbar,
}: Props) {
  // Remounting replays the opening, which is the part people want to re-watch.
  const [previewKey, setPreviewKey] = useState(0);
  const { t } = useLocale();
  const user = useUser();
  // Storage's owner-write policy takes segment one from the signed-in
  // user's id. Without a user, or without an invite/draft scope for
  // segment two, the pickers explain that uploads cannot be saved yet
  // instead of putting a session-only blob URL into the invitation.
  let mediaScope: MediaUploadScope | undefined;
  if (user && inviteId) {
    mediaScope = { userId: user.id, inviteId };
  } else if (user && draftMediaKey) {
    mediaScope = { userId: user.id, draftKey: draftMediaKey };
  }
  // Impl round 2 (Agent E, E-6): once migration 0003 makes the
  // bucket private, the public-URL fallback stops working — guests
  // stayed fine (the server signs their map) but the OWNER's editor
  // preview and photo-picker thumbnails broke on reload. The editor
  // now signs the owner's own config media paths with the browser
  // client (0003's owner-read storage policy permits exactly that)
  // and hands the map to the preview and the picker. Fail-soft: any
  // signing failure leaves the path out of the map and resolution
  // falls back to the public URL — precisely the pre-0003 behaviour,
  // so shipping this before 0003 is applied changes nothing.
  const [mediaUrlMap, setMediaUrlMap] = useState<MediaUrlMap>({});
  const signedPathsRef = useRef<Record<string, string>>({});
  const mapMintedAtRef = useRef(0);
  useEffect(() => {
    if (!user) return;
    // Signed URLs live an hour (MEDIA_SIGNED_URL_TTL_SECONDS);
    // re-mint the whole set well before expiry so a long editing
    // session doesn't decay into broken thumbnails.
    if (Date.now() - mapMintedAtRef.current > 50 * 60 * 1000) {
      signedPathsRef.current = {};
    }
    const missing = collectInviteMediaPaths(config).filter(
      (path) => !(path in signedPathsRef.current),
    );
    if (missing.length === 0) return;
    let active = true;
    void signInviteMediaPaths(supabase, missing).then((signed) => {
      if (!active) return;
      if (Object.keys(signed).length > 0) {
        signedPathsRef.current = { ...signedPathsRef.current, ...signed };
        mapMintedAtRef.current = Date.now();
        setMediaUrlMap(signedPathsRef.current);
      }
    });
    return () => {
      active = false;
    };
  }, [config, user]);

  const theme = useMemo(() => getTheme(themeId), [themeId]);
  const preview = useMemo(() => {
    const filledSlots = new Set(config.gallery.map((g) => g.slot));
    const samples = SAMPLE_GALLERY.filter((g) => !filledSlots.has(g.slot));
    return {
      ...config,
      slug: "preview",
      themeId,
      gallery: [...config.gallery, ...samples],
    };
  }, [config, themeId]);

  // Same checks the Publish button and /publish apply. Inline errors
  // are shown for values the host has actually typed (a mistyped
  // WhatsApp number or Maps link); still-empty required fields are
  // named by the publish gate instead of nagging a fresh draft.
  const issues = getDraftIssues(config);
  const issueFor = (field: DraftIssueField) =>
    issues.find((issue) => issue.field === field);
  const mapsWarning = mapsUrlWarning(config);

  const patch = (next: Partial<InviteConfig>) =>
    onChange({ ...config, ...next });
  const patchEvent = (next: Partial<InviteConfig["event"]>) =>
    onChange({ ...config, event: { ...config.event, ...next } });
  const patchHosts = (next: Partial<InviteConfig["hosts"]>) =>
    onChange({ ...config, hosts: { ...config.hosts, ...next } });
  const patchFamily = (
    which: "family1" | "family2",
    next: Record<string, string>,
  ) =>
    onChange({
      ...config,
      hosts: {
        ...config.hosts,
        [which]: { ...config.hosts[which], ...next },
      },
    });

  return (
    <div className="editor">
      {toolbar}
      <main className="editor-body">
        <form className="editor-form" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>{t("editor.design")}</legend>
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
            <legend>{t("editor.yourNames")}</legend>
            <label>
              {t("editor.name")}
              <input
                value={config.hosts.person1}
                onChange={(e) => patchHosts({ person1: e.target.value })}
                placeholder="Aarav"
              />
            </label>
            <label>
              {t("editor.partnersName")}
              <input
                value={config.hosts.person2 ?? ""}
                onChange={(e) => patchHosts({ person2: e.target.value })}
                placeholder="Diya"
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>{t("editor.families")}</legend>
            <p className="editor-note">{t("editor.familiesNote")}</p>
            {(
              [
                [
                  "family1",
                  config.hosts.person1 || t("editor.firstSide"),
                  "Mr. & Mrs. Rajeev Mehra",
                  "Late Shri Mohanlal Mehra",
                  "MBBS, MD",
                ],
                [
                  "family2",
                  config.hosts.person2 || t("editor.secondSide"),
                  "Dr. & Mrs. Suresh Iyer",
                  "Shri & Smt. Ramanathan Iyer",
                  "MA, PhD",
                ],
              ] as const
            ).map(([key, who, parentsPlaceholder, grandparentsPlaceholder, credentialsPlaceholder]) => (
              <div key={key} className="family-fields">
                <p className="family-fields-who">{who}</p>
                <label>
                  {t("editor.parents")}
                  <input
                    value={config.hosts[key]?.parents ?? ""}
                    onChange={(e) =>
                      patchFamily(key, { parents: e.target.value })
                    }
                    placeholder={parentsPlaceholder}
                  />
                </label>
                <label>
                  {t("editor.grandparents")}
                  <input
                    value={config.hosts[key]?.grandparents ?? ""}
                    onChange={(e) =>
                      patchFamily(key, { grandparents: e.target.value })
                    }
                    placeholder={grandparentsPlaceholder}
                  />
                </label>
                <label>
                  {t("editor.qualifications")}
                  <input
                    value={config.hosts[key]?.credentials ?? ""}
                    onChange={(e) =>
                      patchFamily(key, { credentials: e.target.value })
                    }
                    placeholder={credentialsPlaceholder}
                  />
                </label>
              </div>
            ))}
          </fieldset>

          <fieldset>
            <legend>{t("editor.openingText")}</legend>
            <p className="field-hint">{t("editor.openingTextHint")}</p>
            <label>
              {t("editor.welcomeLine")}
              <textarea
                rows={2}
                value={config.welcome ?? ""}
                onChange={(e) =>
                  patch(
                    e.target.value
                      ? { welcome: e.target.value }
                      : (() => {
                          const { welcome: _drop, ...rest } = config;
                          return rest;
                        })(),
                  )
                }
                placeholder="With the blessings of our families, we invite you to share in the joy of our wedding."
              />
            </label>
            <label>
              {t("editor.blessingOrVerse")}
              <textarea
                rows={2}
                value={config.blessing?.text ?? ""}
                onChange={(e) => {
                  if (!e.target.value) {
                    const { blessing: _drop, ...rest } = config;
                    onChange(rest);
                    return;
                  }
                  patch({
                    blessing: { ...config.blessing, text: e.target.value },
                  });
                }}
                placeholder="May this union be blessed with harmony, understanding and a lifetime of shared joy."
              />
            </label>
            {config.blessing?.text && (
              <label>
                {t("editor.attribution")}
                <input
                  value={config.blessing?.attribution ?? ""}
                  onChange={(e) =>
                    patch({
                      blessing: {
                        ...config.blessing!,
                        attribution: e.target.value,
                      },
                    })
                  }
                  placeholder="A blessing for the couple"
                />
              </label>
            )}
          </fieldset>

          <fieldset>
            <legend>{t("editor.theDay")}</legend>
            <label>
              {t("editor.occasion")}
              <input
                value={config.event.typeLabel}
                onChange={(e) => patchEvent({ typeLabel: e.target.value })}
                placeholder="Wedding Ceremony"
              />
            </label>
            <label>
              {t("editor.dateAndTime")}
              <input
                type="datetime-local"
                value={config.event.startIso.slice(0, 16)}
                onChange={(e) => patchEvent(datePatch(e.target.value))}
              />
            </label>
            {config.event.startIso && issueFor("date") && (
              <p className="field-error">{issueFor("date")!.message}</p>
            )}
            <label>
              {t("editor.venue")}
              <input
                value={config.event.venueName}
                onChange={(e) => patchEvent({ venueName: e.target.value })}
                placeholder="The Grand Pavilion"
              />
            </label>
            <label>
              {t("editor.googleMapsLink")}
              <input
                value={config.event.venueMapsUrl ?? ""}
                onChange={(e) => patchEvent({ venueMapsUrl: e.target.value })}
                placeholder="https://maps.app.goo.gl/..."
              />
            </label>
            {issueFor("mapsUrl") ? (
              <p className="field-error">{issueFor("mapsUrl")!.message}</p>
            ) : mapsWarning ? (
              <p className="field-hint">{mapsWarning}</p>
            ) : null}
            <p className="field-hint">{t("editor.mapsHint")}</p>
          </fieldset>

          <fieldset>
            <legend>{t("editor.yourFunctions")}</legend>
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
              {t("editor.addFunction")}
            </button>
          </fieldset>

          <fieldset>
            <legend>{t("editor.replies")}</legend>
            <label>
              {t("editor.whatsappNumber")}
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={config.rsvp?.whatsapp ?? ""}
                onChange={(e) =>
                  patch({
                    rsvp: {
                      ...config.rsvp,
                      enabled: true,
                      whatsapp: e.target.value,
                    },
                  })
                }
                placeholder="+91 98200 00000"
              />
            </label>
            {issueFor("whatsapp") && (
              <p className="field-error">{issueFor("whatsapp")!.message}</p>
            )}
            <label>
              {t("editor.replyBy")}
              <input
                value={config.rsvp?.byDateText ?? ""}
                onChange={(e) =>
                  patch({
                    rsvp: {
                      ...config.rsvp,
                      enabled: true,
                      byDateText: e.target.value,
                    },
                  })
                }
                placeholder="20 January 2027"
              />
            </label>
            <label>
              {t("editor.yourHashtag")}
              <input
                value={config.hashtag ?? ""}
                onChange={(e) => patch({ hashtag: e.target.value })}
                placeholder="#AaravWedsDiya"
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>{t("editor.travelStay")}</legend>
            <label>
              {t("editor.gettingThere")}
              <textarea
                rows={2}
                value={config.logistics?.transport ?? ""}
                onChange={(e) =>
                  patch({
                    logistics: {
                      ...config.logistics,
                      transport: e.target.value,
                    },
                  })
                }
                placeholder="The airport is 40 minutes away. Cars will run from the hotels from 6:00 PM."
              />
            </label>
            <label>
              {t("editor.whereToStay")}
              <textarea
                rows={2}
                value={config.logistics?.accommodation ?? ""}
                onChange={(e) =>
                  patch({
                    logistics: {
                      ...config.logistics,
                      accommodation: e.target.value,
                    },
                  })
                }
                placeholder="Rooms are held at..."
              />
            </label>
            <label>
              {t("editor.goodToKnow")}
              <textarea
                rows={2}
                value={config.logistics?.note ?? ""}
                onChange={(e) =>
                  patch({
                    logistics: { ...config.logistics, note: e.target.value },
                  })
                }
                placeholder="Evenings are cool by the lake — a shawl is a good idea."
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>{t("editor.music")}</legend>
            <MusicPicker
              value={config.music?.url}
              onChange={(url) => {
                // Spreading an absent key would keep the previous track.
                const { music: _drop, ...rest } = config;
                onChange(url ? { ...rest, music: { url } } : rest);
              }}
              themeTrackName={themeDefaultLabel(
                theme.name,
                Boolean(theme.assets.defaultMusic),
              )}
              uploadScope={mediaScope}
            />
          </fieldset>

          <fieldset>
            <legend>{t("editor.photos")}</legend>
            <PhotoPicker
              gallery={config.gallery}
              onChange={(gallery) => patch({ gallery })}
              uploadScope={mediaScope}
              mediaUrlMap={mediaUrlMap}
            />
          </fieldset>

          <fieldset>
            <legend>{t("editor.yourStory")}</legend>
            <label>
              {t("editor.lineForGuests")}
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
              {t("editor.togetherSince")}
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
          {/* A real photographed device frame, not a CSS-drawn rail/island —
           * see .phone-real in site.css for how the screen is cut in. */}
          <div className="phone phone-real">
            <img
              className="phone-real-frame"
              src="/devices/iphone-promax-frame.png"
              alt=""
            />
            {/* Rendered at true handset width, then scaled — see site.css. */}
            <div className="phone-screen">
              <Invitation
                key={previewKey}
                theme={theme}
                invite={preview}
                mediaUrlMap={mediaUrlMap}
              />
            </div>
          </div>
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => setPreviewKey((k) => k + 1)}
          >
            {t("editor.replayOpening")}
          </button>
          <p className="editor-preview-note">{t("editor.previewNote")}</p>
        </div>
      </main>
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
