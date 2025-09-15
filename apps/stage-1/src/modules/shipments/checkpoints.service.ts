import { inject, injectable } from 'tsyringe';
import { err, type Result } from 'neverthrow';

import { DBError, EntityNotFoundError } from '@lib/errors';

import type { CreateCheckpointDto } from './create-checkpoint.dto';
import {
	unitsRepositoryToken,
	type UnitsRepository,
} from './repositories/units.repository';

import { UnitNotFoundError } from './errors';
import {
	checkpointsRepositoryToken,
	type CheckpointsRepository,
} from './repositories';
import { loggerToken, type Logger } from '@modules/logging';

export const checkpointsServiceToken = Symbol('CheckpointsService');
export interface CheckpointsService {
	create(
		createCheckpointDto: CreateCheckpointDto
	): Promise<Result<void, UnitNotFoundError | DBError>>;
}

@injectable()
export class CheckpointsServiceLive implements CheckpointsService {
	constructor(
		@inject(checkpointsRepositoryToken)
		private readonly checkpointsRepository: CheckpointsRepository,
		@inject(unitsRepositoryToken)
		private readonly unitsRepository: UnitsRepository,
		@inject(loggerToken)
		private readonly logger: Logger
	) {}

	async create(
		createCheckpointDto: CreateCheckpointDto
	): Promise<Result<void, UnitNotFoundError | DBError>> {
		// Check if unit exists
		const unitResult = await this.unitsRepository.findOne({
			id: createCheckpointDto.unitId,
		});

		if (unitResult.isErr()) {
			const error = unitResult.error;
			if (error instanceof DBError) return err(error);

			return err(
				UnitNotFoundError.create({
					searchedId: createCheckpointDto.unitId,
				})
			);
		}

		const unit = unitResult.value;

		// Check if the checkpoint with the given status is already registered for the unit (idempotency)
		return this.checkpointsRepository
			.findOneByUnitIdAndStatus({
				unitId: unit.id,
				status: createCheckpointDto.status,
			})
			.map(() => undefined as void)
			.orElse((error) => {
				const shouldCreateCheckpoint = error instanceof EntityNotFoundError;
				if (!shouldCreateCheckpoint) return err(error);

				this.logger.debug(
					`[${CheckpointsServiceLive.name}] Creating checkpoint for unit '${unit.id}' with status '${createCheckpointDto.status}'`
				);

				// Create checkpoint if it doesn't exist
				// TODO: Validate checkpoint to register has the correct next status (order)
				return this.checkpointsRepository
					.create(createCheckpointDto)
					.map(() => undefined as void);
			});
	}
}
