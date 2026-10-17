# Where things stand

## Four templates are built and waiting for you

All four finished in Lovable and look right. I could not download them:
clicking **Download codebase** opens a **macOS save dialog**, which is an
operating-system window the browser automation cannot reach. You clicking
**Save** is the only step needed.

| Template | Opens with | Flavour | Project |
|---|---|---|---|
| **Sarayu Ghat** | Folded card | Riverside temple ghat, Ramayana register | `cb528192-750a-4318-9449-669bba6b0fc8` |
| **Noor Haram** | Keepsake box | Mosque courtyard, crescent, minarets | `054990d9-0ddd-4433-bb10-7f64b74c6b43` |
| **Cathedral Light** | Carved oak doors | Gothic cathedral, rose window | `c69993c8-361f-4c88-bd92-537f1707c4f7` |
| **Mayura Mahal** | Velvet drapes | Peacock terrace by moonlight | `11774eca-e150-427b-ac93-d6a8804fc6b2` |

None is named for a religion, as you asked — the styling carries it.

### To collect them

For each id above:

1. `https://lovable.dev/projects/<id>`
2. Click the **`</>` Code** icon in the top bar
3. Click **Download codebase** at the bottom of the file tree
4. Click **Save** in the dialog that appears

Then tell me and I will integrate all four. Each takes a few minutes:
four images into `public/themes/<id>/`, one config file.

### Worth doing once

Connecting these projects to **GitHub** from Lovable removes the download
step permanently — builds land in a repo I can read directly.

---

## Already integrated

Three templates with real painted artwork: **Dubai Silk** (your own),
**Mughal Zamarrud**, **Kesari Mandap**, **Kanjeevaram**.

Nine more are drawn in CSS and still look weaker. They should be replaced
with generated artwork the same way.

## Still open

- **Music.** Every template except Dubai Silk is silent. Your track is a
  commercial recording and cannot ship inside a product. Send the 10
  English and 10 Hindi files and they go in `src/lib/music.ts`.
- **A brand name.** "Aarzoo" is a placeholder in
  `src/components/site/chrome.tsx`.
- **Payment.** Razorpay, once you have an Indian entity.
- **The database.** `supabase/migrations/0001_init.sql` still needs running
  in the Supabase SQL editor before accounts, saving or publishing work.
