import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { checkpointsTable, Checkpoint } from '@db/schema';
import { logger } from '@modules/logging';

const loggingPrefix = '[SEED_CHECKPOINTS]';

export async function seedCheckpoints(
	db: DrizzleD1Database,
	{ unitIds }: { unitIds: string[] }
) {
	logger.info(`${loggingPrefix} Seeding checkpoints...`);

	const createdCheckpointsForUnits = unitIds.map(
		(unitId) =>
			({
				unitId,
				status: 'CREATED' as const,
			}) satisfies Partial<Checkpoint>
	);

	await db.insert(checkpointsTable).values(createdCheckpointsForUnits);

	logger.info(`${loggingPrefix} Seeded checkpoints successfully`);
}
