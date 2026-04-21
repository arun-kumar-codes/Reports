# Reports Dashboard

A small reports dashboard built with **Next.js 14 (App Router) + TypeScript**. It covers the full assignment brief: a listing page, a detail page, REST API routes, role-gated middleware, API-driven search and sort, a reusable card component, `.module.scss` styling, and an AI summary endpoint with proper loading/error states.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — only needed if you want real OpenAI summaries
npm run dev
```

Then open http://localhost:3000.

### Scripts

| Script              | What it does                             |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the dev server.                    |
| `npm run build`     | Production build.                        |
| `npm run start`     | Start the production server.             |
| `npm run lint`      | ESLint with the `next/core-web-vitals` preset. |
| `npm run type-check`| Strict TypeScript type check (no emit).  |

### Environment variables

See `.env.example`.

| Name             | Purpose                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `OPENAI_API_KEY` | Optional. If set, `/api/reports/[id]/summary` calls the OpenAI Chat Completions API. If not set, the endpoint returns a deterministic mock summary. |
| `OPENAI_MODEL`   | Optional. Defaults to `gpt-4o-mini`.                                 |
| `NEXT_PUBLIC_SITE_URL` | Optional. Absolute site URL — useful on Vercel/previews where the host header may be unexpected. |

## What's in it

### Pages

| Route                  | Description |
| ---------------------- | ----------- |
| `/`                    | Marketing-style landing page with a link into the dashboard. |
| `/reports`             | Server-rendered list of reports. Server-side search, sort, category, and status filters. |
| `/reports/[id]`        | Server-rendered detail view. Includes an AI summary panel that fetches a generated summary on the client. |
| `/forbidden`           | Landing page shown when the middleware blocks a user for insufficient role. |

### API routes

| Route                              | Method | Description |
| ---------------------------------- | ------ | ----------- |
| `/api/reports`                     | `GET`  | List reports. Query params: `q`, `sort` (`title`, `author`, `views`, `createdAt`, `updatedAt`), `order` (`asc`, `desc`), `category`, `status`. |
| `/api/reports/[id]`                | `GET`  | Single report. Returns 404 if not found. |
| `/api/reports/[id]/summary`        | `GET`  | AI-generated summary. Calls OpenAI when `OPENAI_API_KEY` is set; falls back to a deterministic mock. |
| `/api/auth/role`                   | `POST` / `DELETE` | Demo endpoint used by the role switcher in the header to set/clear the `role` cookie. |

#### Example requests

```bash
curl "http://localhost:3000/api/reports?q=retention&sort=views&order=desc"
curl http://localhost:3000/api/reports/rpt_003
curl http://localhost:3000/api/reports/rpt_001/summary
```

### Role-gated middleware (`src/middleware.ts`)

The middleware enforces a minimum role for protected paths using the `role` cookie:

| Path prefix  | Minimum role | On denial                              |
| ------------ | ------------ | -------------------------------------- |
| `/reports`   | `viewer`     | Redirect to `/forbidden`               |

Roles are `guest` (default) → `viewer`. Use the **Role** switcher in the top-right of the header to change your role during development. This calls the `/api/auth/role` endpoint, which sets a cookie that the middleware reads on subsequent requests. The gating helper (`hasAtLeast`) is written for tiered roles so adding more tiers later is a one-line change.

The public API under `/api/reports` is intentionally ungated so the `/reports` page can call it from the browser; all UI surfaces are gated at the page level.

### Reusable components

- `ReportCard` (`src/components/ReportCard`) — the card used on the reports list. Shows category, status badge, summary, tags, author, and key metrics.
- `StatusBadge` (`src/components/StatusBadge`) — reusable colored status pill used both on the card and on the detail page.
- `SiteHeader` + `RoleSwitcher` — sticky header with demo role switching.

### AI summary generation

The summary endpoint is implemented once (`src/lib/ai-summary.ts`) with two operating modes:

1. **Real OpenAI** — when `OPENAI_API_KEY` is present, it calls `POST https://api.openai.com/v1/chat/completions` with a low-temperature prompt that summarizes the report in 2–3 sentences. The request is timed out via `AbortController` (default 15s).
2. **Deterministic mock** — when no key is set, it returns a summary synthesized from the report's first sentence, top tags, and engagement metrics. This keeps the UI demo-able without any external calls.

Both paths return the same `AiSummaryResponse` shape (including a `source` field of `"openai" | "mock"`), so the UI can display a badge identifying which path was used.

On the client (`AiSummary.tsx`):

- Loading state: a shimmering skeleton and `aria-busy`.
- Error state: inline error box with the provider message and a **Try again** button.
- Success state: the summary text plus source/model/timestamp metadata.
- Supports regeneration via a **Regenerate** button.
- Guards against state updates after the component unmounts (slow-request race).

## Project structure

```
src/
  app/
    api/
      auth/role/route.ts              # demo role cookie setter
      reports/route.ts                # GET /api/reports
      reports/[id]/route.ts           # GET /api/reports/[id]
      reports/[id]/summary/route.ts   # GET /api/reports/[id]/summary
    forbidden/                        # 403 landing page
    reports/
      page.tsx                        # /reports (server component)
      loading.tsx                     # skeleton for /reports
      error.tsx                       # error boundary for /reports
      _components/ReportFilters.*     # client search/sort controls
      [id]/
        page.tsx                      # /reports/[id] (server component)
        not-found.tsx                 # 404 for unknown ids
        _components/AiSummary.*       # client AI summary panel
    page.tsx                          # home
    layout.tsx                        # root layout + <SiteHeader />
  components/
    ReportCard/                       # reusable card (required)
    StatusBadge/                      # shared status pill
    SiteHeader/                       # header + role switcher (client child)
  data/reports.json                   # mock reports
  lib/
    ai-summary.ts                     # OpenAI + mock summarizer
    api-browser.ts                    # fetch helpers used from client code
    api-client.ts                     # fetch helpers used from server components (uses next/headers)
    auth.ts                           # role types/helpers
    format.ts                         # date/number formatters
    http.ts                           # JSON error helper for route handlers
    reports-repository.ts             # search/sort/find over mock data
  styles/
    globals.scss                      # reset + base styles
    tokens.scss                       # design tokens (colors, spacing, breakpoints)
  middleware.ts                       # role-gating middleware
  types/report.ts                     # Report, query, response types
```

## Notable design choices

- **Server-driven search/sort.** The list page is a server component. The client filters bar pushes URL search params via `router.replace`, and the server component re-runs — which calls `/api/reports` on every change. Filtering is therefore done by the API, not by the client re-sorting an in-memory array.
- **Strict TypeScript.** `strict`, `noUncheckedIndexedAccess`, and `noFallthroughCasesInSwitch` are on. Route handlers, components, and data helpers are fully typed end-to-end via shared types in `src/types/report.ts`.
- **Separation of server/client API clients.** `src/lib/api-client.ts` is marked `import "server-only"` because it uses `next/headers` to resolve an absolute base URL. Client components use `src/lib/api-browser.ts`, which uses relative URLs. This keeps `next/headers` out of the client bundle.
- **Accessible UI.** Status badges expose `aria-label`s, the search input has an `sr-only` label, AI summary region uses `aria-live` and `aria-busy`, and focus rings are styled globally.
- **No unused abstractions.** The repository, formatters, and HTTP helpers are small and purpose-built for what the UI actually needs.

## AI tools used while building this

- **Claude (Anthropic)** — used as a pair programmer to scaffold the App Router structure, draft the middleware and API routes, design the SCSS token system, and write the README. Code was written and integrated directly rather than pasted verbatim; every change was type-checked and smoke-tested against a local build.
- **OpenAI (optional, runtime only)** — the AI summary endpoint can call OpenAI's Chat Completions API (default model `gpt-4o-mini`) when `OPENAI_API_KEY` is set. With no key set, it returns a deterministic mock summary so the UI works offline.

## Manual test checklist

Against a running dev server:

- [ ] Visit `/reports` as a **guest** → redirected to `/forbidden` with `from` and `required` params.
- [ ] Flip the **Role** switcher in the header to `viewer` → `/reports` loads with all 10 cards.
- [ ] Type `retention` in the search box → URL updates (`?q=retention`) and the server re-renders with 1 matching card.
- [ ] Change **Sort by** to `Views` and toggle order → list re-orders via a fresh `GET /api/reports?...` call.
- [ ] Open a card → `/reports/[id]` renders; the AI summary panel shows a skeleton, then a summary tagged **Mock generator** (or **OpenAI** if a key is set).
- [ ] Click **Regenerate** → new timestamp on the summary.
- [ ] Visit `/reports/nope` → not-found page renders.
- [ ] `curl http://localhost:3000/api/reports?q=retention&sort=views&order=desc` returns JSON with `total: 1`.
