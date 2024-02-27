import {VERSION} from 'remotion/version';
import {callFf} from './call-ffmpeg';
import type {LogLevel} from './log-level';
import {Log} from './logger';
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
}: {
	videoOutput: string;
	audioOutput: string;
	output: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	fps: number;
	onProgress: (p: number) => void;
}) => {
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
};
