import type { ResultAsync } from 'neverthrow';

import type { DBError } from '@modules/shared-errors/domain';

import type {
  Checkpoint,
  RequiredDataForCheckpoint,
} from '../domain/checkpoint.entity';

export const createCheckpointUseCaseToken = Symbol('CreateCheckpointUseCase');

export interface CreateCheckpointUseCase {
  execute(
    checkpointToCreate: RequiredDataForCheckpoint
  ): ResultAsync<Checkpoint, DBError>;
}
