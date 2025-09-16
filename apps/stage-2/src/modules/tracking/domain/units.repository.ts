import type { ResultAsync } from 'neverthrow';

import type { DBError } from '@modules/shared-errors/domain';

import type { Unit } from './unit.entity';

export const unitsRepositoryToken = Symbol('UnitsRepository');

export interface UnitsRepository {
  update(unitId: string, status: string): ResultAsync<void, DBError>;

  getByStatus(status: string): ResultAsync<Unit[], DBError>;
}
