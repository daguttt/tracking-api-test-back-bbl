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

## Problems

### 1. Missing type safety
The code misses strict type interfaces defining the shape of the objects being used.
- Risk: Maintainability: Potential runtime errors due to type mismatches

### 2. `updateUnitStatus` is doing too much
The `updateUnitStatus` function currently has 3 responsibilities: Find or create the unit, update the unit status and add a checkpoint.
- Principle: SRP (SOLID)
- Risk: it's hard to test and maintain
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

### 4. High coupling (no DI)
Tracking API is tightly coupled to the implementation details of `CheckpointManager` and `UnitStatusService`.
- Principle: D of SOLID
- Risk: Difficult to test and swap mock implementations
- Fix: Use dependency injection
    ```ts
    class TrackingAPI {
        constructor(
            private checkpointManager: CheckpointManager,
            private unitStatusService: UnitStatusService
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
- Principle: Separation of Concerns, Clean Architecture
- Risk:

### 8. Unsafe Identifiers
- Principle: 
- Risk:

### 9. Inconsistent date management
- Principle: Domain consistency
- Risk:

### 10. Error handling
- Principle:
- Risk: