import type { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { container, type DependencyContainer } from 'tsyringe';
import { drizzle } from 'drizzle-orm/d1';

import type { HonoEnv } from '@/factory';
import { logger, loggerToken } from '@modules/logging';
import { dbToken } from '@db/db.token';
import * as dbSchema from '@db/schema';
import {
	checkpointsRepositoryToken,
	D1CheckpointsRepository,
	D1ShipmentsRepository,
	D1UnitsRepository,
	shipmentsRepositoryToken,
	unitsRepositoryToken,
} from '@modules/shipments/repositories';
import {
	CheckpointsServiceLive,
	checkpointsServiceToken,
	TrackingServiceLive,
	trackingServiceToken,
} from '@modules/shipments';

function tsyringeMiddleware(
	...providers: ((container: DependencyContainer) => void)[]
) {
	return createMiddleware<HonoEnv>(async (c, next) => {
		const childContainer = container.createChildContainer();
		providers.forEach((provider) => provider(childContainer));
		c.set('resolve', (token) => childContainer.resolve(token));
		await next();
	});
}

export function setupDIContainer(app: Hono<HonoEnv>) {
	app.use('*', async (c, next) => {
		await tsyringeMiddleware((container) => {
			container.register(loggerToken, { useValue: logger });

			// Register D1 database
			const db = drizzle(c.env.DB, { casing: 'snake_case', schema: dbSchema });
			container.register(dbToken, { useValue: db });

			// Register repositories
			container.register(shipmentsRepositoryToken, {
				useClass: D1ShipmentsRepository,
			});
			container.register(unitsRepositoryToken, { useClass: D1UnitsRepository });
			container.register(checkpointsRepositoryToken, {
				useClass: D1CheckpointsRepository,
			});

			container.register(checkpointsServiceToken, {
				useClass: CheckpointsServiceLive,
			});
			container.register(trackingServiceToken, {
				useClass: TrackingServiceLive,
			});
		})(c, next);
	});
}
