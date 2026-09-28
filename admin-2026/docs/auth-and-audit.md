# Admin 2026 — Authentication, Capabilities, and Audit

_Last updated: 2026-09-26_

This document defines the first security boundary for Admin 2026.

The current implementation is deliberately a **local-development foundation**, not a final production authentication system.

## Goals

Before Admin 2026 exposes a mutation endpoint, the server requires:

1. an authenticated operator identity
2. stable capability identifiers
3. authorization checks at the server boundary
4. a mutation audit contract
5. a safe upgrade path to a production session model

The browser must never become the source of truth for permissions.

## Current local-development authentication

Admin 2026 now supports an optional JVM-configured bearer token for the operator/session introspection path.

Properties:

```text
openrsc.admin.authToken
openrsc.admin.operator
openrsc.admin.group
```

Example property names are documented here, but secrets must not be committed to the repository, logged, returned by APIs, or embedded in the frontend build.

If `openrsc.admin.authToken` is not configured:

```http
GET /admin/api/session
→ 503 auth_not_configured
```

If authentication is configured but the request does not authenticate:

```http
GET /admin/api/session
→ 401 unauthorized
WWW-Authenticate: Bearer
```

A successful session response returns only operator metadata and capabilities. The configured token is never returned.

## Session response

Conceptually:

```json
{
  "authMode": "local-bearer",
  "mutationsEnabled": true,
  "operator": {
    "name": "Local Operator",
    "groupId": 1,
    "groupName": "Admin",
    "capabilities": [
      "events.read",
      "logs.read",
      "logs.staff",
      "players.read",
      "plugins.read",
      "server.read",
      "world.read"
    ]
  }
}
```

The exact capabilities depend on the configured OpenRSC group.

## Capability vocabulary

Read capabilities currently defined:

```text
server.read
world.read
players.read
plugins.read
events.read
logs.read
logs.staff
```

Mutation capability identifiers are defined now so contracts can stabilize before writes exist:

```text
players.message
players.teleport
players.kick
players.mute
players.ban
world.broadcast
world.saveAll
server.restart
plugins.reload
```

Defining a capability does **not** mean it is granted or implemented.

## Current group mapping

OpenRSC's existing groups are used only as inputs to a dashboard capability policy.

Existing groups include:

- Owner
- Admin
- Super Moderator
- Moderator
- Developer
- Event
- Player Moderator
- Tester
- User

The current Admin 2026 policy is intentionally conservative:

- all configured operators receive the basic read capabilities
- Owner/Admin/Super Moderator/Moderator/Developer/Player Moderator also receive `logs.read` and `logs.staff`
- Event receives `logs.read`
- Owner, Admin, Super Moderator, Moderator, and Player Moderator receive `players.message`
- Developer, Event, Tester, and User do not receive `players.message`
- no other mutation capability is granted yet

The first mutation mapping intentionally mirrors the existing `::alert` command boundary rather than assuming a numeric rank hierarchy.

OpenRSC command permissions are more nuanced than a single numeric hierarchy. Command classes and individual operations contain target/rank checks, time limits, and role-specific rules.

Mutation grants should therefore be added **operation by operation** after reviewing the corresponding OpenRSC domain/command behavior.

## Audit record contract

`AdminAuditRecord` defines the minimum information every future mutation should capture:

```text
timestampEpochMillis
requestId
operatorName
operatorGroupId
capability
action
serverName
target
success
errorCode
```

This is currently a contract only.

The first mutation persists `AdminAuditRecord` as an `Admin2026Audit` JSON entry through OpenRSC's existing `GameLogger` / `generic_logs` infrastructure.

This keeps the first mutation durable without adding a new schema migration. A dedicated admin-audit table can be introduced later if querying/reporting needs justify it.

## Current security boundary

Today:

- the Admin HTTP listener remains disabled by default
- it remains loopback-bound by default
- status/plugins/players/events are read-only
- existing read endpoints are not yet gated by operator auth
- `/admin/api/session` exercises the first authenticated operator boundary
- `mutationsEnabled` reflects whether the authenticated operator has the first granted mutation capability
- `POST /admin/api/players/message` is the first mutation endpoint
- all other mutation capabilities remain ungranted/unimplemented

Do not interpret the local bearer mechanism as permission to expose the listener publicly.

## Production-session direction

The local bearer mode is useful for backend development but is not the desired long-term browser login mechanism.

A production/remote dashboard should prefer a same-origin server-managed session such as an HttpOnly cookie after an authenticated exchange.

Why:

- browser JavaScript should not hold a long-lived privileged token unnecessarily
- native `EventSource` cannot attach arbitrary Authorization headers
- putting bearer tokens in SSE query strings would leak secrets into URLs/logs/history
- Vite-exposed environment variables are compiled into frontend assets and are not secret storage

Therefore:

> Do not solve SSE authentication by putting an admin token in a URL or a `VITE_*` environment variable.

A future authenticated session should allow HTTP queries, SSE, and mutations to share the same server-side identity.

## Verification status

Verified:

- the full Java core compiles with the new auth/capability/audit classes
- the default world boots with the Admin listener enabled
- with no auth token configured, `GET /admin/api/session` returns HTTP 503 with `auth_not_configured`
- the first `players.message` mutation is capability-gated and audited

Not yet verified in the remote environment:

- successful bearer-token session response
- invalid-token 401 behavior

The remote-command environment blocks commands that include bearer-token-like test credentials. Do not bypass that safeguard.

Those paths should receive normal unit/integration coverage once the project has a dedicated Java test harness for the admin module.

## First mutation status

Implemented for `players.message`:

1. reused the existing moderator alert semantics rather than impersonating player chat
2. matched the existing moderator/player-moderator permission boundary
3. added reusable server-side capability authorization
4. added bounded input validation and typed result/error contracts
5. dispatches mutable player behavior through the OpenRSC game-event handler
6. persists success/failure audit records through the existing game logger
7. exposes only an online-player alert endpoint; no arbitrary command execution is possible

Still required before broadening mutations:

- dedicated Java coverage for authorized, unauthorized, forbidden, validation, timeout, and offline-player paths
- browser operator-session/action UX
- per-operation audits before granting teleport/kick/mute/ban or world/server writes
