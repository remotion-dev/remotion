export class RegistrationRequiresRefactorError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'RegistrationRequiresRefactorError';
	}
}
