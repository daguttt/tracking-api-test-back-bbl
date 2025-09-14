import { inject, injectable } from 'tsyringe';

import { ShipmentSeeder } from './shipments.seeder';
import { UnitsSeeder } from './units.seeder';
import { CheckpointsSeeder } from './checkpoints.seeder';

@injectable()
export class DbSeedingService {
	constructor(
		@inject(ShipmentSeeder)
		private readonly shipmentSeeder: ShipmentSeeder,
		@inject(UnitsSeeder)
		private readonly unitsSeeder: UnitsSeeder,
		@inject(CheckpointsSeeder)
		private readonly checkpointsSeeder: CheckpointsSeeder
	) {}

	seed() {
		return this.shipmentSeeder
			.seed()
			.andThen(({ insertedShipmentIds }) =>
				this.unitsSeeder.seed(insertedShipmentIds)
			)
			.andThen(({ insertedUnitIds }) =>
				this.checkpointsSeeder.seed(insertedUnitIds)
			);
	}
}
