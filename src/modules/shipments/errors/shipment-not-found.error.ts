import type { BaseError } from '@lib/errors';

export class ShipmentNotFoundError implements BaseError {
	readonly _tag = 'ShipmentNotFoundError';

	constructor(readonly searchedId?: string) {}

	static create({ searchedId }: { searchedId?: string }) {
		return new ShipmentNotFoundError(searchedId);
	}
}
