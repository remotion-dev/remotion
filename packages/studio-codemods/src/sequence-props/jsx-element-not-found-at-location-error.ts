export class JsxElementNotFoundAtLocationError extends Error {
	constructor() {
		super(
			'Cannot compute sequence props status: Could not find a JSX element at the specified location',
		);
		this.name = 'JsxElementNotFoundAtLocationError';
	}
}
