import fs, {writeSync} from 'node:fs';
import path from 'node:path';
import type {InlineAudioAsset} from 'remotion/no-react';
import {deleteDirectory} from '../delete-directory';
import type {LogLevel} from '../log-level';
import type {CancelSignal} from '../make-cancel-signal';
import {DEFAULT_SAMPLE_RATE} from '../sample-rate';
import {applyToneFrequencyUsingFfmpeg} from './apply-tone-frequency';
import {makeAndReturn} from './download-map';

const numberTo32BiIntLittleEndian = (num: number) => {
	return new Uint8Array([
		num & 0xff,
		(num >> 8) & 0xff,
		(num >> 16) & 0xff,
		(num >> 24) & 0xff,
	]);
};

const numberTo16BitLittleEndian = (num: number) => {
	return new Uint8Array([num & 0xff, (num >> 8) & 0xff]);
};

/**
 * When multiplying seconds by sample rate, floating point errors can cause
 * results like 244799.99999999997 instead of 244800 (5.1 * 48000).
 * This snaps to the nearest integer when within tolerance,
 * preventing Math.floor/Math.ceil from rounding incorrectly.
 */
const correctFloatingPointError = (value: number): number => {
	const rounded = Math.round(value);
	if (Math.abs(value - rounded) < 0.00001) {
		return rounded;
	}

	return value;
};

const BIT_DEPTH = 16;
const BYTES_PER_SAMPLE = BIT_DEPTH / 8;
const NUMBER_OF_CHANNELS = 2;

export const makeInlineAudioMixing = (dir: string) => {
	const folderToAdd = makeAndReturn(dir, 'remotion-inline-audio-mixing');
	// asset id -> file descriptor
	const openFiles: Record<string, number> = {};
	const writtenHeaders: Record<string, boolean> = {};
	const toneFrequencies: Record<string, number> = {};

	const cleanup = () => {
		for (const fd of Object.values(openFiles)) {
			try {
				fs.closeSync(fd);
			} catch {}
		}

		deleteDirectory(folderToAdd);
	};

	const getListOfAssets = () => {
		return Object.keys(openFiles);
	};

	const getFilePath = (asset: InlineAudioAsset) => {
		return path.join(folderToAdd, `${asset.id}.wav`);
	};

	const ensureAsset = ({
		asset,
		fps,
		totalNumberOfFrames,
		trimLeftOffset,
		trimRightOffset,
	}: {
		asset: InlineAudioAsset;
		fps: number;
		totalNumberOfFrames: number;
		trimLeftOffset: number;
		trimRightOffset: number;
	}) => {
		const filePath = getFilePath(asset);
		if (!openFiles[filePath]) {
			openFiles[filePath] = fs.openSync(filePath, 'w');
		}

		if (writtenHeaders[filePath]) {
			return;
		}

		writtenHeaders[filePath] = true;

		const expectedDataSize = Math.round(
			(totalNumberOfFrames / fps - trimLeftOffset + trimRightOffset) *
				NUMBER_OF_CHANNELS *
				DEFAULT_SAMPLE_RATE *
				BYTES_PER_SAMPLE,
		);

		const expectedSize = 40 + expectedDataSize;

		const fd = openFiles[filePath];
		writeSync(fd, new Uint8Array([0x52, 0x49, 0x46, 0x46]), 0, 4, 0); // "RIFF"
		writeSync(
			fd,
			new Uint8Array(numberTo32BiIntLittleEndian(expectedSize)),
			0,
			4,
			4,
		); // Remaining size
		writeSync(fd, new Uint8Array([0x57, 0x41, 0x56, 0x45]), 0, 4, 8); // "WAVE"
		writeSync(fd, new Uint8Array([0x66, 0x6d, 0x74, 0x20]), 0, 4, 12); // "fmt "
		writeSync(fd, new Uint8Array([BIT_DEPTH, 0x00, 0x00, 0x00]), 0, 4, 16); // fmt chunk size = 16
		writeSync(fd, new Uint8Array([0x01, 0x00]), 0, 2, 20); // Audio format (PCM) = 1, set 3 if float32 would be true
		writeSync(fd, new Uint8Array([NUMBER_OF_CHANNELS, 0x00]), 0, 2, 22); // Number of channels
		writeSync(
			fd,
			new Uint8Array(numberTo32BiIntLittleEndian(DEFAULT_SAMPLE_RATE)),
			0,
			4,
			24,
		); // Sample rate
		writeSync(
			fd,
			new Uint8Array(
				numberTo32BiIntLittleEndian(
					DEFAULT_SAMPLE_RATE * NUMBER_OF_CHANNELS * BYTES_PER_SAMPLE,
				),
			),
			0,
			4,
			28,
		); // Byte rate
		writeSync(
			fd,
			new Uint8Array(
				numberTo16BitLittleEndian(NUMBER_OF_CHANNELS * BYTES_PER_SAMPLE),
			),
			0,
			2,
			32,
		); // Block align
		writeSync(fd, numberTo16BitLittleEndian(BIT_DEPTH), 0, 2, 34); // Bits per sample
		writeSync(fd, new Uint8Array([0x64, 0x61, 0x74, 0x61]), 0, 4, 36); // "data"
		writeSync(
			fd,
			new Uint8Array(numberTo32BiIntLittleEndian(expectedDataSize)),
			0,
			4,
			40,
		); // Remaining size
	};

	const finish = async ({
		binariesDirectory,
		indent,
		logLevel,
		cancelSignal,
	}: {
		indent: boolean;
		logLevel: LogLevel;
		binariesDirectory: string | null;
		cancelSignal: CancelSignal | undefined;
	}) => {
		for (const fd of Object.keys(openFiles)) {
			const frequency = toneFrequencies[fd];
			if (frequency !== 1) {
				const tmpFile = fd.replace(/.wav$/, '-tmp.wav');
				await applyToneFrequencyUsingFfmpeg({
					input: fd,
					output: tmpFile,
					toneFrequency: frequency,
					indent,
					logLevel,
					binariesDirectory,
					cancelSignal,
				});
				fs.renameSync(tmpFile, fd);
			}
		}
	};

	const addAsset = ({
		asset,
		fps,
		totalNumberOfFrames,
		firstFrame,
		trimLeftOffset,
		trimRightOffset,
	}: {
		asset: InlineAudioAsset;
		fps: number;
		totalNumberOfFrames: number;
		firstFrame: number;
		trimLeftOffset: number;
		trimRightOffset: number;
	}) => {
		ensureAsset({
			asset,
			fps,
			totalNumberOfFrames,
			trimLeftOffset,
			trimRightOffset,
		});

		const filePath = getFilePath(asset);

		if (
			toneFrequencies[filePath] !== undefined &&
			toneFrequencies[filePath] !== asset.toneFrequency
		) {
			throw new Error(
				`toneFrequency must be the same across the entire audio, got ${asset.toneFrequency}, but before it was ${toneFrequencies[filePath]}`,
			);
		}

		const fileDescriptor = openFiles[filePath];
		toneFrequencies[filePath] = asset.toneFrequency;

		let arr = new Int16Array(asset.audio);
		const isFirst = asset.frame === firstFrame;
		const isLast = asset.frame === totalNumberOfFrames + firstFrame - 1;
		const samplesToShaveFromStart = trimLeftOffset * DEFAULT_SAMPLE_RATE;
		const samplesToShaveFromEnd = trimRightOffset * DEFAULT_SAMPLE_RATE;

		// Higher tolerance is needed for floating point videos
		// Rendering https://github.com/remotion-dev/remotion/pull/5920 in native frame rate
		// could hit this case

		if (isFirst) {
			arr = arr.slice(
				Math.floor(correctFloatingPointError(samplesToShaveFromStart)) *
					NUMBER_OF_CHANNELS,
			);
		}

		if (isLast) {
			arr = arr.slice(
				0,
				arr.length +
					Math.ceil(correctFloatingPointError(samplesToShaveFromEnd)) *
						NUMBER_OF_CHANNELS,
			);
		}

		const positionInSeconds =
			(asset.frame - firstFrame) / fps - (isFirst ? 0 : trimLeftOffset);

		// Always rounding down to ensure there are no gaps when the samples don't align
		// In @remotion/media, we also round down the sample start timestamp and round up the end timestamp
		// This might lead to overlapping, hopefully aligning perfectly!
		// Test case: https://github.com/remotion-dev/remotion/issues/5758
		const position =
			Math.floor(
				correctFloatingPointError(positionInSeconds * DEFAULT_SAMPLE_RATE),
			) *
			NUMBER_OF_CHANNELS *
			BYTES_PER_SAMPLE;

		writeSync(
			// fs
			fileDescriptor,
			// data
			arr,
			// offset of data
			0,
			// length
			arr.byteLength,
			// position
			44 + position,
		);
	};

	return {
		cleanup,
		addAsset,
		getListOfAssets,
		finish,
	};
};

export type InlineAudioMixing = ReturnType<typeof makeInlineAudioMixing>;
