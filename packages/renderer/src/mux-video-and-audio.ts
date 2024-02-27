import {VERSION} from 'remotion/version';
import {callFf} from './call-ffmpeg';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {truthy} from './truthy';

export const muxVideoAndAudio = async ({
	videoOutput,
	audioOutput,
	output,
	indent,
	logLevel,
	onProgress,
	binariesDirectory,
	fps,
	cancelSignal,
}: {
	videoOutput: string;
	audioOutput: string;
	output: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	fps: number;
	onProgress: (p: number) => void;
	cancelSignal: CancelSignal | undefined;
}) => {
	const startTime = Date.now();
	Log.verbose({indent, logLevel}, 'Muxing video and audio together');
	const command = [
		'-i',
		videoOutput,
		'-i',
		audioOutput,
		'-c:v',
		'copy',
		'-c:a',
		'copy',
		`-metadata`,
		`comment=Made with Remotion ${VERSION}`,
		'-y',
		output,
	].filter(truthy);

	Log.verbose({indent, logLevel}, 'Combining command: ', command);

	const task = callFf({
		bin: 'ffmpeg',
		args: command,
		indent,
		logLevel,
		binariesDirectory,
		cancelSignal,
	});
	task.stderr?.on('data', (data: Buffer) => {
		const parsed = parseFfmpegProgress(data.toString('utf8'), fps);
		if (parsed === undefined) {
			Log.verbose({indent, logLevel}, data.toString('utf8'));
		} else {
			Log.verbose({indent, logLevel}, `Combined ${parsed} frames`);
			onProgress(parsed);
		}
	});

	await task;
	Log.verbose({indent, logLevel}, `Muxing done in ${Date.now() - startTime}ms`);
};
