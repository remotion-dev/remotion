import {randomUUID} from 'node:crypto';
import {promises} from 'node:fs';
import path from 'node:path';
import {callFf} from './call-ffmpeg';
import type {FastStartMuxer} from './get-fast-start-muxer';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import type {CancelSignal} from './make-cancel-signal';

export const finalizeFastStart = async ({
	input,
	output,
	muxer,
	force,
	indent,
	logLevel,
	binariesDirectory,
	cancelSignal,
}: {
	input: string;
	output: string;
	muxer: FastStartMuxer;
	force: boolean;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | null;
}) => {
	let fastStartFile: string | null = null;

	for (let attempt = 0; attempt < 3; attempt++) {
		const candidate = path.join(
			path.dirname(output),
			`${path.basename(output)}.${randomUUID()}.remotion-in-progress`,
		);
		const task = callFf({
			bin: 'ffmpeg',
			args: [
				'-hide_banner',
				'-i',
				input,
				'-c',
				'copy',
				'-movflags',
				'faststart',
				'-y',
				'-f',
				muxer,
				candidate,
			],
			indent,
			logLevel,
			binariesDirectory,
			cancelSignal: cancelSignal ?? undefined,
		});
		let stderr = '';
		task.stderr?.on('data', (data: Buffer) => {
			stderr += data.toString();
		});

		try {
			await task;
			fastStartFile = candidate;
			break;
		} catch (error) {
			await promises.rm(candidate, {force: true}).catch(() => undefined);
			const isReopenFailure =
				stderr.includes('Unable to re-open') &&
				stderr.includes('output file for shifting data');
			if (!isReopenFailure || attempt === 2) {
				throw error;
			}

			Log.verbose(
				{indent, logLevel, tag: 'stitchFramesToVideo()'},
				`Retrying Fast Start finalization (attempt ${attempt + 2} of 3)`,
			);
		}
	}

	if (fastStartFile === null) {
		throw new Error('Fast Start finalization did not produce an output file');
	}

	if (force) {
		await promises.rename(fastStartFile, output);
		return;
	}

	try {
		await promises.link(fastStartFile, output);
	} finally {
		await promises.rm(fastStartFile, {force: true});
	}
};
