import {RenderInternals, type LogLevel} from '@remotion/renderer';

export const logHmrTiming = ({
	detail,
	logLevel,
	stage,
}: {
	detail: string | null;
	logLevel: LogLevel;
	stage: string;
}) => {
	const detailSuffix = detail ? ` ${detail}` : '';

	RenderInternals.Log.trace(
		{indent: false, logLevel},
		`[hmr-timing] epoch=${Date.now()} monotonic=${performance.now().toFixed(3)} stage=${stage}${detailSuffix}`,
	);
};
