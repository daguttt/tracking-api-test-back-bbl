import type { ResultAsync } from 'neverthrow';

import type { DBError } from '@modules/shared-errors/domain';

import type {
  Checkpoint,
  RequiredDataForCheckpoint,
} from './checkpoint.entity';

export const checkpointsRepositoryToken = Symbol('CheckpointsRepository');

export interface CheckpointsRepository {
  create(
    checkpont: RequiredDataForCheckpoint
  ): ResultAsync<Checkpoint, DBError>;

  getByUnitId(unitId: string): ResultAsync<Checkpoint[], DBError>;
}
