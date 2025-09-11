import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { unitsTable } from '@db/schema';
import { logger } from '@modules/logging';

const loggingPrefix = '[SEED_UNITS]';

export async function seedUnits(
	db: DrizzleD1Database,
	{ shipmentIds }: { shipmentIds: string[] }
) {
	logger.info(`${loggingPrefix} Seeding units...`);

	const firstShipmentUnits = [
		{ shipmentId: shipmentIds[0] },
		{ shipmentId: shipmentIds[0] },
		{ shipmentId: shipmentIds[0] },
	];

	const secondShipmentUnits = [
		{ shipmentId: shipmentIds[1] },
		{ shipmentId: shipmentIds[1] },
	];

	const thirdShipmentUnits = [
		{ shipmentId: shipmentIds[2] },
		{ shipmentId: shipmentIds[2] },
		{ shipmentId: shipmentIds[2] },
	];

	const insertedUnitIds = await db
		.insert(unitsTable)
		.values([
			...firstShipmentUnits,
			...secondShipmentUnits,
			...thirdShipmentUnits,
		])
		.returning({ id: unitsTable.id });

	logger.info(`${loggingPrefix} Seeded units successfully`);

	return { insertedUnitIds };
}
