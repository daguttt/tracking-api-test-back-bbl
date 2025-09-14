import { inject, injectable } from 'tsyringe';
import { err, type Result } from 'neverthrow';

import { DBError, EntityNotFoundError } from '@lib/errors';

import type { CreateCheckpointDto } from './create-checkpoint.dto';
import {
	unitsRepositoryToken,
	type UnitsRepository,
} from './repositories/units.repository';

import {
	CheckpointWithStatusAlreadyExistsError,
	UnitNotFoundError,
} from './errors';
import {
	checkpointsRepositoryToken,
	type CheckpointsRepository,
} from './repositories';

export const checkpointsServiceToken = Symbol('CheckpointsService');
export interface CheckpointsService {
	create(
		createCheckpointDto: CreateCheckpointDto
	): Promise<
		Result<
			void,
			UnitNotFoundError | CheckpointWithStatusAlreadyExistsError | DBError
		>
	>;
}

@injectable()
export class CheckpointsServiceLive implements CheckpointsService {
	constructor(
		@inject(checkpointsRepositoryToken)
		private readonly checkpointsRepository: CheckpointsRepository,
		@inject(unitsRepositoryToken)
		private readonly unitsRepository: UnitsRepository
	) {}

	async create(
		createCheckpointDto: CreateCheckpointDto
	): Promise<
		Result<
			void,
			UnitNotFoundError | CheckpointWithStatusAlreadyExistsError | DBError
		>
	> {
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
			.andThen((checkpoint) => {
				return err(
					CheckpointWithStatusAlreadyExistsError.create({
						foundStatus: checkpoint.status,
					})
				);
			})
			.orElse((error) => {
				const shouldCreateCheckpoint = error instanceof EntityNotFoundError;
				if (!shouldCreateCheckpoint) return err(error);

				// Create checkpoint if it doesn't exist
				// TODO: Validate checkpoint to register has the correct next status (order)
				return this.checkpointsRepository
					.create(createCheckpointDto)
					.map(() => undefined as void);
			});
	}
}
