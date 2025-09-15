import type { ShipmentWithHistory } from './shipment-with-history.model';
import type { UnitWithCurrentStatusAndCheckpoints } from './unit-with-checkpoints.model';
import type { ShipmentStatus } from './shipment-status.model';

type UnitSpec = (units: UnitWithCurrentStatusAndCheckpoints[]) => boolean;

const allDelivered: UnitSpec = (units) =>
	units.every((u) => u.currentStatus === 'DELIVERED');
const anyException: UnitSpec = (units) =>
	units.some((u) => u.currentStatus === 'EXCEPTION');
const partialDelivered: UnitSpec = (units) => {
	const deliveredCount = units.filter(
		(status) => status.currentStatus === 'DELIVERED'
	).length;
	return deliveredCount > 0 && deliveredCount < units.length;
};
const anyOutForDelivery: UnitSpec = (units) =>
	units.some((u) => u.currentStatus === 'OUT_FOR_DELIVERY');
const anyInTransit: UnitSpec = (units) =>
	units.some((u) => u.currentStatus === 'IN_TRANSIT');
const anyAtFacility: UnitSpec = (units) =>
	units.some((u) => u.currentStatus === 'AT_FACILITY');
const allPickedUp: UnitSpec = (units) =>
	units.every((u) => u.currentStatus === 'PICKED_UP');
const anyPickedUp: UnitSpec = (units) =>
	units.some((u) => u.currentStatus === 'PICKED_UP');
const allCreated: UnitSpec = (units) =>
	units.every((u) => u.currentStatus === 'CREATED');

/**
 * Order matters - the first matching unit spec will determine the status.
 * Keep higher priority statuses (like EXCEPTION) at the top.
 */
const unitSpecs: [UnitSpec, ShipmentStatus][] = [
	[anyException, 'EXCEPTION'],
	[allDelivered, 'DELIVERED'],
	[partialDelivered, 'PARTIALLY_DELIVERED'],
	[anyOutForDelivery, 'OUT_FOR_DELIVERY'],
	[anyAtFacility, 'AT_FACILITY'],
	[anyInTransit, 'IN_TRANSIT'],
	[allPickedUp, 'PICKED_UP'],
	[anyPickedUp, 'IN_PROGRESS'],
	[allCreated, 'CREATED'],
	[() => true, 'IN_PROGRESS'], // fallback
];

export function computeShipmentStatusFromUnitsCurrentStatus(
	shipment: ShipmentWithHistory<UnitWithCurrentStatusAndCheckpoints>
): ShipmentStatus {
	for (const [spec, status] of unitSpecs) {
		const specMatches = spec(shipment.units);
		if (specMatches) return status;
	}
	return 'IN_PROGRESS';
}
