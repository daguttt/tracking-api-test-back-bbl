import { inject, injectable } from 'tsyringe';

import { loggerToken, type Logger } from '@modules/logging';
import {
	unitsRepositoryToken,
	type UnitsRepository,
} from '@modules/shipments/repositories';

const loggingPrefix = '[SEED_UNITS]';

@injectable()
export class UnitsSeeder {
	constructor(
		@inject(loggerToken)
		private readonly logger: Logger,
		@inject(unitsRepositoryToken)
		private readonly unitsRepository: UnitsRepository
	) {}

	seed(shipmentIds: string[]) {
		this.logger.info(`${loggingPrefix} Seeding units...`);

		const firstShipmentUnits = [
			{ shipmentId: shipmentIds[0] },
			{ shipmentId: shipmentIds[0] },
			{ shipmentId: shipmentIds[0] },
		];

		const secondShipmentUnits = [
			{ shipmentId: shipmentIds[1] },
			{ shipmentId: shipmentIds[1] },
		];

		const thirdShipmentUnits = [
			{ shipmentId: shipmentIds[2] },
			{ shipmentId: shipmentIds[2] },
			{ shipmentId: shipmentIds[2] },
		];

		const allUnits = [
			...firstShipmentUnits,
			...secondShipmentUnits,
			...thirdShipmentUnits,
		];

		const repositoryResult = this.unitsRepository.createBulk(allUnits);
		this.logger.info(`${loggingPrefix} Seeded units successfully`);

		return repositoryResult;
	}
}
