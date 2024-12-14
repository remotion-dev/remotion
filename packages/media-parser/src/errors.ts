export class IsAGifError extends Error {
	constructor(message: string) {
		super(message); // Call the parent constructor with the message
		this.name = 'IsAGifError'; // Set the error name

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, IsAGifError);
		}
	}
}
