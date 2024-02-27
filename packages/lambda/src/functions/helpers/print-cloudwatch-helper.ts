import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {LambdaRoutines} from '../../defaults';

export const printCloudwatchHelper = (
	type: LambdaRoutines,
	data: Record<string, string | boolean>,
	logLevel: LogLevel,
) => {
	const d = Object.keys(data).reduce((a, b) => {
		return [...a, `${b}=${data[b]}`];
	}, [] as string[]);
	const msg = [`method=${type}`, ...d].join(',');
	RenderInternals.Log.info({indent: false, logLevel}, msg);
};
