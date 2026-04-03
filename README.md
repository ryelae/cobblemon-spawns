# Cobblemon Spawn Browser

A fast, client-side web app for filtering and exploring Pokémon spawn data from Cobblemon. Upload your own TSV/CSV spreadsheet export or use the included sample data instantly.

Note: This project built as a quick solution for me and my friends, and also a Claude experiment.

---

## Features

- Upload TSV, CSV, or paste directly from Google Sheets / Excel
- Filter by **biome** with multi-select ("match any" or "match all")
- Global text **search** across all fields
- **Sort** by any column
- Active filter tags with one-click removal
- **Export** filtered results to CSV
- Column visibility toggle
- Biome tags highlighted when active in filters
- 100+ sample Pokémon included — works out of the box
- Responsive — works on desktop and mobile

---

## Tech Stack

| Layer       | Tech                         |
|-------------|------------------------------|
| Framework   | React 18 + TypeScript        |
| Build tool  | Vite 5                       |
| Styling     | Tailwind CSS 3               |
| Hosting     | Vercel (zero-config)         |
| Data        | 100% client-side, no backend |

---

## Quick Start (local)

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
# → http://localhost:5173
```

---

## Deploy to Vercel (hosted, public URL)

### Option A — Vercel CLI (fastest)

```bash
# Install Vercel CLI once
npm i -g vercel

# From the project directory:
vercel
```

Follow the prompts. Vercel auto-detects Vite. Your app gets a public URL like `https://cobblemon-spawn-browser.vercel.app`.

To deploy updates:
```bash
vercel --prod
```

### Option B — GitHub + Vercel dashboard (recommended for teams)

1. Push this project to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/cobblemon-spawn-browser.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repo.

3. Vercel auto-detects the build settings:
   - **Framework:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`

4. Click **Deploy**. Done — you get a shareable URL.

Every future `git push` auto-deploys.

### Option C — Netlify

```bash
npm run build
# Then drag the `dist/` folder to https://app.netlify.com/drop
```

Or connect your GitHub repo via the Netlify dashboard for auto-deployments.

---

## Build for production

```bash
npm run build
# Output in dist/
```

---

## How to use your own spawn data

### Method 1: Upload a file
1. Export your spreadsheet as **TSV** (File → Download → Tab Separated Values) or **CSV**.
2. Click **Upload file** in the top-right corner.
3. The data loads instantly in the browser — nothing is sent to a server.

### Method 2: Paste from a spreadsheet
1. Select all cells in your Google Sheets / Excel (including the header row).
2. Copy (Ctrl+C / Cmd+C).
3. Click **Paste** in the top-right corner and paste into the text area.
4. Click **Load data**.

### Expected columns (header row required)

The parser is flexible — column names are case-insensitive and it handles common variations.

| Column              | Notes                                      |
|---------------------|--------------------------------------------|
| `No.`               | Pokédex number                             |
| `Pokémon`           | Name                                       |
| `Entry`             | Spawn entry index                          |
| `Bucket`            | `common`, `uncommon`, `rare`, `ultra-rare` |
| `Weight`            | Spawn weight                               |
| `Lv. Min`           | Minimum spawn level                        |
| `Lv. Max`           | Maximum spawn level                        |
| `Biomes`            | Comma-separated list of biomes             |
| `Excluded Biomes`   | Comma-separated list                       |
| `Time`              | `any`, `day`, `night`                      |
| `Weather`           | `any`, `clear`, `thunderstorm`, etc.       |
| `Context`           | `grounded`, `surface`, etc.               |
| *(other columns)*   | Shown in table, searchable                 |

Biomes like `"Jungle, Tropical Island"` are automatically split into individual filterable tags.

### Filtering by biome

1. Click **Filter by Biome** next to the search bar.
2. Search or scroll to find biomes.
3. Check one or more biomes.
4. Toggle **Any** (show Pokémon that spawn in at least one selected biome) or **All** (must spawn in every selected biome).
5. Active biome filters show as removable tags below the search bar.
6. Click × on any tag or **Clear all** to remove filters.

---

## File structure

```
cobblemon-spawn-browser/
├── src/
│   ├── App.tsx                   # Root component, filter state
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Tailwind + scrollbar styles
│   ├── types/
│   │   └── spawn.ts              # TypeScript interfaces
│   ├── lib/
│   │   ├── parser.ts             # TSV/CSV parser
│   │   └── sampleData.ts        # Built-in sample Pokémon data
│   └── components/
│       ├── FileUpload.tsx        # Upload / paste UI
│       ├── SearchBar.tsx         # Global search input
│       ├── BiomeFilter.tsx       # Biome multi-select dropdown
│       ├── FilterBar.tsx         # Active filter tags + export
│       └── DataTable.tsx         # Sortable table + column picker
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json                   # SPA rewrite rule for Vercel
├── .gitignore
└── README.md
```

---

## Assumptions

- All data processing is client-side. No data ever leaves your browser.
- The sample data uses Gen 1–3 Pokémon with plausible (not necessarily exact) Cobblemon biome assignments — replace with your real export. Official sheets can be found at the [cobblemon wiki](https://wiki.cobblemon.com/index.php/Pok%C3%A9mon/Spawning).
- Biome values in your spreadsheet should be comma-separated within a single cell.
- The parser handles both TSV (tab-separated) and CSV (comma-separated with quote handling).
