import {callFf} from './call-ffmpeg';
import type {LogLevel} from './log-level';
import type {CancelSignal} from './make-cancel-signal';

export const createSilentAudio = async ({
	outName,
	indent,
	logLevel,
	binariesDirectory,
	cancelSignal,
	chunkLengthInSeconds,
	sampleRate,
}: {
	chunkLengthInSeconds: number;
	outName: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
	sampleRate: number;
}) => {
	await callFf({
		bin: 'ffmpeg',
		args: [
			'-f',
			'lavfi',
			'-i',
			`anullsrc=r=${sampleRate}`,
			'-c:a',
			'pcm_s16le',
			'-t',
			String(chunkLengthInSeconds),
			'-ar',
			String(sampleRate),
			outName,
		],
		indent,
		logLevel,
		binariesDirectory,
		cancelSignal,
	});
};
