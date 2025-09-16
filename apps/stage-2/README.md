# Code to refactor
```ts
// app.ts
import Fastify from "fastify";

class CheckpointManager {
  checkpoints: any[] = [];

  createCheckpoint(unitId: string, status: string, timestamp: Date) {
    this.checkpoints.push({
      id: Math.random().toString(),
      unitId,
      status,
      timestamp: timestamp.toISOString(),
      history: [],
    });
    return this.checkpoints;
  }

  getHistory(unitId: string) {
    return this.checkpoints.filter((c) => c.unitId === unitId);
  }
}

class UnitStatusService {
    units: any[] = [];

    updateUnitStatus(unitId: string, newStatus: string) {
        let unit = this.units.find((u) => u.id == unitId);

        if (!unit) {
            unit = { id: unitId, status: newStatus, checkpoints: [] };
            this.units.push(unit);
        }

        unit.status = newStatus;
        unit.checkpoints.push({
            status: newStatus,
            date: new Date().toString(),
        });

        return unit;
    }

    getUnitsByStatus(status: string) {
        return this.units.filter((u) => u.status === status);
    }
}

class TrackingAPI {
    checkpointManager = new CheckpointManager();
    unitService = new UnitStatusService();

    registerRoutes(app: any) {
        app.post("/checkpoint", async (req: any, reply: any) => {
            const { unitId, status } = req.body;
            const cp = this.checkpointManager.createCheckpoint(
                unitId,
                status,
                new Date()
            );
            this.unitService.updateUnitStatus(unitId, status);
            reply.send(cp);
        });

        app.get("/history", async (req: any, reply: any) => {
            const { unitId } = req.query as any;
            reply.send(this.checkpointManager.getHistory(unitId));
        });

        app.get("/unitsByStatus", async (req: any, reply: any) => {
            const { status } = req.query as any;
            reply.send(this.unitService.getUnitsByStatus(status));
        });
    }
}

const app = Fastify();
const api = new TrackingAPI();

api.registerRoutes(app);

app.listen({ port: 3000 }, (err: any, address: string) => {
  if (err) {
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
```

## Identified Problems

### 1. Missing type safety
The code misses strict type interfaces defining the shape of the objects being used.
- Risk: Potential runtime errors due to type mismatches
- Principle: Clean Code, Type Safety, Robustness, Maintainability
- Risk: TS Compiler cannot catch errors, runtime crashes are likely to occur.
- Fix: 
  - Infer the type/interfaces of `Unit`, `Checkpoint` from DB schemas or validation schemas and use DTOs for request/reponse bodies.
  - Avoid using `any`, embrace `unknown` when defining types is not feasible.

### 2. `updateUnitStatus` multiple responsibilities
The `updateUnitStatus` function currently has 3 responsibilities: Find or create the unit, update the unit status and add a checkpoint.
- Principle: SRP (SOLID)
- Risk: Hard to test and maintain
- Fix: split the function into smaller ones:
    ```ts
    findOrCreateUnit(unitId: string): Unit
    updateUnitStatus(unit: Unit, newStatus: string): Unit
    addCheckpoint(unit: Unit, status: string, timestamp: Date): void
    ```

### 3. Data persistance
`CheckpointManager` and `UnitStatusService` are in-memory only
- Principle: Persistance abstraction, Clean Architecture
- Risk: Data loss on restart, no scaling across instances.
- Fix: Use a database such as PostgreSQL or in-memory database like Redis.

    ```ts
    interface CheckpointRepository {
        createCheckpoint(unitId: string, status: string, timestamp: Date): Promise<Checkpoint>;
    }
    class PgCheckpointRepository implements CheckpointRepository {
        async createCheckpoint(unitId: string, status: string, timestamp: Date): Promise<Checkpoint> {
            // ...
        }
    }
    class CheckpointManager {
        constructor(private readonly checkpointRepository: CheckpointRepository) {}

        async createCheckpoint(unitId: string, status: string, timestamp: Date): Promise<Checkpoint> {
            // ...
            return await this.checkpointRepository.createCheckpoint(unitId, status, timestamp);
        }
    }
    ```

### 4. High coupling (no DI)
Tracking API is tightly coupled to the implementation details of `CheckpointManager` and `UnitStatusService`.
- Principle: D of SOLID
- Risk: Difficult to test and swap mock implementations
- Fix: Use dependency injection
    ```ts
    class TrackingAPI {
        constructor(
            private checkpointManager: ICheckpointManager,
            private unitStatusService: IUnitStatusService
        ) {}
    }

### 5. Request Validation (Body and Query Params)
- Principle: API Design, Security
- Risk: Potential runtime errors due to invalid input
- Fix: Use Zod or another schema validation library for request input validation
    ```ts
    import { z } from "zod";

    const createCheckpointSchema = z.object({
        unitId: z.string(),
        status: z.enum(["pending", "in_transit", "delivered"]),
    });
    app.post("/checkpoint", zValidator('json', createCheckpointSchema) async (c) => {
        const { unitId, status } = c.req.json();
        // unitId -> string
        // status -> "pending" | "in_transit" | "delivered"
    })
    ```

### 6. Non-production ready set up (environments)
- Principle: 12 Factor App
- Risk: Difficulty to deploy and manage different environments
- Fix: Use environment variables and different configuration files for different environments
    ```ts
    app.listen({ port: process.env.PORT || 3000 }, /* ... */);
    ```

### 7. Domain logic inside API layer
The `POST /checkpoint` endpoint contains domain logic:

```ts
app.post("/checkpoint", async (c) => {
    // ...
    const cp = this.checkpointManager.createCheckpoint(
        unitId,
        status,
        new Date()
    );
    this.unitService.updateUnitStatus(unitId, status);
    // ...
});
```

- Principle: Separation of Concerns, Clean Architecture
- Risk: Domain logic can't be easily reused and tested
- Fix: Create domain services + repositories layers. The API layer should only handle system client communication (Network requests)

### 8. Unsafe Identifiers
`Checkpoint` model uses `Math.random().toString()` as its `id`
- Principle: Security, Consistency
- Risk: Collisions possible, unsafe for identifiers.
- Fix: Create UUID or DB-generated IDs.
    ```ts
    const id = crypto.randomUUID();
    this.checkpoints.push({ id, /* ... */ });
    ```

### 9. Inconsistent date management
Apart from code duplication. When updating a unit status, the checkpoint being created gets its timestamp as a local date. However, the checkpoint manager stores the timestamp as a ISO date.
- Principle: Domain consistency
- Risk: impossible to query consistently and potential data loss
- Fix: Always store as ISO 8601 or a number (`new Date().toISOString()` or `Date.now()`).

### 10. Error handling
- Principle: Robustness
- Risk: Service crashes silently, unclear errors to API consumers.
- Fix: Use the Result pattern or try-catch blocks to handle expected and unexpected errors properly.


### 11. Code duplication
`createCheckpoint` and `updateUnitStatus` repeat logic to create a unit's checkpoint
- Principle: DRY, SRP (SOLID)
- Risk: Hard to maintain
- Fix: `UnitStatusServices` should receive an instance of `CheckpointManager` to access the `createCheckpoint` method
    ```ts
    class UnitStatusService {
        constructor(
            private readonly checkpointManager: CheckpointManager
        ) {}

        updateUnitStatus(unitId: string, newStatus: string) {
            // ...
            
            unit.status = newStatus;
            const checkpoint = this.checkpointManager.createCheckpoint(unitId, newStatus, new Date());
            unit.checkpoints.push(checkpoint);
            
            // ...
        }
    }
    ```

### 12. Internal Model Leaking
`reply.send()` returns internal domain models directly

- Principle: Encapsulation, API Design
- Risk: Internal structures (like DB ids, raw history arrays) leak to clients.
- Fix: Use DTO / presenter pattern to shape API responses.
    ```ts
    class CheckpointDTO {
        id: string;
        unitId: string;
        status: string;
        timestamp: string;
    }

    class CheckpointMapper {
        toDTO(checkpoint: Checkpoint): CheckpointDTO {
            return {
                id: checkpoint.id,
                unitId: checkpoint.unitId,
                status: checkpoint.status,
                timestamp: checkpoint.timestamp,
            };
        }
    }

    class CheckpointManager {
        constructor(private readonly checkpointMapper: CheckpointMapper) {}

        createCheckpoint(unitId: string, status: string, timestamp: Date): CheckpointDTO {
            // ...
            returns this.checkpointMapper.toDTO(checkpoint);
        }
    }
    ```

### 13. No Logging / Monitoring
- Principle: Observability, Maintainability
- Risk: Impossible to debug in production.
- Fix: Use a logging library like Winston, Pino, or Bunyan, or in this case the integrated Fastify logger
    ```ts
    app.log.info(`Server running at ${address}`);
    ```

### 14.  Process Exit on Error
If an error occurs the process exits without letting a log of what occurred and/or implementing a graceful shutdown.

- Principle: Resilience
- Risk: 
    - Single crash could take down the system without recovery
    - Inflight requests are dropped.
- Fix: Log error if service crashes, attempt graceful shutdown and let orchestration (Docker/K8s) handle restart.
    ```ts
    // Graceful shutdown handler
    async function shutdown(signal: string) {
        try {
            app.log.info(`Received ${signal}. Closing server gracefully...`);

            // Stop accepting new connections
            await app.close();

            app.log.info("Server closed. Cleanup complete.");
            process.exit(0); // exit successfully after cleanup
        } catch (err) {
            app.log.error(err, "Error during shutdown");
            process.exit(1); // hard exit if cleanup fails
        }
    }

    // Register shutdown hooks for common signals
    process.on("SIGINT", () => shutdown("SIGINT"));  // Ctrl+C / docker stop
    process.on("SIGTERM", () => shutdown("SIGTERM")); // Kubernetes stop

    if (err) {
        app.log.error(err, "Failed to start server");
        // Instead of force exit, trigger graceful shutdown
        await shutdown("startup-error");
    }
    ```

### 15. No API Versioning

- Principle: API Design
- Risk: Any change is a breaking change for clients.
- Fix: Prefix routes with `/api/<version>` (e.g. `/api/v1`).

    ```ts
    // Fastify example
    const app = Fastify({ logger: true });
    const api = new TrackingAPI();

    // Register versioned routes
    app.register(
        async (v1App, opts, done) => {
            api.registerRoutes(v1App); // all routes under v1
            done();
        },
        { prefix: "/api/v1" } // 👈 versioned prefix here
    );
    ```