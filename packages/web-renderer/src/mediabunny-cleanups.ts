import {
	Output,
	type OutputFormat,
	type OutputOptions,
	type Target,
} from 'mediabunny';

export const makeOutputWithCleanup = <T extends OutputFormat, U extends Target>(
	options: OutputOptions<T, U>,
): {output: Output<T, U>; [Symbol.asyncDispose]: () => Promise<void>} => {
	const output = new Output(options);
	return {
		output,
		[Symbol.asyncDispose]: async () => {
			if (output.state === 'finalized') {
				return;
			}

			// Cleanup failures must not replace the original render error.
			await output.cancel().catch(() => {});
		},
	};
};
