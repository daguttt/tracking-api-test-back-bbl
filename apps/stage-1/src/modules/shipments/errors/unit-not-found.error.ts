import type { BaseError } from '@lib/errors';

export class UnitNotFoundError implements BaseError {
	readonly _tag = 'UnitNotFoundError';

	constructor(readonly searchedId?: string) {}

	static create({ searchedId }: { searchedId?: string }) {
		return new UnitNotFoundError(searchedId);
	}
}
