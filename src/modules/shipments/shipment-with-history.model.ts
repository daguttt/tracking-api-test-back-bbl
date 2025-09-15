import type { Shipment, Unit } from '@db/schema';

export interface ShipmentWithHistory<TUnit extends Unit> extends Shipment {
	units: TUnit[];
}
