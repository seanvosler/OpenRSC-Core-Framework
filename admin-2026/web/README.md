# Admin 2026 Web

Modern browser control plane for OpenRSC.

The frontend is intentionally a SPA. OpenRSC remains the authoritative backend for authentication, authorization, server data, live events, and administrative actions.

## Current status

The application shell and overview are implemented, and the server-health portion is connected to the live Java Admin 2026 status API.

Live today:

- server/world name and connection state
- player and NPC counts
- tick duration and tick overrun
- configured tick rate and current tick
- uptime
- rolling tick-duration chart

Still mock/planned:

- player table rows/details
- plugin cards
- activity feed
- administrative actions

Current frontend capabilities include:

- React + TypeScript + Vite
- Tailwind CSS 4 + shadcn/ui
- TanStack Router + TanStack Query
- Recharts metrics visualization
- React Flow plugin-flow visualization
- RSC Classic design tokens
- routed Overview / Players / World / Plugins / Utilities / Logs / Developer / Settings areas
- Vitest + React Testing Library smoke-test baseline

## Local development

```bash
npm install
npm run dev
```

Vite defaults to:

```text
http://127.0.0.1:5173/
```

when explicitly started with `--host 127.0.0.1`.

## Verification

```bash
npm run test
npm run build
```

At the current scaffold checkpoint both commands pass.

The production bundle currently includes Recharts and React Flow on the overview route, so Vite reports a large-chunk warning. Route/component-level code splitting is tracked as follow-up work rather than being treated as a build failure.

## API boundary

The Java Admin API is the source of truth for live server data. The first endpoint is `GET /admin/api/status`; additional endpoints should follow the same boundary.

Frontend API access should flow through:

```text
Java Admin DTOs/routes
        ↓
OpenAPI schema
        ↓
generated TypeScript client/types
        ↓
TanStack Query wrappers
        ↓
feature UI
```

Generated API code belongs in:

```text
src/api/generated/
```

Do not edit generated files manually.

Until OpenAPI generation exists, handwritten transport types should remain narrow and isolated under `src/api/`. Mock data must remain visibly distinct from live API-backed state.

## Project structure

```text
src/
├── api/
├── app/
│   └── shell/
├── components/
│   └── ui/
├── features/
│   ├── overview/
│   └── shared/
├── lib/
└── test/
```

As real features are added, prefer domain folders such as `features/players/`, `features/plugins/`, `features/world/`, and `features/utilities/`.

## Design direction

Primary rule:

> **2003 visual language, 2026 interaction design.**

Retro styling must never replace accessible controls, semantic markup, keyboard navigation, responsive layout, or clear operational states.

See `../docs/gui-stack.md` for the full frontend architecture and `../docs/tasklist.md` for current work status.
