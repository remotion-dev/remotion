class UnsupportedCodecError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'UnsupportedCodecError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export {UnsupportedCodecError};
