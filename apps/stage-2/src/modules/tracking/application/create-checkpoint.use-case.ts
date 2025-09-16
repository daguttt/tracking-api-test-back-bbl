import { inject, injectable } from 'tsyringe';
import type { ResultAsync } from 'neverthrow';

import type { DBError } from '@modules/shared-errors/domain';

import {
  checkpointsRepositoryToken,
  type CheckpointsRepository,
} from '../domain/checkpoints.repository';
import type {
  Checkpoint,
  RequiredDataForCheckpoint,
} from '../domain/checkpoint.entity';

import type { CreateCheckpointUseCase } from './create-creckpoint-use-case.interface';

@injectable()
export class CreateCheckpointUseCaseLive implements CreateCheckpointUseCase {
  constructor(
    @inject(checkpointsRepositoryToken)
    private readonly checkpointsRepository: CheckpointsRepository
  ) {}

  execute(
    checkpointToCreate: RequiredDataForCheckpoint
  ): ResultAsync<Checkpoint, DBError> {
    return this.checkpointsRepository.create(checkpointToCreate);
  }
}
