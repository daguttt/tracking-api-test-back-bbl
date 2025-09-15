import { inject, injectable } from 'tsyringe';
import type { ResultAsync } from 'neverthrow';

import type { Checkpoint, Shipment, Unit } from '@db/schema';
import type { DBError } from '@lib/errors';

import {
	shipmentsRepositoryToken,
	type ShipmentsRepository,
} from './repositories';
import { appendCurrentStatusToShipmentUnits } from './apprend-current-status-to-units.util';
import { computeShipmentStatusFromUnitsCurrentStatus } from './compute-shipment-status-from-units-current-status.util';
import type { ShipmentStatus } from './shipment-status.model';

export const shipmentsServiceToken = Symbol('ShipmentsService');
export interface ShipmentsService {
	findAll(): ResultAsync<ShipmentWithStatusAndUnits[], DBError>;
}

export interface UnitWithCurrentStatus extends Unit {
	currentStatus: Checkpoint['status'];
}

export interface ShipmentWithStatusAndUnits extends Shipment {
	units: UnitWithCurrentStatus[];
	currentStatus: ShipmentStatus;
}

@injectable()
export class ShipmentsServiceLive implements ShipmentsService {
	constructor(
		@inject(shipmentsRepositoryToken)
		private readonly shipmentsRepository: ShipmentsRepository
	) {}

	findAll() {
		return this.shipmentsRepository
			.findAll()
			.map((shipments) => shipments.map(appendCurrentStatusToShipmentUnits))
			.map((modifiedShipments) => {
				return modifiedShipments.map(
					(shipment) =>
						({
							id: shipment.id,
							createdAt: shipment.createdAt,
							updatedAt: shipment.updatedAt,
							currentStatus:
								computeShipmentStatusFromUnitsCurrentStatus(shipment),
							units: shipment.units.map((unit) => ({
								id: unit.id,
								createdAt: unit.createdAt,
								updatedAt: unit.updatedAt,
								currentStatus: unit.currentStatus,
								shipmentId: unit.shipmentId,
							})),
						}) satisfies ShipmentWithStatusAndUnits
				);
			});
	}
}
