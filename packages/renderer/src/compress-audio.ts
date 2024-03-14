import {cpSync} from 'node:fs';
import {callFf} from './call-ffmpeg';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';
import type {AudioCodec} from './options/audio-codec';
import {mapAudioCodecToFfmpegAudioCodecName} from './options/audio-codec';
import {parseFfmpegProgress} from './parse-ffmpeg-progress';
import {truthy} from './truthy';

export const compressAudio = async ({
	audioCodec,
	outName,
	binariesDirectory,
	indent,
	logLevel,
	audioBitrate,
	cancelSignal,
	inName,
	onProgress,
	chunkLengthInSeconds,
	fps,
}: {
	audioCodec: AudioCodec;
	outName: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	audioBitrate: string | null;
	cancelSignal: CancelSignal | undefined;
	inName: string;
	onProgress: (progress: number) => void;
	chunkLengthInSeconds: number;
	fps: number;
}) => {
	if (audioCodec === 'pcm-16') {
		cpSync(inName, outName);
		return onProgress(1);
	}

	const args = [
		['-hide_banner'],
		['-i', inName],
		['-c:a', mapAudioCodecToFfmpegAudioCodecName(audioCodec)],
		audioCodec === 'aac' ? ['-f', 'adts'] : null,
		audioCodec ? ['-b:a', audioBitrate || '320k'] : null,
		audioCodec === 'aac' ? '-cutoff' : null,
		audioCodec === 'aac' ? '18000' : null,
		['-y', outName],
	]
		.filter(truthy)
		.flat(2);

	const task = callFf({
		bin: 'ffmpeg',
		args,
		indent,
		logLevel,
		binariesDirectory,
		cancelSignal,
	});

	task.stderr?.on('data', (data: Buffer) => {
		const utf8 = data.toString('utf8');
		const parsed = parseFfmpegProgress(utf8, fps);
		if (parsed !== undefined) {
			onProgress(parsed / (chunkLengthInSeconds * fps));
		}
	});

	await task;
};
