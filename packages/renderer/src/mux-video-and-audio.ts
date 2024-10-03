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
	addFaststart,
	metadata,
}: {
	videoOutput: string | null;
	audioOutput: string | null;
	output: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	fps: number;
	onProgress: (p: number) => void;
	cancelSignal: CancelSignal | undefined;
	addFaststart: boolean;
	metadata?: Record<string, string> | null;
}) => {
	const startTime = Date.now();
	Log.verbose({indent, logLevel}, 'Muxing video and audio together');
	const metadataArgs = Object.entries(metadata ?? {}).flatMap(
		([key, value]) => ['-metadata', `${key}=${value}`],
	);
	const command = [
		'-hide_banner',
		videoOutput ? '-i' : null,
		videoOutput,
		audioOutput ? '-i' : null,
		audioOutput,
		videoOutput ? '-c:v' : null,
		videoOutput ? 'copy' : null,
		audioOutput ? '-c:a' : null,
		audioOutput ? 'copy' : null,
		addFaststart ? '-movflags' : null,
		addFaststart ? 'faststart' : null,
		`-metadata`,
		`comment=Made with Remotion ${VERSION}`,
		...metadataArgs,
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
		const utf8 = data.toString('utf8');
		const parsed = parseFfmpegProgress(utf8, fps);
		if (parsed === undefined) {
			if (
				!utf8.includes(
					'Estimating duration from bitrate, this may be inaccurate',
				)
			) {
				Log.verbose({indent, logLevel}, utf8);
			}
		} else {
			Log.verbose({indent, logLevel}, `Combined ${parsed} frames`);
			onProgress(parsed);
		}
	});

	await task;
	Log.verbose({indent, logLevel}, `Muxing done in ${Date.now() - startTime}ms`);
};
