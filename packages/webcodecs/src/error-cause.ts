declare const BaseError: ErrorConstructor;

declare class Error extends BaseError {
	constructor(reason?: string, options?: {cause?: unknown});

	cause: unknown;
}

export default Error;
