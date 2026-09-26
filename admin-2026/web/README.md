# Admin 2026 Web

Modern OpenRSC control-plane SPA.

## Local development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run test
npm run build
```

## Current status

The overview is intentionally mock-backed while the Java Admin API is designed. The UI already exercises the planned stack: TanStack Router/Query/Table, shadcn + Tailwind, Recharts, React Flow, and the RSC Classic theme.

Generated API code will live in `src/api/generated/` and must not be edited manually.
