import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {DebuggingTimer} from '@remotion/serverless';

const formatTime = (time: number) => {
	return time + 'ms';
};

export const timer: DebuggingTimer = (label: string, logLevel: LogLevel) => {
	const start = Date.now();
	RenderInternals.Log.verbose({indent: false, logLevel}, `${label} - start\n`);

	return {
		end: () => {
			const end = Date.now();
			const time = end - start;

			RenderInternals.Log.verbose(
				{indent: false, logLevel},
				`${label} - ${formatTime(time)}\n`,
			);
		},
	};
};
