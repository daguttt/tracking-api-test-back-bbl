import { inject, injectable } from 'tsyringe';
import { err, ok, ResultAsync } from 'neverthrow';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { DBError, EntityNotFoundError } from '@lib/errors';
import { dbToken } from '@db/db.token';
import { checkpoints, type Checkpoint } from '@db/schema';
import type { Db } from '@db/index';

type RequiredDataForCheckpoint = {
	unitId: string;
	status: Checkpoint['status'];
};

export const checkpointsRepositoryToken = Symbol('CheckpointsRepository');
export interface CheckpointsRepository {
	createBulk(
		checkpointsToCreate: Array<RequiredDataForCheckpoint>
	): ResultAsync<{ insertedCheckpointIds: string[] }, DBError>;

	create(
		checkpointToCreate: RequiredDataForCheckpoint
	): ResultAsync<{ insertedCheckpointId: string }, DBError>;

	findOneByUnitIdAndStatus({
		unitId,
		status,
	}: {
		unitId: string;
		status: Checkpoint['status'];
	}): ResultAsync<Checkpoint, DBError | EntityNotFoundError>;
}

@injectable()
export class D1CheckpointsRepository implements CheckpointsRepository {
	constructor(@inject(dbToken) private readonly db: DrizzleD1Database<Db>) {}

	createBulk(
		checkpointsToCreate: Array<RequiredDataForCheckpoint>
	): ResultAsync<{ insertedCheckpointIds: string[] }, DBError> {
		return ResultAsync.fromPromise(
			this.db
				.insert(checkpoints)
				.values(
					checkpointsToCreate.map((checkpoint) => ({
						status: checkpoint.status,
						unitId: checkpoint.unitId,
					}))
				)
				.returning({ id: checkpoints.id }),
			(error) => new DBError(error)
		).map((ids) => ({ insertedCheckpointIds: ids.map((id) => id.id) }));
	}

	create(
		checkpointToCreate: RequiredDataForCheckpoint
	): ResultAsync<{ insertedCheckpointId: string }, DBError> {
		return this.createBulk([checkpointToCreate]).map((ids) => ({
			insertedCheckpointId: ids.insertedCheckpointIds[0],
		}));
	}

	findOneByUnitIdAndStatus({
		unitId,
		status,
	}: {
		unitId: string;
		status: Checkpoint['status'];
	}): ResultAsync<Checkpoint, DBError | EntityNotFoundError> {
		return ResultAsync.fromPromise(
			this.db.query.checkpoints.findFirst({
				where: (checkpoints, { eq }) =>
					eq(checkpoints.unitId, unitId) && eq(checkpoints.status, status),
			}),
			(error) => new DBError(error)
		).andThen((checkpoint) => {
			if (!checkpoint)
				return err(
					EntityNotFoundError.create({
						entityName: 'Checkpoint',
						message: `Checkpoint not found for unit ${unitId} and status ${status}`,
					})
				);
			return ok(checkpoint);
		});
	}
}
