import type {ChromiumOptions, LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

export const normalizeChromiumOptions = ({
	chromiumOptions,
	logLevel,
}: {
	chromiumOptions: ChromiumOptions;
	logLevel: LogLevel;
}): ChromiumOptions => {
	if (chromiumOptions.gl !== 'angle') {
		return chromiumOptions;
	}

	RenderInternals.Log.warn(
		{indent: false, logLevel},
		'gl=angle is not supported in Lambda. Changing to gl=swangle instead.',
	);
	return {...chromiumOptions, gl: 'swangle'};
};
