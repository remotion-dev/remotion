import {Log, type LogLevel} from './log';

export const playbackLogging = ({
	logLevel,
	tag,
	message,
	mountTime,
}: {
	logLevel: LogLevel;
	tag: string;
	message: string;
	mountTime: number | null;
}) => {
	const tags = [mountTime ? Date.now() - mountTime + 'ms ' : null, tag]
		.filter(Boolean)
		.join(' ');

	Log.trace(logLevel, `[${tags}]`, message);
};
