import { inject, injectable } from 'tsyringe';
import { ResultAsync } from 'neverthrow';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { units } from '@db/schema';
import { DBError } from '@lib/errors';
import { dbToken } from '@db/db.token';

import type { RequiredDataForUnit } from './required-data-for-unit.model';

export const unitsRepositoryToken = Symbol('UnitsRepository');
export interface UnitsRepository {
	createBulk(
		unitsToCreate: RequiredDataForUnit[]
	): ResultAsync<{ insertedUnitIds: string[] }, DBError>;
}

@injectable()
export class D1UnitsRepository implements UnitsRepository {
	constructor(@inject(dbToken) private readonly db: DrizzleD1Database) {}

	createBulk(
		unitsToCreate: RequiredDataForUnit[]
	): ResultAsync<{ insertedUnitIds: string[] }, DBError> {
		return ResultAsync.fromPromise(
			this.db.insert(units).values(unitsToCreate).returning({ id: units.id }),
			(error) => new DBError(error)
		).map((ids) => ({ insertedUnitIds: ids.map((id) => id.id) }));
	}
}
