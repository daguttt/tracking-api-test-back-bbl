# Tracking API - BBL Backend Technical Test

## Project Overview

This project is a technical test that...

The project is built on Cloudflare Workers for serverless compute and uses Cloudflare D1 for as database storage. The API is designed for robust, scalable, keeping low-latency.


## Deployed version

Deployed version available: https://tracking-api-test-back-bbl.daguttt.workers.dev/api/v1/

## Design Decisions

### Tech Stack
- Cloudflare Workers for serverless compute
- Cloudflare D1 (SQLite) for data storage
- Hono as the HTTP framework
- Drizzle ORM for type-safe data access
- Zod for schema validation (`@hono/zod-validator`)
- tsyringe for Dependency Injection (DI)
- neverthrow for functional error handling

### Architectural style (feature modules)
The codebase follows a feature-module architecture under `src/modules/`, keeping routing, services, repositories, DTOs, and domain errors close together:
- `src/modules/shipments/` centralizes shipments/tracking/checkpoints functionality.
- `src/modules/db-seeding/` isolates seeding concerns.
This enforces modularity and testability while keeping domain logic cohesive.

Key layers within a feature:
- Routers: HTTP layer using Hono (for example `shipments.router.ts`, `tracking.router.ts`, `checkpoints.router.ts`).
- Services: business logic (for example `shipments.service.ts`, `tracking.service.ts`, `checkpoints.service.ts`).
- Repositories: data access via Drizzle (`repositories/*.ts`).
- DTOs/validation: Zod schemas (`create-checkpoint.dto.ts`).
- Domain errors: typed errors under `errors/` mapped to HTTP responses in routers.

### Routing and versioning
- Global base path: `/api` in `src/server.ts`.
- Versioned router: `/api/v1` hosting `shipments`, `checkpoints`, `tracking`, and `seed` routes with a `health-check` endpoint. See `createServerApp()` in `src/server.ts`.
- Middlewares: trailing slash normalization and CORS are applied at the app level.

### Dependency Injection strategy (tsyringe)
- A per-request child container is created via middleware in `src/dependency-injection.ts`.
- Hono context is extended so handlers resolve dependencies with `c.var.resolve(token)`; see `src/factory.ts` where `HonoEnv` defines `Variables.resolve`.
- Registrations per request include:
  - `logger` (`@modules/logging`) bound to `loggerToken`.
  - Drizzle D1 `db` constructed from `c.env.DB` with typed `schema` (`@db/schema`).
  - Repositories: `D1ShipmentsRepository`, `D1UnitsRepository`, `D1CheckpointsRepository`.
  - Services: `ShipmentsServiceLive`, `TrackingServiceLive`, `CheckpointsServiceLive`.
- This design avoids cross-request state and keeps Worker requests isolated.

### Data layer (Drizzle ORM + Cloudflare D1)
- Schema is defined in `src/db/schema.ts` with explicit relations and shared timestamps.
- Repositories encapsulate queries and return `ResultAsync<..., DBError | EntityNotFoundError>`:
  - `ShipmentsRepository` provides `createBulk`, `findAll`, and `findOneWithHistory`.
  - `UnitsRepository` provides `createBulk` and `findOne`.
  - `CheckpointsRepository` provides `createBulk`, `create`, and `findOneByUnitIdAndStatus`.
- Using repositories isolates data access from business logic and enables easier swapping/testing.

### Validation and DTOs
- Request validation is done at the router boundary using Zod with `@hono/zod-validator`.
- Example: `POST /checkpoints` validates the body via `create-checkpoint.dto.ts` before invoking the service.
- This ensures early and consistent input validation close to the transport layer.

### Error handling (neverthrow + typed errors)
- Services and repositories use `neverthrow` to propagate a `Result` instead of throwing exceptions.
- Shared error types live in `src/lib/errors/` (`DBError`, `EntityNotFoundError`), while domain-specific ones live under the feature (`ShipmentNotFoundError`, `UnitNotFoundError`).
- Routers pattern-match on `error._tag` to map domain/data errors to HTTP status codes.
- Benefits: explicit control flow, type-safety, and fewer hidden throw/catch paths—suiting the serverless environment.

### Logging
- Custom logger in `src/modules/logging/logger.util.ts` with log level gating via `LOGGING_LEVEL`.
- In development, logs stream raw to the console; in production, logs are normalized (strings + JSON payload) for easier ingestion.
- `wrangler.jsonc` enables observability with logs and sampling.

### Idempotency and business rules
- `CheckpointsService.create` ensures idempotency by checking for an existing checkpoint with the same status for a unit before creating (`findOneByUnitIdAndStatus`).
- Shipment status is computed from units’ current status via `compute-shipment-status-from-units-current-status.util.ts` after `appendCurrentStatusToShipmentUnits` derives each unit’s latest state.
- A TODO is noted to validate the correctness of status transitions ordering.

### Environment and configuration
- `wrangler.jsonc` sets `compatibility_flags` for Node.js compatibility and exposes `ENVIRONMENT` (production by default; overridden in `env.dev`).
- D1 is bound as `DB` with migrations under `src/db/migrations`.
- CORS and base path are configured in `src/server.ts`.

### Why this design
- Optimized for Cloudflare Workers: small, fast, and stateless per-request processing.
- Clear separation of concerns: transport (routers), domain (services), data (repositories), validation (DTOs), and infra (DI + server setup).
- Strong typing end-to-end via Drizzle and Zod.
- Predictable error boundaries and explicit flows with `neverthrow`.
- Easy to evolve: adding a new feature means adding a new module with its router/service/repository.

### Trade-offs and future improvements
- Add invariant checks for checkpoint status transitions (state machine) to prevent invalid transitions.
- Pagination and filtering on listing endpoints (e.g., `/shipments`).
- Contract-first API documentation and clients via OpenAPI.
- Testing (unit tests, integration tests).

## Local Development Setup

### Prerequisites
- Node.js (version specified in [.nvmrc](./.nvmrc))
    - Install it using [fnm](https://github.com/Schniz/fnm) (*Recommended*)
- Package Manager: [pnpm](https://pnpm.io/es/installation)
    - Check out **_why_** and how to install it [here](https://gist.github.com/daguttt/89adeb45ef3cf6483c394e135ce6e9ec)

### Running the project
#### 1. Clone the repo
```bash
git clone https://github.com/daguttt/mini-chat-technical-test.git
```

#### 2. Install dependencies.
```bash
pnpm i
```

#### 3. Environment variables.
1. Copy the [example file](./.env.example).
```bash
cp .env.example .env
```
    
2. Modify environment variables. 
    - `LOGGING_LEVEL`: set your desired logging level (`"debug" | "info" | "warn" | "error"`). Default is `"debug"`.

    Ask the project owner for the following variables:
    - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID.
    - `CLOUDFLARE_DATABASE_ID`: Cloudflare D1 database ID.
    - `CLOUDFLARE_D1_TOKEN`: Cloudflare D1 token.
   

#### 4. Cloudflare Setup
Create the local D1 (SQLite) database:
```bash
pnpm db:create:dev
```

> [!NOTE]
> The script will use `wrangler d1 migrations apply` in order to apply the migrations. **Make sure to allow the migrations to run (Hit `y` when prompted)**


#### 5. Run the development server
```bash
pnpm dev
```

Seed the database (Only the first time you set up the project)
```bash
pnpm db:seed:dev
```


