# Limi AI — Dynamic Layout Engine

> Prompt-to-Space: render and manage interactive 2D spatial scenes from AI-generated JSON schemas.

A full-stack Next.js 15 admin dashboard for managing smart-room modules (lights, sensors, furniture) on an interactive floor plan. Built for real-time responsiveness, keyboard accessibility, and bundle efficiency.

---

## Tech Stack

| Layer     | Technology                                  |
| --------- | ------------------------------------------- |
| Framework | Next.js 15 (App Router, RSC)                |
| UI        | React 19, Tailwind v4, shadcn/ui            |
| Animation | Framer Motion via `motion/react`            |
| State     | Zustand v5 + Immer (fine-grained selectors) |
| Real-time | Supabase Realtime (`postgres_changes`)      |
| Database  | Supabase PostgreSQL + Prisma v7 ORM         |
| Forms     | React Hook Form + Zod v4                    |
| Tests     | Playwright                                  |
| Runtime   | Bun                                         |

---

## Getting Started

### 1. Prerequisites

- [Bun](https://bun.sh/) ≥ 1.1
- A [Supabase](https://supabase.com/) project (free tier works)
- Node ≥ 20 (Bun handles this automatically)

### 2. Install dependencies

```bash
bun install
```

### 3. Environment variables

Create a `.env` file at the project root:

```env
# Prisma — Supabase connection pooler (port 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Prisma — direct connection for migrations (port 5432)
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Supabase browser client (Realtime)
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon key]"
```

### 4. Run database migrations

```bash
bunx prisma migrate dev
```

### 5. Seed sample data

```bash
bunx prisma db seed
```

This populates the database with a `Main Suite` room containing 5 lights, 5 sensors, and 5 furniture modules.

> **No database?** The app automatically falls back to the built-in seed data at runtime — no connection required for basic exploration.

### 6. Start the development server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Running Tests

Playwright E2E tests cover the Toggle All master switch and the configurator panel.

```bash
# Run all tests (starts the dev server automatically)
bunx playwright test

# Interactive UI mode
bunx playwright test --ui

# Single test file
bunx playwright test tests/toggle-all.spec.ts
```

### Test coverage

| File                         | What is tested                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `tests/toggle-all.spec.ts`   | Master switch turns all lights OFF; turns all lights back ON; individual toggle is isolated                 |
| `tests/configurator.spec.ts` | Panel opens on module click; name edit persists; invalid UUID shows error; negative power limit shows error |

---

## Architecture

### Server / Client boundary

```
layout.tsx  (RSC — fonts, metadata, TooltipProvider)
└── loading.tsx         (RSC skeleton — prevents CLS during streaming)
└── page.tsx            (RSC — fetches SpatialScene via Prisma, passes to client)
    ├── StoreInitializer (client — hydrates Zustand once, renders no DOM)
    └── RealtimeProvider (client — boots Supabase channel, passes children through)
        ├── MasterControls   (client — room name, count badges, Toggle All)
        ├── FloorPlanCanvas  (client — absolutely-positioned module grid)
        │   └── ModuleNode × N  (client — memo'd, dispatches to type-specific node)
        └── ConfiguratorSheet (client — lazy-loaded via next/dynamic, ssr:false)
```

### State management — why Zustand over Context

React Context re-renders every subscriber on any state change. With 500+ module nodes, one sensor update would repaint the entire canvas.

Zustand's per-selector subscription model means `ModuleNode` for light A only re-renders when **light A's** slice changes. `React.memo` + `useShallow` prevents cascading re-renders from object identity changes.

```ts
// Only re-renders when *this* module changes — not when any other module does
const module = useFloorPlanStore(selectModuleById(id));
```

### Optimistic UI

```
User clicks toggle
  → Zustand patch (immediate, synchronous)
  → UI updates < 16ms
  → Server Action fires in background
  → On failure: Zustand rolls back to snapshot
  → On success: Supabase Realtime confirms the change
```

### Real-time data flow

```
Supabase Realtime (postgres_changes)
  → RealtimeProvider
  → useRealtimeModules hook
  → updateSensorValue(id, value) [SENSOR]
  → patchModule(id, patch)       [LIGHT / FURNITURE]
  → SensorModuleNode pulse animation (Framer Motion)
```

### Code splitting

`ConfiguratorSheet` is loaded via `next/dynamic({ ssr: false })`. It only downloads when the bundle is first requested — **not** on the initial page load. Users who never open the configurator pay zero cost.

---

## Performance Optimisations

| Technique                  | Where                               | Impact                                  |
| -------------------------- | ----------------------------------- | --------------------------------------- |
| `React.memo`               | Every `ModuleNode`                  | Isolates re-renders by module ID        |
| `useShallow`               | Object/array Zustand selectors      | Prevents identity-change re-renders     |
| `useMemo`                  | Module ID list in `FloorPlanCanvas` | Re-derives only when module set changes |
| `next/dynamic + ssr:false` | `ConfiguratorSheet`                 | Code-splits the heavy Sheet panel       |
| RSC data fetching          | `page.tsx`                          | Zero client JS for initial data load    |
| CSS `aspect-ratio`         | Floor plan canvas                   | Reserves space, eliminating CLS         |

---

## Accessibility

- `role="application"` on the floor plan canvas with an `aria-label`
- Every interactive element (`Switch`, `ModuleNode`, `Slider`) has an `aria-label`
- `aria-live="polite"` on sensor value badges (announces live changes to screen readers)
- `aria-pressed` on module nodes to communicate selected state
- `aria-invalid` + `aria-describedby` on form fields with validation errors
- Skip navigation link (`Skip to floor plan`) for keyboard users
- All interactive elements accept `Enter` / `Space` keyboard events
- Focus indicators use the gold primary ring (`--ring`) — visible on all dark surfaces

---

## Project Structure

```
src/
  app/
    globals.css           # Dark luxury theme (oklch colours, CSS custom properties)
    layout.tsx            # RSC — shell, fonts, metadata, TooltipProvider
    loading.tsx           # RSC — skeleton matching real page layout
    page.tsx              # RSC — data fetch → StoreInitializer → UI tree
  components/
    floor-plan/           # FloorPlanCanvas, ModuleNode variants, MasterControls, skeletons
    configurator/         # ConfiguratorSheet, ConfiguratorForm, field components
    providers/            # RealtimeProvider, StoreInitializer
    ui/                   # shadcn/ui primitives
  hooks/
    useFloorPlanStore.ts  # Zustand store (Immer)
    useFloorPlanSelectors.ts # Stable selector functions
    useModuleActions.ts   # Async actions with optimistic UI
    useConfiguratorForm.ts # RHF + Zod integration
    useRealtimeModules.ts # Supabase channel lifecycle
  lib/
    types.ts              # TypeScript types / enums
    schemas/              # Zod schemas (spatial scene + form)
    actions/modules.ts    # Server Actions (Prisma CRUD)
    floor-plan-utils.ts   # Coordinate → CSS conversion utilities
    module-type-guards.ts # Type guards and visual property helpers
    scene-fetcher.ts      # RSC data fetching with seed fallback
    seed-data.ts          # Sample SpatialScene (15 modules)
prisma/
  schema.prisma           # Room + Module models
  seed.ts                 # DB seed script
tests/
  toggle-all.spec.ts      # Playwright — Toggle All master switch
  configurator.spec.ts    # Playwright — configurator panel flows
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
