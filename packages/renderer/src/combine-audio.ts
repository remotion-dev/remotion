import {rmSync, writeFileSync} from 'fs';
import {join} from 'path';
import {VERSION} from 'remotion/version';
import {callFf} from './call-ffmpeg';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';
import type {AudioCodec} from './options/audio-codec';
import {mapAudioCodecToFfmpegAudioCodecName} from './options/audio-codec';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {DEFAULT_SAMPLE_RATE} from './sample-rate';
import {truthy} from './truthy';

export const durationOf1Frame = (1024 / DEFAULT_SAMPLE_RATE) * 1_000_000;

export const getClosestAlignedTime = (targetTime: number) => {
	const decimalFramesToTargetTime = (targetTime * 1_000_000) / durationOf1Frame;
	const nearestFrameIndexForTargetTime = Math.round(decimalFramesToTargetTime);
	return (nearestFrameIndexForTargetTime * durationOf1Frame) / 1_000_000;
};

const encodeAudio = async ({
	files,
	resolvedAudioCodec,
	audioBitrate,
	filelistDir,
	output,
	indent,
	logLevel,
	addRemotionMetadata,
	fps,
	binariesDirectory,
	cancelSignal,
	onProgress,
}: {
	files: string[];
	resolvedAudioCodec: AudioCodec;
	audioBitrate: string | null;
	filelistDir: string;
	output: string;
	indent: boolean;
	logLevel: LogLevel;
	addRemotionMetadata: boolean;
	fps: number;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
	onProgress: (frames: number) => void;
}) => {
	const fileList = files.map((p) => `file '${p}'`).join('\n');
	const fileListTxt = join(filelistDir, 'audio-files.txt');
	writeFileSync(fileListTxt, fileList);
	const startCombining = Date.now();

	const command = [
		'-hide_banner',
		'-f',
		'concat',
		'-safe',
		'0',
		'-i',
		fileListTxt,
		'-c:a',
		mapAudioCodecToFfmpegAudioCodecName(resolvedAudioCodec),
		resolvedAudioCodec === 'aac' ? '-cutoff' : null,
		resolvedAudioCodec === 'aac' ? '18000' : null,
		'-b:a',
		audioBitrate ? audioBitrate : '320k',
		'-vn',
		addRemotionMetadata ? `-metadata` : null,
		addRemotionMetadata ? `comment=Made with Remotion ${VERSION}` : null,
		'-y',
		output,
	];
	Log.verbose(
		{indent, logLevel},
		`Combining audio with re-encoding, command: ${command.join(' ')}`,
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
			const utf8 = data.toString('utf8');
			const parsed = parseFfmpegProgress(utf8, fps);
			if (parsed === undefined) {
				Log.verbose({indent, logLevel}, utf8);
			} else {
				onProgress(parsed);
				Log.verbose({indent, logLevel}, `Encoded ${parsed} audio frames`);
			}
		});
		await task;
		Log.verbose(
			{indent, logLevel},
			`Encoded audio in ${Date.now() - startCombining}ms`,
		);
		return output;
	} catch (e) {
		rmSync(fileListTxt, {recursive: true});
		throw e;
	}
};

const combineAudioSeamlessly = async ({
	files,
	filelistDir,
	indent,
	logLevel,
	output,
	chunkDurationInSeconds,
	addRemotionMetadata,
	fps,
	binariesDirectory,
	cancelSignal,
	onProgress,
}: {
	files: string[];
	filelistDir: string;
	logLevel: LogLevel;
	output: string;
	chunkDurationInSeconds: number;
	addRemotionMetadata: boolean;
	fps: number;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
	indent: boolean;
	onProgress: (frames: number) => void;
}) => {
	const startConcatenating = Date.now();
	const fileList = files
		.map((p, i) => {
			const isLast = i === files.length - 1;
			const targetStart = i * chunkDurationInSeconds;
			const endStart = (i + 1) * chunkDurationInSeconds;

			const startTime = getClosestAlignedTime(targetStart) * 1_000_000;
			const endTime = getClosestAlignedTime(endStart) * 1_000_000;

			const realDuration = endTime - startTime;

			let inpoint = 0;
			if (i > 0) {
				// Although we only asked for two frames of padding, ffmpeg will add an
				// additional 2 frames of silence at the start of the segment. When we slice out
				// our real data with inpoint and outpoint, we'll want remove both the silence
				// and the extra frames we asked for.
				inpoint = durationOf1Frame * 4;
			}

			// inpoint is inclusive and outpoint is exclusive. To avoid overlap, we subtract
			// the duration of one frame from the outpoint.
			// we don't have to subtract a frame if this is the last segment.
			const outpoint: number =
				(i === 0 ? durationOf1Frame * 2 : inpoint) +
				realDuration -
				(isLast ? 0 : durationOf1Frame);

			return [`file '${p}'`, `inpoint ${inpoint}us`, `outpoint ${outpoint}us`]
				.filter(truthy)
				.join('\n');
		})
		.join('\n');

	const fileListTxt = join(filelistDir, 'audio-files.txt');

	writeFileSync(fileListTxt, fileList);

	const command = [
		'-hide_banner',
		'-f',
		'concat',
		'-safe',
		'0',
		'-i',
		fileListTxt,
		'-c:a',
		'copy',
		'-vn',
		addRemotionMetadata ? `-metadata` : null,
		addRemotionMetadata ? `comment=Made with Remotion ${VERSION}` : null,
		'-y',
		output,
	];
	Log.verbose(
		{indent, logLevel},
		`Combining AAC audio seamlessly, command: ${command.join(' ')}`,
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
			const utf8 = data.toString('utf8');
			const parsed = parseFfmpegProgress(utf8, fps);
			if (parsed !== undefined) {
				onProgress(parsed);
				Log.verbose({indent, logLevel}, `Encoded ${parsed} audio frames`);
			}
		});
		await task;
		Log.verbose(
			{indent, logLevel},
			`Combined audio seamlessly in ${Date.now() - startConcatenating}ms`,
		);
		return output;
	} catch (e) {
		rmSync(fileListTxt, {recursive: true});
		Log.error({indent, logLevel}, e);
		throw e;
	}
};

export const createCombinedAudio = ({
	seamless,
	filelistDir,
	files,
	indent,
	logLevel,
	audioBitrate,
	resolvedAudioCodec,
	output,
	chunkDurationInSeconds,
	addRemotionMetadata,
	binariesDirectory,
	fps,
	cancelSignal,
	onProgress,
}: {
	seamless: boolean;
	filelistDir: string;
	files: string[];
	indent: boolean;
	logLevel: LogLevel;
	audioBitrate: string | null;
	resolvedAudioCodec: AudioCodec;
	output: string;
	chunkDurationInSeconds: number;
	addRemotionMetadata: boolean;
	binariesDirectory: string | null;
	fps: number;
	cancelSignal: CancelSignal | undefined;
	onProgress: (frames: number) => void;
}): Promise<string> => {
	if (seamless) {
		return combineAudioSeamlessly({
			filelistDir,
			files,
			indent,
			logLevel,
			output,
			chunkDurationInSeconds,
			addRemotionMetadata,
			binariesDirectory,
			fps,
			cancelSignal,
			onProgress,
		});
	}

	return encodeAudio({
		filelistDir,
		files,
		resolvedAudioCodec,
		audioBitrate,
		output,
		indent,
		logLevel,
		addRemotionMetadata,
		binariesDirectory,
		fps,
		cancelSignal,
		onProgress,
	});
};
