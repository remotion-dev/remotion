import {rmSync, writeFileSync} from 'fs';
import {join} from 'path';
import {VERSION} from 'remotion/version';
import {callFf} from './call-ffmpeg';
import type {Codec} from './codec';
import {convertNumberOfGifLoopsToFfmpegSyntax} from './convert-number-of-gif-loops-to-ffmpeg';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
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
	cancelSignal,
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
	cancelSignal: CancelSignal | undefined;
}) => {
	const fileList = files.map((p) => `file '${p}'`).join('\n');

	const fileListTxt = join(filelistDir, 'video-files.txt');
	writeFileSync(fileListTxt, fileList);

	const encoder = codec === 'gif' ? 'gif' : 'copy';

	const command = [
		'-hide_banner',
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
		codec === 'gif' ? '-filter_complex' : null,
		codec === 'gif' ? 'split[v],palettegen,[v]paletteuse' : null,
		'-an',
		'-c:v',
		encoder,
		codec === 'h265' ? '-tag:v' : null,
		codec === 'h265' ? 'hvc1' : null,
		addRemotionMetadata ? `-metadata` : null,
		addRemotionMetadata ? `comment=Made with Remotion ${VERSION}` : null,
		'-y',
		output,
	].filter(truthy);

	const doesReencode = encoder !== 'copy';

	const startTime = Date.now();
	Log.verbose(
		{indent, logLevel},
		`Combining video ${
			doesReencode ? 'with reencoding' : 'without reencoding'
		}, command: ${command.join(' ')}`,
	);

	try {
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
			if (parsed === undefined) {
				Log.verbose({indent, logLevel}, data.toString('utf8'));
			} else {
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
	} catch (e) {
		rmSync(fileListTxt, {recursive: true});
		throw e;
	}
};
