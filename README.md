# Paint Masters Store Board

The customer-facing TV board for Paint Masters stores. Six slides rotate on a loop: Painting Today (live weather and activator picks), Bare Metal to Clear, On the Shelf, Product Spotlight, Ask Us Anything and the Panel Mix Deal. Everything on the screens comes from one Google Sheet.

Each TV opens its own link: `https://pm-store-board.pages.dev/?store=albany` (the Store ID from the Stores tab). The weather is pulled from the National Weather Service for that store's location.

## Setup

### 1. Put the Sheet in Google Drive
1. Go to drive.google.com, signed in as **robert1paintmasters@gmail.com**.
2. Click **New → File upload** and pick `sheet-template/Paint-Masters-Store-Board.xlsx`.
3. Right-click the uploaded file → **Open with → Google Sheets**. Work in that Google Sheets copy from now on.
4. Click **Share** (top right). Under **General access**, choose **Anyone with the link** and leave it as **Viewer**. Click **Done**.
5. Copy the Sheet ID from the address bar: the long code between `/d/` and `/edit`.
6. Paste it into `wrangler.toml` as `SHEET_ID` (or send it to Claude to do it). Until then the board runs on built-in sample data.

### 2. Product photos
1. In Drive, make a folder called **Store Board Photos**. Share it as **Anyone with the link → Viewer** (photos inside inherit it).
2. Upload a photo, right-click it → **Share → Copy link**.
3. Paste the link into the **Photo Link** column on the Products tab. The board picks it up within about 5 minutes.
   A product with no photo shows a simple drawing instead.

### 3. Publish on Cloudflare
The board is a Cloudflare **Pages** project connected to this repo: https://pm-store-board.pages.dev
Every push to `main` publishes automatically. `wrangler.toml` tells Pages to serve `public/`.

## Editing the Sheet
| Tab | What it controls |
|---|---|
| Stores | Store name, map coordinates (for weather), hours shown in the footer |
| Products | Every product the board can show: part number, brand, name, one line, price, photo, which slides it appears on |
| Slides | Order, on/off, seconds on screen, the light-blue tagline and the footer message |
| Slide Text | Headlines, facts and prices on each slide. Edit only the Value column |
| Repair Steps | The six Bare Metal to Clear steps and the product for each |
| Weather Picks | Activator picks and the temperature range that marks each one NOW. **Have a tech sign off before going live** |

Changes show on every TV within about 5 minutes. A blank price shows "Ask us".

If a part number goes missing on screen, select that column in Google Sheets and choose **Format → Number → Plain text**.

## Testing
- `/?store=albany&slide=3` holds slide 3 on screen.
- `/?sample=1` ignores the Sheet and shows the built-in sample data.

## How it works
- `public/` is the board page (`board.js` builds the slides).
- `functions/api/[[route]].js` and `src/api.js` are the Cloudflare Pages Functions: `/api/data` reads the Sheet, `/api/weather` reads weather.gov, `/api/img` serves Drive photos. Each is cached so the TVs never hammer Google or the weather service.
- If the Sheet or weather can't be reached, the board keeps showing the last good copy it saved.
- `tools/` rebuilds the sample data and the Sheet template.

Fonts: Archivo Black and Figtree, SIL Open Font License, bundled in `public/fonts` so the TVs don't depend on Google Fonts.
