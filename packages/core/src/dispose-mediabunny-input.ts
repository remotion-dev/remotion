import {Log, type LogLevel} from './log.js';

export const disposeMediabunnyInput = (
	input: {dispose: () => void | Promise<void>},
	logLevel: LogLevel,
	tag: string,
) => {
	const onError = (error: unknown) => {
		Log.warn({logLevel, tag}, 'Failed to dispose media input:', error);
	};

	try {
		Promise.resolve(input.dispose()).catch(onError);
	} catch (error) {
		onError(error);
	}
};
