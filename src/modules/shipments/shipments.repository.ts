import { shipments, type Shipment } from '@/db/schema';
import { inject, injectable } from 'tsyringe';
import { ResultAsync } from 'neverthrow';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { DBError } from '@/lib/errors';
import { dbToken } from '@db/db.token';

export const shipmentsRepositoryToken = Symbol('ShipmentsRepository');
export interface ShipmentsRepository {
	createBulk(
		shipmentsToCreate: Partial<Shipment>[]
	): ResultAsync<{ insertedShipmentIds: string[] }, DBError>;
}

@injectable()
export class D1ShipmentsRepository implements ShipmentsRepository {
	constructor(@inject(dbToken) private readonly db: DrizzleD1Database) {}

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
}
