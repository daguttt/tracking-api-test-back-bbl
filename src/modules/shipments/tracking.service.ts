import { inject, injectable } from 'tsyringe';
import { err, type ResultAsync } from 'neverthrow';

import { EntityNotFoundError, type DBError } from '@lib/errors';
import {
	shipmentsRepositoryToken,
	type ShipmentsRepository,
} from '@modules/shipments/repositories';
import { ShipmentNotFoundError } from '@modules/shipments/errors';
import type { ShipmentWithHistory } from '@modules/shipments';
import type {
	UnitWithCheckpoints,
	UnitWithCurrentStatusAndCheckpoints,
} from './unit-with-checkpoints.model';

export const trackingServiceToken = Symbol('TrackingService');
export interface TrackingService {
	getHistoryByTrackingId(
		trackingId: string
	): ResultAsync<
		ShipmentWithHistory<UnitWithCurrentStatusAndCheckpoints>,
		ShipmentNotFoundError | DBError
	>;
}

@injectable()
export class TrackingServiceLive implements TrackingService {
	constructor(
		@inject(shipmentsRepositoryToken)
		private readonly shipmentsRepository: ShipmentsRepository
	) {}

	getHistoryByTrackingId(trackingId: string) {
		return this.shipmentsRepository
			.findOneWithHistory({ id: trackingId })
			.orElse((error) =>
				error instanceof EntityNotFoundError
					? err(
							ShipmentNotFoundError.create({
								searchedId: trackingId,
							})
						)
					: err(error)
			)
			.map(this.appendCurrentStatusToUnits);
	}

	private appendCurrentStatusToUnits(
		shipment: ShipmentWithHistory<UnitWithCheckpoints>
	) {
		shipment.units = shipment.units.map((unit) => {
			const lastCheckpoint = unit.checkpoints[unit.checkpoints.length - 1];
			return {
				...unit,
				currentStatus: lastCheckpoint.status,
			} satisfies UnitWithCurrentStatusAndCheckpoints;
		});
		return shipment as ShipmentWithHistory<UnitWithCurrentStatusAndCheckpoints>;
	}
}
