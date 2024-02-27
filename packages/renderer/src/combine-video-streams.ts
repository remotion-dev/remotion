import {rmSync, writeFileSync} from 'fs';
import {join} from 'path';
import {VERSION} from 'remotion/version';
import {callFf} from './call-ffmpeg';
import type {Codec} from './codec';
import {convertNumberOfGifLoopsToFfmpegSyntax} from './convert-number-of-gif-loops-to-ffmpeg';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {truthy} from './truthy';

export const combineVideoStreams = async ({
	fps,
	codec,
	filelistDir,
	numberOfGifLoops,
	output,
	indent,
	logLevel,
	onProgress,
	files,
	addRemotionMetadata,
	binariesDirectory,
}: {
	fps: number;
	codec: Codec;
	filelistDir: string;
	numberOfGifLoops: number | null;
	output: string;
	indent: boolean;
	logLevel: LogLevel;
	onProgress: (p: number) => void;
	files: string[];
	addRemotionMetadata: boolean;
	binariesDirectory: string | null;
}) => {
	const fileList = files.map((p) => `file '${p}'`).join('\n');

	const fileListTxt = join(filelistDir, 'video-files.txt');
	writeFileSync(fileListTxt, fileList);

	const command = [
		'-r',
		String(fps),
		'-f',
		'concat',
		'-safe',
		'0',
		'-i',
		fileListTxt,
		numberOfGifLoops === null ? null : '-loop',
		numberOfGifLoops === null
			? null
			: convertNumberOfGifLoopsToFfmpegSyntax(numberOfGifLoops),
		'-an',
		'-c:v',
		codec === 'gif' ? 'gif' : 'copy',
		codec === 'h264' ? '-movflags' : null,
		codec === 'h264' ? 'faststart' : null,
		addRemotionMetadata ? `-metadata` : null,
		addRemotionMetadata ? `comment=Made with Remotion ${VERSION}` : null,
		'-y',
		output,
	].filter(truthy);

	try {
		const task = callFf({
			args: command,
			bin: 'ffmpeg',
			indent,
			logLevel,
			binariesDirectory,
		});
		task.stderr?.on('data', (data: Buffer) => {
			const parsed = parseFfmpegProgress(data.toString('utf8'), fps);
			if (parsed === undefined) {
				Log.verbose({indent, logLevel}, data.toString('utf8'));
			} else {
				Log.verbose({indent, logLevel}, `Encoded ${parsed} video frames`);
				onProgress(parsed);
			}
		});
		await task;
		return output;
	} catch (e) {
		rmSync(filelistDir, {recursive: true});
		throw e;
	}
};
