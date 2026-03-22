[//]: # (Path: ranch-tracker/README.md)

# 🐄 Ranch Tracker — Frontend

A production-grade farm management system built with React 18, TypeScript, Vite, TailwindCSS v4, and Zustand.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 6 |
| Styling | TailwindCSS v4 (`@tailwindcss/vite`) |
| Routing | React Router v6 |
| State | Zustand v5 |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP | Axios |
| Dates | date-fns |

## Project Structure

```
client/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Router
│   ├── styles/globals.css    # TailwindCSS v4 + design tokens
│   ├── types/index.ts        # TypeScript types
│   ├── lib/
│   │   ├── api.ts            # Axios instance + all API calls
│   │   ├── utils.ts          # Formatters, helpers
│   │   └── constants.ts      # App-wide constants
│   ├── store/index.ts        # Zustand stores
│   ├── hooks/useDashboard.ts # Dashboard data hook
│   ├── components/
│   │   ├── layout/           # Layout, Sidebar, Topbar
│   │   ├── ui/               # Button, Badge, StatCard
│   │   └── shared/           # AlertPanel
│   └── pages/
│       ├── dashboard/        # ✅ Stage 1 — Complete
│       ├── agriculture/      # 🔜 Stage 2
│       ├── dairy/            # 🔜 Stage 3
│       ├── shop/             # 🔜 Stage 4
│       ├── labour/           # 🔜 Stage 5
│       ├── inventory/        # 🔜 Stage 6
│       └── machinery/        # 🔜 Stage 7
```

## Getting Started

```bash
cd client
npm install
npm run dev
```

The dev server proxies `/api/*` to `http://localhost:3000`.

## Deployment (Vercel)

1. Push this repo to GitHub
2. Import into Vercel
3. Set Build Command: `cd client && npm install && npm run build`
4. Set Output Directory: `client/dist`
5. Add environment variables if needed:
   - `VITE_API_BASE_URL` (optional, defaults to `/api`)

The `vercel.json` at root handles SPA rewrites and API proxying automatically.

## API Integration

All API calls go through `src/lib/api.ts`. The dashboard connects to:

```
GET /api/dashboard/stats
GET /api/dashboard/kpis
GET /api/dashboard/alerts
GET /api/dashboard/profit-chart?period=month
GET /api/dashboard/recent-activity
```

**No mock or dummy data is used anywhere. All data comes from the backend API.**

## Design System

- **Font Display**: Syne (headings, labels, numbers)
- **Font Body**: DM Sans (paragraphs, descriptions)
- **Theme**: Dark industrial with module-specific accent colors
- **Modules**:
  - Agriculture → Emerald green
  - Dairy → Sky blue
  - Poultry → Orange
  - Shop → Amber
  - Machinery → Slate
  - Labour → Violet
  - Reports → Slate gray

## Development Stages

| Stage | Module | Status |
|-------|--------|--------|
| 1 | Dashboard | ✅ Complete |
| 2 | Agriculture | 🔜 Next |
| 3 | Dairy | 🔜 Planned |
| 4 | Shop & POS | 🔜 Planned |
| 5 | Labour | 🔜 Planned |
| 6 | Inventory | 🔜 Planned |
| 7 | Machinery | 🔜 Planned |