import { inject, injectable } from 'tsyringe';
import { err, ok, ResultAsync } from 'neverthrow';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { DBError, EntityNotFoundError } from '@lib/errors';

import { dbToken } from '@db/db.token';
import type { Db } from '@db/index';
import { Shipment, shipments } from '@db/schema';
import type { ShipmentWithHistory } from '../shipment-with-history.model';
import type { UnitWithCheckpoints } from '../unit-with-checkpoints.model';

export const shipmentsRepositoryToken = Symbol('ShipmentsRepository');
export interface ShipmentsRepository {
	createBulk(
		shipmentsToCreate: Partial<Shipment>[]
	): ResultAsync<{ insertedShipmentIds: string[] }, DBError>;

	findOneWithHistory({
		id,
	}: {
		id: string;
	}): ResultAsync<
		ShipmentWithHistory<UnitWithCheckpoints>,
		DBError | EntityNotFoundError
	>;

	findAll(): ResultAsync<ShipmentWithHistory<UnitWithCheckpoints>[], DBError>;
}

@injectable()
export class D1ShipmentsRepository implements ShipmentsRepository {
	constructor(@inject(dbToken) private readonly db: DrizzleD1Database<Db>) {}

	createBulk(
		shipmentsToCreate: Partial<Shipment>[]
	): ResultAsync<{ insertedShipmentIds: string[] }, DBError> {
		return ResultAsync.fromPromise(
			this.db
				.insert(shipments)
				.values(shipmentsToCreate)
				.returning({ id: shipments.id }),
			(error) => new DBError(error)
		).map((ids) => ({ insertedShipmentIds: ids.map((id) => id.id) }));
	}

	findOneWithHistory({
		id,
	}: {
		id: string;
	}): ResultAsync<
		ShipmentWithHistory<UnitWithCheckpoints>,
		DBError | EntityNotFoundError
	> {
		const query = this.db.query.shipments.findFirst({
			where: (shipments, { eq }) => eq(shipments.id, id),
			with: {
				units: {
					with: {
						checkpoints: {
							orderBy: (checkpoints, { asc }) => asc(checkpoints.createdAt),
						},
					},
				},
			},
		});

		return ResultAsync.fromPromise(
			query,
			(error) => new DBError(error)
		).andThen((shipment) => {
			if (!shipment)
				return err(
					EntityNotFoundError.create({
						entityName: 'Shipment',
						searchedId: id,
					})
				);
			return ok(shipment);
		});
	}

	findAll(): ResultAsync<ShipmentWithHistory<UnitWithCheckpoints>[], DBError> {
		const query = this.db.query.shipments.findMany({
			with: {
				units: {
					with: {
						checkpoints: {
							orderBy: (checkpoints, { desc }) => desc(checkpoints.createdAt),
							limit: 1,
						},
					},
				},
			},
		});
		return ResultAsync.fromPromise(query, (error) => new DBError(error));
	}
}
