import type { Shipment } from '@db/schema';
import type { UnitWithCheckpoints } from './unit-with-checkpoints.model';

export interface ShipmentWithHistory<TUnit extends UnitWithCheckpoints>
	extends Shipment {
	units: TUnit[];
}
