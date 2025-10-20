# 🏈 FantasyEdge – DFS Toolkit for NFL & CFB

A modern web app for building better DFS lineups. Designed for speed, clarity, and iteration—pull in slates, study matchups, grade players, build lineups, and track your bankroll. Built with Next.js (App Router), Supabase, and a polished shadcn/ui interface—plus optional optimizer and data-sync services.

[product-screenshot-1]: public/screenshots/fantasy-edge_dashboard.png

---

## ✨ Features

### 📋 Slate Manager

One place to go from slate → research → builds → exports.

**Sub-features**

1. **Contest Selection**

   - Recommends the best contests for your slate and bankroll.
   - Compares rake, field size, payout curve (top % paid, % to first), min/avg cash, and entry caps.
   - Surfaces +EV formats based on your risk profile (SE/3-Max/20-Max/MME).

2. **Matchups (with Vegas)**

   - All games on the slate with spread, total, and implied team totals.
   - Highlights best game environments (pace, total, delta from league avg).
   - Quick sort toggles for shootouts, consolidation, and value signals.

3. **Scouting**

   - Click any matchup for team pages: efficiency + usage metrics, rates, and matchup grades.
   - Full rosters for both teams with sortable stats and role/context notes.
   - **Target players** directly from here to build your personal player pool.

4. **Player Pool**

   - Centralized list of all **targeted** players across the slate.
   - Fast filters (team, position, salary tiers, projection/value bands).
   - Tagging (lock, like, fade) and notes for later roster construction.

5. **Roster Construction**

   - Build and save lineups using your player pool.
   - **Quick Add** menu to grab late adds without leaving the builder.
   - Validates slot/position rules and salary; supports lineup templates.

6. **Roster View**

   - See every saved lineup; filter by lineup type.
   - Sort by salary used, projection.
   - **Export to CSV** for rapid DraftKings upload.

7. **Optimizer (inline)**
   - Multi-lineup generation inside Slate Manager.
   - Highly configurable rules (stacks, exposures, salary bands, groups).
   - **CSV export** formatted for easy DK upload.

---

### 📊 Scouting & Player Hub

- **Advanced Metrics**: sortable player tables with usage, rates, and context (e.g., team tendencies, pressure/coverage notes).
- **Matchup Grades**: passing/rushing offense vs defense with **current vs prior-year** regression awareness.
- **Actionable Color Bands**: configurable thresholds for value/ROI cells so top plays and traps pop instantly.
- **Targeting Workflow**: toggle players into your pool from any table; tags (lock/like/fade) carry into lineup tools.

---

### 🧮 Optimizer

- **Rule Builder**: team/player stacks (QB+WR, bring-backs), max same-team, salary min/max, uniques, positional constraints.
- **Exposure Controls**: global caps, group rules, lock/ban lists, and preset rule packs (SE / 3-Max / 20-Max / MME).
- **Multi-Lineup Export**: generate at scale and export CSVs compatible with DK.
- **Formats**: works for **NFL + CFB** slates, honoring site/slot rules.

### 📚 Contest Study Hub

- Import past entries & results for post-mortems
- Ownership vs leverage views; compare to top-1% builds

### 💰 Bankroll Tracker

- Track entries, ROI by slate/contest type
- Challenge modes (e.g., $400 → x) with time-scoped dashboards

### 🧰 Built for Devs

- Next.js 15 App Router + TypeScript
- RTK Query + TanStack Table for fast data grids
- Supabase (Postgres + Auth) with row-level security
- shadcn/ui + Tailwind; Lucide icons
- Zod + React Hook Form for robust forms
- Clean module aliases (`@/features/*`, `@/libs/*`, etc.)

---

## 🧱 Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Data**: Supabase (Postgres, RLS)
- **State / Data**: RTK Query, TanStack Table
- **Styling**: Tailwind CSS, shadcn/ui, Radix primitives
- **Auth**: Supabase Auth
- **Charts**: Recharts
- **Job/Sync**: Node/TypeScript data-sync worker (Separate python app)
- **Optimizer**: Python (FastAPI) + `pydfs-lineup-optimizer` (Separate python app)

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/ReggieEvans/fantasy-edge.git
cd fantasy-edge

# 2. Install dependencies
npm install

# 3. Add your environment variables
cp .env.local

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000 in your browser.

---

## 🛡️ Environment Variables

# --- Supabase ---

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# --- Odds / External Data (optional) ---

ODDS_API_KEY=your_the_odds_api_key (https://the-odds-api.com/)

# --- Optimizer and DataSync (optional) ---

The optimizer and data sync are seperate python apps that I will link to in the future.

---

## 🛠 Folder Structure

```bash
/
├── app/                            # Next.js routes (App Router)
│   ├── (auth)/                     # Authentication routes
│   ├── (protected)/                # Protected Views
│   ├── api/                        # Route handlers (server)
│   ├── fonts/                      # Custom Fonts
│   ├── layout.tsx                  # Base Layout
│   ├── global.css                  # Global Styles and theme
│   └── provider.tsx                # Redux Provider
├── features/                       # Features
│   ├── study-hub/
│   ├── dashboard/
│   ├── pickem/
│   ├── bankroll-tracker/
│   └── slate-manager/
│       ├── contest-selection/
│       ├── matchups/
│       ├── optimizer/
│       ├── player-pool/
│       ├── roster-construction/
│       ├── roster-view/
│       └── scouting/
├── components/                   # Shared UI components
├── libs/                         # utils, supabase config, etc
├── store/                        # Redux store, RTK Query api slices
├── utils/                        # Utility functions
├── hooks/                        # Shared Hooks
├── shared/                       # Shared Files
├── public/                       # Images and screenshots
└── types/                        # TypeScript types
```

---

## 📄 License

MIT — free for personal use.

---

## 👋 Author

Built with ❤️ by Reggie Evans

[product-screenshot-2]: public/screenshots/fantasy-edge_matchups.png
[product-screenshot-3]: public/screenshots/fantasy-edge_study-hub.png
[product-screenshot-4]: public/screenshots/fantasy-edge_bankroll-tracker.png
