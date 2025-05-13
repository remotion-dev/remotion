/* eslint-disable @typescript-eslint/no-unused-vars */
export class BaseStreamer {
	/**
	 * Function that is called by `.generate()` to push new tokens
	 * @param {bigint[][]} value
	 */
	put(_value: unknown) {
		throw Error('Not implemented');
	}

	/**
	 * Function that is called by `.generate()` to signal the end of generation
	 */
	end() {
		throw Error('Not implemented');
	}
}
