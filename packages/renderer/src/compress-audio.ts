import {callFf} from './call-ffmpeg';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';
import type {AudioCodec} from './options/audio-codec';
import {mapAudioCodecToFfmpegAudioCodecName} from './options/audio-codec';
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
}: {
	audioCodec: AudioCodec;
	outName: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	audioBitrate: string | null;
	cancelSignal: CancelSignal | undefined;
	inName: string;
}) => {
	const args = [
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

	await callFf({
		bin: 'ffmpeg',
		args,
		indent,
		logLevel,
		binariesDirectory,
		cancelSignal,
	});
};
