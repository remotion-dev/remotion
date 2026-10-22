import type {SerializedCompilerError} from './types';

export class BrowserBundlerError extends Error {
	readonly diagnostics: string[];

	constructor(message: string, diagnostics: string[]) {
		super(message);
		this.name = 'BrowserBundlerError';
		this.diagnostics = diagnostics;
	}
}

export const serializeCompilerError = (
	error: unknown,
): SerializedCompilerError => ({
	message: error instanceof Error ? error.message : String(error),
	stack: error instanceof Error ? (error.stack ?? null) : null,
	diagnostics: error instanceof BrowserBundlerError ? error.diagnostics : [],
});
