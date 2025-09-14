import { inject, injectable } from 'tsyringe';

import { logger } from '@modules/logging';
import {
	checkpointsRepositoryToken,
	type CheckpointsRepository,
} from '@/modules/shipments/checkpoints.repository';

const loggingPrefix = '[SEED_CHECKPOINTS]';

@injectable()
export class CheckpointsSeeder {
	constructor(
		@inject(checkpointsRepositoryToken)
		private readonly checkpointsRepository: CheckpointsRepository
	) {}

	seed(unitIds: string[]) {
		logger.info(`${loggingPrefix} Seeding checkpoints...`);

		const checkpointsToCreateForUnits = unitIds.map((unitId) => ({
			unitId,
			status: 'CREATED' as const,
		}));

		const repositoryResult = this.checkpointsRepository.createBulk(
			checkpointsToCreateForUnits
		);
		logger.info(`${loggingPrefix} Seeded checkpoints successfully`);
		return repositoryResult;
	}
}
