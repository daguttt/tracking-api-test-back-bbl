import { inject, injectable } from 'tsyringe';
import { err, ok, ResultAsync } from 'neverthrow';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import * as dbSchema from '@db/schema';
import { units, type Unit } from '@db/schema';
import { DBError, EntityNotFoundError } from '@lib/errors';
import { dbToken } from '@db/db.token';

export const unitsRepositoryToken = Symbol('UnitsRepository');
export interface UnitsRepository {
	createBulk(
		unitsToCreate: RequiredDataForUnit[]
	): ResultAsync<{ insertedUnitIds: string[] }, DBError>;

	findOne({
		id,
	}: {
		id: string;
	}): ResultAsync<Unit, DBError | EntityNotFoundError>;
}

type RequiredDataForUnit = {
	shipmentId: string;
};

@injectable()
export class D1UnitsRepository implements UnitsRepository {
	constructor(
		@inject(dbToken) private readonly db: DrizzleD1Database<typeof dbSchema>
	) {}

	createBulk(
		unitsToCreate: RequiredDataForUnit[]
	): ResultAsync<{ insertedUnitIds: string[] }, DBError> {
		return ResultAsync.fromPromise(
			this.db.insert(units).values(unitsToCreate).returning({ id: units.id }),
			(error) => new DBError(error)
		).map((ids) => ({ insertedUnitIds: ids.map((id) => id.id) }));
	}

	findOne({
		id,
	}: {
		id: string;
	}): ResultAsync<Unit, DBError | EntityNotFoundError> {
		return ResultAsync.fromPromise(
			this.db.query.units.findFirst({
				where: (units, { eq }) => eq(units.id, id),
			}),
			(error) => new DBError(error)
		).andThen((unit) => {
			if (!unit)
				return err(
					EntityNotFoundError.create({ entityName: 'Unit', searchedId: id })
				);
			return ok(unit);
		});
	}
}
