import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { shipments } from '@db/schema';
import { logger } from '@modules/logging';

const loggingPrefix = '[SEED_SHIPMENTS]';

export async function seedShipments(db: DrizzleD1Database) {
	logger.info(`${loggingPrefix} Seeding shipments...`);

	/*
	 * This will use the default values defined in the schema
	 * inserting the same amount of rows as elements in the array
	 */
	const shipmentsSeed = [{}, {}, {}];
	const insertedShipmentIds = await db
		.insert(shipments)
		.values(shipmentsSeed)
		.returning({ id: shipments.id });

	logger.info(`${loggingPrefix} Seeded shipments successfully`);

	return { insertedShipmentIds };
}
