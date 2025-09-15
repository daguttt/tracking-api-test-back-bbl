import type { ShipmentWithHistory } from './shipment-with-history.model';
import type {
	UnitWithCheckpoints,
	UnitWithCurrentStatusAndCheckpoints,
} from './unit-with-checkpoints.model';

export function appendCurrentStatusToShipmentUnits(
	shipment: ShipmentWithHistory<UnitWithCheckpoints>
): ShipmentWithHistory<UnitWithCurrentStatusAndCheckpoints> {
	shipment.units = shipment.units.map((unit) => {
		const lastCheckpoint = unit.checkpoints[unit.checkpoints.length - 1];
		return {
			...unit,
			currentStatus: lastCheckpoint.status,
		} satisfies UnitWithCurrentStatusAndCheckpoints;
	});
	return shipment as ShipmentWithHistory<UnitWithCurrentStatusAndCheckpoints>;
}
