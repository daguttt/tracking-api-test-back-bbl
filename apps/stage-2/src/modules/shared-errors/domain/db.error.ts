import type { BaseError } from './base-error.model';

export class DBError implements BaseError {
  readonly _tag = 'DBError';

  constructor(readonly underlyingError?: unknown) {}
}
