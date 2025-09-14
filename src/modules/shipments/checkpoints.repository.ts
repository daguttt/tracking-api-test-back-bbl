import { checkpoints, type Checkpoint } from '@/db/schema';
import { inject, injectable } from 'tsyringe';
import { ResultAsync } from 'neverthrow';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { DBError } from '@lib/errors';
import { dbToken } from '@db/db.token';

export const checkpointsRepositoryToken = Symbol('CheckpointsRepository');
export interface CheckpointsRepository {
	createBulk(
		checkpointsToCreate: Array<{
			unitId: string;
			status: Checkpoint['status'];
		}>
	): ResultAsync<void, DBError>;
}

@injectable()
export class D1CheckpointsRepository implements CheckpointsRepository {
	constructor(@inject(dbToken) private readonly db: DrizzleD1Database) {}

	createBulk(
		checkpointsToCreate: Array<{
			unitId: string;
			status: Checkpoint['status'];
		}>
	): ResultAsync<void, DBError> {
		return ResultAsync.fromPromise(
			this.db.insert(checkpoints).values(
				checkpointsToCreate.map((checkpoint) => ({
					status: checkpoint.status,
					unitId: checkpoint.unitId,
				}))
			),
			(error) => new DBError(error)
		).map(() => undefined);
	}
}
