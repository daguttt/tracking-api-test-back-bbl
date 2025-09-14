import type { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';

import type { HonoEnv } from '@/factory';
import { logger, loggerToken } from '@modules/logging';

import { container, type DependencyContainer } from 'tsyringe';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';

import { dbToken } from '@db/db.token';
import {
	D1CheckpointsRepository,
	checkpointsRepositoryToken,
} from '@modules/shipments';
import {
	D1ShipmentsRepository,
	shipmentsRepositoryToken,
} from '@modules/shipments';
import { D1UnitsRepository, unitsRepositoryToken } from '@modules/shipments';

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
			const db = drizzle(c.env.DB, { casing: 'snake_case' });
			container.register<DrizzleD1Database>(dbToken, { useValue: db });

			// Register repositories
			container.register(shipmentsRepositoryToken, {
				useClass: D1ShipmentsRepository,
			});
			container.register(unitsRepositoryToken, { useClass: D1UnitsRepository });
			container.register(checkpointsRepositoryToken, {
				useClass: D1CheckpointsRepository,
			});
		})(c, next);
	});
}
