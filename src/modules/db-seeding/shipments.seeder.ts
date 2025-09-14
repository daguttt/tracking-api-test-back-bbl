import { inject, injectable } from 'tsyringe';

import {
	shipmentsRepositoryToken,
	type ShipmentsRepository,
} from '@modules/shipments/repositories';
import { loggerToken, type Logger } from '@modules/logging';

const loggingPrefix = '[SEED_SHIPMENTS]';

@injectable()
export class ShipmentSeeder {
	constructor(
		@inject(loggerToken)
		private readonly logger: Logger,
		@inject(shipmentsRepositoryToken)
		private readonly shipmentsRepository: ShipmentsRepository
	) {}

	seed() {
		this.logger.info(`${loggingPrefix} Seeding shipments...`);
		/*
		 * This will use the default values defined in the schema
		 * inserting the same amount of rows as elements in the array
		 */
		const repositoryResult = this.shipmentsRepository.createBulk([{}, {}, {}]);
		this.logger.info(`${loggingPrefix} Seeded shipments successfully`);

		return repositoryResult;
	}
}
