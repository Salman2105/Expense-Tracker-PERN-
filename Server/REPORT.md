# Backend Refactor Report

Scope: `Server/` only. No frontend files were touched. No route paths, HTTP
methods, or (except where explicitly called out below) response shapes were
changed. Branch: `refactor/backend-cleanup`.

**Update**: a repository layer (`src/repositories/`) was added in a
follow-up pass — see "Repository Layer (follow-up)" near the end of this
report for that change specifically; everything else below describes the
original refactor.

## Architecture Before

The backend already had a reasonable routes/controllers/services/middleware
skeleton (Express + Prisma), but with a number of real violations:

- **Duplicate validation layers.** `src/middleware/*.validation.js` and a
  parallel `src/validations/*.validator.js` directory both existed for the
  same resources. `src/validations/settings.validator.js` was 100% dead
  code; `src/validations/transaction.validator.js` was 75% dead (3 of 4
  exports unused), and its one live export (`validateGetTransactions`) was
  imported into `transaction.routes.js` alongside the *other* validation
  file for the same resource — two validation systems wired into one route
  file with no reason for the split.
- **Full business logic living in a route file.** `userSettings.routes.js`
  defined its three handlers (`getMySettings`/`createMySettings`/
  `updateMySettings`) inline, byte-for-byte duplicating an existing,
  entirely unused `userSettings.controller.js`.
- **Controllers reaching past their service layer into Prisma directly.**
  `account.controller.js#getAccountStatus` and `auth.controller.js#getMe`
  ran their own `prisma.user.findUnique` calls instead of going through a
  service. `account.controller.js#deleteAccount` also re-implemented the
  exact not-found/already-deleted/suspended checks that
  `account.service.js#deleteAccount` already performed.
- **Inconsistent error-handling contract across services**, three
  incompatible shapes coexisting: `.statusCode`-based throws (category,
  dashboard, transaction), `.code`-only throws with the HTTP status
  hand-mapped in the controller (account, user, userSettings), and
  `{success:false, message}` return values instead of throwing at all
  (auth). Only `transaction.controller.js` used `next(error)`; every other
  controller hand-rolled `try/catch` + manual status/message/code
  resolution, duplicating what `error.middleware.js` already existed to do.
- **A genuinely dead, unreachable error handler in `app.js`.** A second
  `app.use((error, req, res, next) => {...})` was registered right after
  `errorMiddleware`, which never calls `next(err)` — so the second
  handler's malformed-JSON-specific message could never fire. Verified via
  a live request: malformed JSON returned the raw body-parser message
  (`"Unexpected token h in JSON at position 0"`-style text) with the
  misleading code `INTERNAL_SERVER_ERROR` at a 400 status.
- **Middleware ordering bugs in `app.js`**: `hpp()` was registered *before*
  `express.json()`, so it could only ever de-duplicate query-string
  parameters, never JSON body fields (its main intended job runs after
  body parsing). Swagger UI was mounted before `helmet()`, so `/api-docs`
  skipped the security headers applied everywhere else.
- **`/db-check` and `/` defined inline in `app.js`**, mixing a DB query
  and response-building directly into the app bootstrap file.
- **A validation function duplicated inside `auth.controller.js`**
  (`validateRegisterInput`/`validateLoginInput`, ~150 lines) instead of
  living in `src/middleware/` like every other resource's validation.
- **Real duplication inside `transaction.service.js`** (684 lines): the
  "does this user have access to this category, and does the type match"
  check was implemented three times (once in `createTransaction`, twice
  inside `updateTransaction` — once for the "category being changed"
  branch and once, redundantly, in a shared re-check block that ran even
  when the category hadn't changed).
- **Hand-rolled UUID regexes** duplicated in `transaction.service.js` and
  `src/middleware/transaction.validation.js`, instead of using the `uuid`
  package's `validate()` that every other file in the codebase already
  used.
- **No tests, no lint config, no `.env.example`.**

## Architecture After

- `src/validations/` removed entirely. All request validation now lives in
  `src/middleware/*.validation.js`, one file per resource, wired
  consistently in the corresponding `*.routes.js`.
- `userSettings.routes.js` now only wires endpoints; all handler logic
  lives in `userSettings.controller.js`.
- `account.controller.js` and `auth.controller.js#getMe`'s direct-Prisma
  access is reduced (see "Files Changed" — `getAccountStatus` fully moved
  to the service; `getMe` intentionally left as-is, see "Remaining
  Issues").
- A new `src/utils/AppError.js` (`class AppError extends Error`) replaces
  the repeated `const error = new Error(msg); error.statusCode = x; throw
  error;` boilerplate across `account`, `category`, `dashboard`,
  `transaction`, `user`, and `userSettings` services.
- Every service now throws errors with **both** `.statusCode` and `.code`
  set consistently. `account.controller.js`, `category.controller.js`,
  `dashboard.controller.js`, `user.controller.js`, and
  `userSettings.controller.js` were converted from manual
  try/catch-and-map to `next(error)`, joining `transaction.controller.js`.
  All Prisma-error-to-HTTP translation (`P2002`/`P2025`) that used to live
  in controllers now lives in the owning service, next to the query that
  can produce it.
- `error.middleware.js` is now the **only** error handler. It absorbs the
  malformed-JSON special case that used to be dead code in `app.js`, uses
  the winston `logger` instead of `console.error` so 5xx errors land in
  `logs/error.log`, and — the one behavior change here — never relays a
  raw `err.message` to the client for a 5xx response (always "Internal
  server error"); 4xx messages are unchanged.
- `app.js` no longer defines any routes or does any DB access directly.
  `/`  and `/db-check` moved to `src/controllers/health.controller.js` +
  `src/routes/health.routes.js` (same paths, same responses).
  `helmet()` now runs before the Swagger UI mount; `hpp()` now runs after
  `express.json()`.
- `auth.controller.js`'s inline validators moved to
  `src/middleware/auth.validation.js`, wired into `auth.routes.js` the
  same way every other resource's validation middleware is wired.
  `GET /api/auth/protected`'s inline route handler moved to
  `authController.checkAuthStatus`.
- `transaction.service.js` gained one private helper,
  `resolveAndAuthorizeCategory(categoryId, userId)`, replacing three
  separate copies of the same category-existence/ownership/type logic.
  `updateTransaction` shrank from re-fetching and re-validating the
  category up to twice per call to exactly once.
- `dashboard.service.js`'s five independent read queries now run via
  `Promise.all` instead of five sequential `await`s.
- A new `src/constants/index.js` centralizes values that were previously
  duplicated across files: `TRANSACTION_TYPES` (was declared separately,
  identically, in 5 places), `BCRYPT_SALT_ROUNDS`, `MAX_PAGE_SIZE`, and
  `ACCOUNT_RETENTION_DAYS`.
- `logger.js` moved from `src/middleware/` to `src/utils/` — it exports a
  winston logger instance, not an `(req, res, next)` middleware function,
  so it didn't belong in that folder.
- `.gitignore` now excludes `logs/*.log` (they were previously tracked in
  git and were being modified by every server run).

## Files Changed

**Created**
- `src/utils/AppError.js` — shared HTTP error class.
- `src/constants/index.js` — shared cross-file constants.
- `src/controllers/health.controller.js`, `src/routes/health.routes.js` —
  `/` and `/db-check`, relocated out of `app.js`.
- `src/middleware/auth.validation.js` — register/login validation,
  relocated out of `auth.controller.js`.
- `jest.config.js`, `eslint.config.js` — new tooling (see "New
  Dependencies").
- `tests/*.test.js`, `tests/setupTestDb.js`, `tests/mocks/uuidShim.js` —
  new API test suite (58 tests).
- `REPORT.md` (this file).

**Deleted**
- `src/validations/settings.validator.js` — 100% dead code.
- `src/validations/transaction.validator.js` — 75% dead; its one live
  export (`validateGetTransactions`) was moved into
  `src/middleware/transaction.validation.js`.

**Moved**
- `src/middleware/logger.js` → `src/utils/logger.js`.

**Modified** (see "Architecture After" for the reasoning; every change
here was verified against the test suite / a live server before and
after):
- `src/app.js` — removed inline `/`, `/db-check`, and the dead second
  error handler; fixed `helmet`/`hpp` ordering; mounts `health.routes.js`.
- `src/middleware/error.middleware.js` — now the single, centralized
  error handler.
- `src/middleware/auth.middleware.js` — uses `response.util` instead of
  raw `res.json` (identical output shape, removes duplication).
- `src/middleware/rateLimit.middleware.js` — rate limiting is skipped only
  when `NODE_ENV=test`, so the test suite isn't rate-limited; unchanged in
  development/production.
- `src/middleware/category.validation.js`,
  `src/middleware/transaction.validation.js` — standardized on the `uuid`
  package and the shared `TRANSACTION_TYPES`/`MAX_PAGE_SIZE` constants;
  `transaction.validation.js` gained the `validateGetTransactions` export.
- `src/routes/auth.routes.js` — wires the new validation middleware and
  `checkAuthStatus`.
- `src/routes/transaction.routes.js` — imports all transaction validation
  from one file.
- `src/routes/userSettings.routes.js` — now just wires endpoints to the
  controller.
- `src/controllers/{account,auth,category,dashboard,user,userSettings}.controller.js`
  — see "SOLID Improvements" / "Code Quality Improvements".
- `src/services/{account,auth,category,dashboard,transaction,user,userSettings}.service.js`
  — `AppError` adoption, `.statusCode` added everywhere it was missing,
  constants adoption, `transaction.service.js` category-check
  deduplication, `dashboard.service.js` query batching.
- `src/utils/jwt.js` — honors `env.jwtExpiresIn` instead of a hardcoded
  `"1d"` (see "Behavior Changes").
- `.gitignore`, `package.json` (new `lint`/`test` scripts + devDependencies).

## SOLID Improvements

- **SRP**: `app.js` is now pure wiring (no DB access, no route handlers
  defined inline). Route files contain no business logic. Validation that
  lived inside `auth.controller.js` moved to its own middleware module.
- **DRY**: one `AppError` class instead of ~35 hand-rolled
  `new Error(); error.x = y; throw` blocks; one category-authorization
  helper instead of three copies; one set of `TRANSACTION_TYPES`/UUID
  validation instead of five; one error-handling middleware instead of
  two (one dead); one validation directory instead of two.
- **Dependency direction**: controllers depend on services, services
  depend on Prisma — the two exceptions found (`account.controller`'s
  duplicated checks, `auth.controller#getMe`'s direct query) were reduced
  to one intentionally-left case (see "Remaining Issues").
- Deliberately **not** introduced: a repository layer, DI container, or
  class-based services — Prisma-via-service-functions was already
  appropriate for this app's size, and adding more layers would be
  over-engineering for no real benefit here.

## Code Quality Improvements

- **Duplication removed**: validation directory split, category-auth
  logic in `transaction.service.js` (~90 lines → ~30), `TRANSACTION_TYPES`
  (5 declarations → 1), UUID regex (2 hand-rolled copies → the `uuid`
  package everywhere), bcrypt cost factor (2 inconsistent literals → 1
  named constant), `validateUserId` (byte-identical in
  `account.service.js`/`userSettings.service.js`, now both use `AppError`
  but are still two small functions — not merged into a shared util
  because they're two lines each and merging would add an import for less
  code than it saves; documented here rather than "fixed" per the
  no-unnecessary-abstraction guidance).
- **Large functions split**: `transaction.service.js#updateTransaction`
  shrank from ~245 to ~180 lines by removing the duplicate category
  resolution branch.
- **Validation improvements**: `auth.controller.js`'s inline validation
  is now proper middleware, consistent with every other resource.
- **Error handling improvements**: single source of truth for the
  response shape/status resolution logic (`error.middleware.js`);
  malformed JSON no longer leaks a raw parser message.
- **Naming improvements**: `logger.js` moved out of `middleware/` to
  where its actual role (a winston instance, not an Express handler)
  belongs.
- **Dead code removed**: `src/validations/settings.validator.js`,
  `src/validations/transaction.validator.js`'s 3 unused exports, `app.js`'s
  unreachable second error handler, `account.controller.js`'s duplicated
  pre-delete checks (the service already threw the identical errors).
- **Dependency improvements**: `hpp()`/`helmet()` ordering fixed; no new
  production dependency was introduced (see below).

## Behavior Changes (read this section carefully)

Every change below was deliberately made, verified with an automated test
and/or a live curl request before and after, and is additive/narrowing
rather than a removal of existing capability:

1. **Malformed JSON body → 400 with a generic message** (previously 400
   with the raw body-parser message and a misleading
   `INTERNAL_SERVER_ERROR` code). This activates the JSON-specific
   handling that already existed in `app.js` but was dead/unreachable
   code.
2. **JWT lifetime is now 7 days** (`JWT_EXPIRES_IN`, configurable),
   previously hardcoded to 1 day regardless of the `JWT_EXPIRES_IN` env
   var, which existed and was validated at startup but silently never
   used. Verified via `jwt.decode` on a real token before/after.
3. **`PATCH /api/users/me` with only unsupported/empty fields now returns
   400 `EMPTY_UPDATE`** instead of a generic 500. The underlying
   `EMPTY_UPDATE` error previously had no `.statusCode`, so it always fell
   through to the generic 500 handler; it now correctly carries 400,
   consistent with every other validation-style error in the codebase.
4. **bcrypt cost factor for new password hashes is now 12** everywhere
   (was 10 at registration, 12 at password change — unified on the
   stronger value). This does not affect any existing user: bcrypt embeds
   its own cost factor in the hash string, so `bcrypt.compare()` against
   already-stored hashes is unaffected; only newly hashed passwords use
   the new factor.
5. **5xx (unexpected/internal) error responses across `account`,
   `category`, `dashboard`, `user`, and `userSettings` controllers now
   return a uniform `"Internal server error"` message and
   `"INTERNAL_SERVER_ERROR"` code**, instead of each controller's own
   per-function message/code (e.g. `"Failed to fetch dashboard data"` /
   `"DASHBOARD_ERROR"`). **4xx responses from these same controllers are
   byte-for-byte unchanged** — this only affects the truly-unexpected
   error path, which is what centralizing error handling is supposed to
   do. Every 4xx case exercised by the test suite (400/401/403/404/409)
   was verified unchanged.
6. **UUID validation now uses the `uuid` package's `validate()`** instead
   of two hand-rolled regexes (in `transaction.service.js` and
   `transaction.validation.js`). The only observable difference: a UUID
   string with leading/trailing whitespace, which the old regex accepted
   (after an internal `.trim()`) but the actual database lookup would
   then fail on anyway (producing a confusing 404 "not found" instead of
   a 400 "invalid ID"), is now rejected up front with a clear 400. No
   normally-formed UUID (with or without this edge case) behaves
   differently.

Everything else — every route path, every HTTP method, every documented
success-response shape, every 4xx message/code combination exercised by
the test suite — is unchanged. One further shape quirk was **intentionally
preserved rather than "fixed"**: `GET /api/users/me/settings`'s success
response has no `message` field, unlike every other success response in
the app (which do). This was true before the refactor (it lived in the
now-deleted inline route handler) and is still true now that the logic
lives in the controller — changing it would be an API shape change I
wasn't asked to make.

## Known Bug — Discovered, NOT Fixed (needs a product decision)

`userService.updateUserProfile` (`src/services/user.service.js`) only ever
reads `data.profilePicture`; it never reads or applies `data.username`.
`PATCH /api/users/me` with `{ "username": "..." }` silently does nothing
useful — since no recognized field was set, it throws `EMPTY_UPDATE` (see
Behavior Change #3), even though `user.controller.js` and
`user.validation.js` both treat `username` as a supported field, and
`updateUserProfile`'s own `P2002` handling ("Username is already taken")
only makes sense if updating the username were actually wired up.

I did not fix this: enabling username updates would be new functionality,
not a bug fix, and changes what a previously-broken input does. A test
(`tests/user.test.js`) locks in and documents the *current* (broken)
behavior so a future fix is a deliberate, visible diff rather than a
silent behavior change. **This needs a human decision**: either wire
`username` into `updateUserProfile`'s `updateData`, or remove `username`
from `user.validation.js`/`user.controller.js` if username changes are
intentionally unsupported.

## Assumptions Made

- No `.env` existed in the repo (correctly gitignored). I created one
  pointing at a disposable local Postgres container
  (`expense-tracker-test-db`, port 5434) for verification. It is not
  committed. No `.env.example` existed either; I did not add one since no
  new environment variables were introduced by this refactor (all
  variables required were already documented implicitly by
  `config/env.js`'s `requiredEnv` check).
- `GET /api/auth/protected` and `GET /db-check` are undocumented (no
  Swagger annotations) debug/diagnostic endpoints. I relocated them to the
  correct architectural layer but left them fully functional at their
  existing paths rather than removing them, since the instructions treat
  existing behavior as the contract even when undocumented.

## New Dependencies

All added as `devDependencies` only — nothing shipped to production
changed:

- `jest`, `supertest` — no test framework existed; the task requires
  running actual API tests. Jest+Supertest is the standard pairing for
  this stack.
- `eslint`, `@eslint/js`, `globals` — no lint config existed; the task's
  verification gates require a lint pass.

No production dependency was added, removed, or upgraded.

## API Verification

**Automated** (`npm test`, 58 tests across 8 suites, all passing against a
live local Postgres instance): health/root, auth (register/login/me/
logout/protected, valid + invalid inputs, duplicate email, wrong password,
missing token, malformed token), categories (CRUD, duplicate name, cross-
user access), transactions (CRUD, pagination, type/category mismatch,
cross-user category access, cross-user transaction access, invalid/
nonexistent IDs), account (status, soft-delete, delete-when-already-
deleted), user profile (get/update, password change + wrong password +
same password, the known username-update bug), user settings (get with
auto-create, update, invalid theme, duplicate create, update-before-create).

**Manual** (live `node server.js` against the same database, full
before/after comparison): root, db-check, register, login (+ JWT lifetime
decode), me, protected, category create, transaction create, dashboard,
settings, malformed JSON, account status, unauthenticated request — all
matched expected output, including all 6 documented behavior changes.

## Quality Gates

- Install dependencies: **PASS** (`rm -rf node_modules && npm install`
  from a clean slate; the earlier `npm install-scripts approve ...` calls
  are recorded in `package.json`'s `allowScripts`, so the clean install
  ran non-interactively with no prompts)
- Tests: **PASS** (58/58, `npm test`, re-confirmed after the clean install)
- API tests: **PASS** (Supertest against a live Postgres instance; see above)
- Lint: **PASS** (`npm run lint`, 0 errors, 0 warnings, re-confirmed after
  the clean install)
- Typecheck: **N/A** (backend is plain CommonJS JS; the only `.ts` files,
  `prisma.config.ts` and `prisma/seed.ts`, are Prisma tooling config with
  no `tsconfig.json` targeting them, unchanged by this refactor)
- Build: **N/A** (no build step for this backend)
- Server startup: **PASS** (`node server.js`, confirmed via live curl
  session, twice — once before and once after the clean dependency install)
- Database connection: **PASS** (Prisma connected to Postgres 15 in Docker,
  port 5434)
- No frontend changes: **PASS** (`git status` for the whole repo shows
  only files under `Server/` touched; `frontend/` untouched)
- No secrets introduced: **PASS** (the `.env` created for local
  verification is gitignored and was never staged; no credentials appear
  in any diff)
- No unused imports/dead files remaining: **PASS** (eslint's
  `no-unused-vars` is clean repo-wide; the dead-code sweep in "Files
  Changed" removed the two fully/mostly-unused files that existed)
- Architecture follows the responsibility boundaries described in this
  task: **PASS**, with one intentionally-undone exception documented in
  "Remaining Issues" (`auth.controller.js#getMe`'s direct Prisma call)

**Pre-existing, unrelated to this refactor**: `npm audit` reports 3 high
severity advisories, all from `deepmerge-ts` pulled in transitively by
`prisma`'s own `@prisma/config` devDependency chain. Fixing it requires
`npm audit fix --force`, which would downgrade `prisma` itself (a
breaking change to a dependency this refactor didn't touch) — left alone
per "never add/remove a dependency outside what's stated here."

## Remaining Issues / Not Done

- **`auth.controller.js#getMe`** still queries Prisma directly instead of
  going through `user.service.js#getUserProfile`, which does almost the
  identical query. I left this alone rather than deduplicating it because
  `getMe`'s `select` includes `deletedAt` and `getUserProfile`'s doesn't —
  reusing the service would either drop a field from `GET /api/auth/me`'s
  response or add one to `GET /api/users/me`'s response, both of which are
  observable API changes I wasn't asked to make. Flagging for a human
  decision: if `deletedAt` should be added to `getUserProfile`'s select
  (harmless, since a deleted account's token can't reach either route
  according to `auth.middleware.js`), the two can be safely merged.
- **The username-update bug** described above needs a decision (fix
  the feature, or remove the unused username-update surface).
- **`account.service.js#anonymizeAccount`/`hardDeleteAccount`** run as two
  separate, non-transactional Prisma calls inside the cleanup job. This
  was already true before the refactor and is self-healing (a crash
  between the two leaves the account matching the cleanup job's next-run
  filter), but wrapping both in `prisma.$transaction` would be more
  robust. Not changed — out of scope for a code-quality pass and touches
  the account-deletion data flow, which felt too risky to change without
  an explicit ask.
- **No dedicated Prisma test database is provisioned automatically.** The
  test suite requires a reachable Postgres at `DATABASE_URL` and will fail
  loudly (not silently skip) if one isn't available, since this repo's own
  task instructions require actually running the tests rather than
  skipping them. `tests/setupTestDb.js` logs a clear message identifying
  the problem if the connection fails.

## Repository Layer (follow-up)

Added `src/repositories/` — one file per Prisma model
(`user.repository.js`, `category.repository.js`,
`transaction.repository.js`, `userSettings.repository.js`). Every direct
Prisma call anywhere in the app (services, `auth.middleware.js`,
`health.controller.js`, `auth.controller.js#getMe`) was moved into a
named repository function; nothing outside `src/repositories/` imports
`config/prisma` anymore except `category.service.js`, which still owns
the one `prisma.$transaction(async (tx) => ...)` orchestration for
atomically reassigning a deleted category's transactions to
"Uncategorized" — that's a business-level decision ("do these three
writes atomically"), not a query, so it stays in the service; the actual
reads/writes inside it call repository functions with the transaction's
`tx` client passed through.

**Convention**: every repository function accepts an optional trailing
`client` parameter (default: the shared Prisma singleton), so any write
that needs to be part of an atomic transaction can be composed by passing
`tx` instead of duplicating query logic inside the `$transaction`
callback.

**Naming, not generic CRUD**: rather than one generic
`findById(id, select)` per model, each repository function is named for
what it's actually used for (e.g. `findAccountStatusById`,
`findDeletionEligibilityById`, `findAnonymizationFields`,
`findAuthProfileById`, `findAuthContextById` — five different
`User`-by-ID reads with five different `select` shapes, because five
different call sites need five different fields). This was a deliberate
choice: a single generic finder that took an arbitrary `select` object
would leak Prisma's query shape into every caller and make it easy to
accidentally over-fetch (e.g. a route selecting `passwordHash` when it
didn't need to) — the whole point of a repository layer is to keep that
concern contained.

One side effect worth calling out: `transaction.repository.js#findOwnedById`
replaced three identical `findFirst({ where: { transactionId, userId } })`
call sites in `transaction.service.js` (get/update/delete) with one
shared function — an incidental DRY win from doing this extraction
carefully rather than mechanically.

**Verified**: all 58 tests still pass unchanged, lint is clean, and a full
live-server smoke test was re-run (register → login → me → create
category → create transaction → dashboard → delete category, the last of
which exercises the `$transaction` + repository composition specifically)
with identical results to before this change. No behavior changed by this
follow-up — it's a pure structural move.
