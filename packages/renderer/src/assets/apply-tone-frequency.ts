import {callFf} from '../call-ffmpeg';
import type {LogLevel} from '../log-level';
import {Log} from '../logger';
import type {CancelSignal} from '../make-cancel-signal';
import {DEFAULT_SAMPLE_RATE} from '../sample-rate';

export const applyToneFrequencyUsingFfmpeg = async ({
	input,
	output,
	toneFrequency,
	indent,
	logLevel,
	binariesDirectory,
	cancelSignal,
}: {
	input: string;
	output: string;
	toneFrequency: number;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
}) => {
	const filter = `asetrate=${DEFAULT_SAMPLE_RATE}*${toneFrequency},aresample=${DEFAULT_SAMPLE_RATE},atempo=1/${toneFrequency}`;

	const args = [
		'-hide_banner',
		'-i',
		input,
		['-ac', '2'],
		'-filter:a',
		filter,
		['-c:a', 'pcm_s16le'],
		['-ar', String(DEFAULT_SAMPLE_RATE)],
		'-y',
		output,
	].flat(2);

	Log.verbose(
		{indent, logLevel},
		'Changing tone frequency using FFmpeg:',
		JSON.stringify(args.join(' ')),
		'Filter:',
		filter,
	);
	const startTimestamp = Date.now();

	const task = callFf({
		bin: 'ffmpeg',
		args,
		indent,
		logLevel,
		binariesDirectory,
		cancelSignal,
	});

	await task;

	Log.verbose(
		{indent, logLevel},
		'Changed tone frequency using FFmpeg',
		`${Date.now() - startTimestamp}ms`,
	);
};
