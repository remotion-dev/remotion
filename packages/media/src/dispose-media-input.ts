import type {Input} from 'mediabunny';
import {Internals, type LogLevel} from 'remotion';

export const disposeMediaInput = (input: Input, logLevel: LogLevel) => {
	const onError = (error: unknown) => {
		Internals.Log.warn(
			{logLevel, tag: '@remotion/media'},
			'Failed to dispose media input:',
			error,
		);
	};

	try {
		Promise.resolve(input.dispose()).catch(onError);
	} catch (error) {
		onError(error);
	}
};
