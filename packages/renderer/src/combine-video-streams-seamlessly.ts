import {callFf} from './call-ffmpeg';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {truthy} from './truthy';

export const combineVideoStreamsSeamlessly = async ({
	fps,
	output,
	indent,
	logLevel,
	onProgress,
	files,
	binariesDirectory,
	cancelSignal,
}: {
	fps: number;
	output: string;
	indent: boolean;
	logLevel: LogLevel;
	onProgress: (p: number) => void;
	files: string[];
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
}) => {
	const fileList = `concat:${files.join('|')}`;

	const command = [
		'-hide_banner',
		'-i',
		fileList,
		'-an',
		'-c:v',
		'copy',
		'-y',
		output,
	].filter(truthy);

	const startTime = Date.now();
	Log.verbose(
		{indent, logLevel},
		`Combining video seamlessly without re-encoding, command: ${command.join(
			' ',
		)}`,
	);

	const task = callFf({
		args: command,
		bin: 'ffmpeg',
		indent,
		logLevel,
		binariesDirectory,
		cancelSignal,
	});
	task.stderr?.on('data', (data: Buffer) => {
		const parsed = parseFfmpegProgress(data.toString('utf8'), fps);
		if (parsed !== undefined) {
			Log.verbose({indent, logLevel}, `Encoded ${parsed} video frames`);
			onProgress(parsed);
		}
	});
	await task;
	Log.verbose(
		{indent, logLevel},
		`Finished combining video in ${Date.now() - startTime}ms`,
	);
	return output;
};
