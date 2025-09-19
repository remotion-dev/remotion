import fs, {writeSync} from 'node:fs';
import path from 'node:path';
import type {InlineAudioAsset} from 'remotion/no-react';
import {deleteDirectory} from '../delete-directory';
import {DEFAULT_SAMPLE_RATE} from '../sample-rate';
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

const BIT_DEPTH = 16;
const BYTES_PER_SAMPLE = BIT_DEPTH / 8;

export const makeInlineAudioMixing = (dir: string) => {
	const folderToAdd = makeAndReturn(dir, 'remotion-inline-audio-mixing');
	// asset id -> file descriptor
	const openFiles: Record<string, number> = {};
	const writtenHeaders: Record<string, boolean> = {};

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
				asset.numberOfChannels *
				DEFAULT_SAMPLE_RATE *
				BYTES_PER_SAMPLE,
		);

		const expectedSize = 40 + expectedDataSize;

		const {numberOfChannels} = asset;

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
		writeSync(fd, new Uint8Array([numberOfChannels, 0x00]), 0, 2, 22); // Number of channels
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
					DEFAULT_SAMPLE_RATE * numberOfChannels * BYTES_PER_SAMPLE,
				),
			),
			0,
			4,
			28,
		); // Byte rate
		writeSync(
			fd,
			new Uint8Array(
				numberTo16BitLittleEndian(numberOfChannels * BYTES_PER_SAMPLE),
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
		const fileDescriptor = openFiles[filePath];

		let arr = new Int16Array(asset.audio);
		const isFirst = asset.frame === firstFrame;
		const isLast = asset.frame === totalNumberOfFrames + firstFrame - 1;
		const samplesToShaveFromStart = trimLeftOffset * DEFAULT_SAMPLE_RATE;
		const samplesToShaveFromEnd = trimRightOffset * DEFAULT_SAMPLE_RATE;
		if (
			Math.abs(Math.round(samplesToShaveFromEnd) - samplesToShaveFromEnd) >
			0.00000001
		) {
			throw new Error(
				'samplesToShaveFromEnd should be approximately an integer',
			);
		}

		if (
			Math.abs(Math.round(samplesToShaveFromStart) - samplesToShaveFromStart) >
			0.00000001
		) {
			throw new Error(
				'samplesToShaveFromStart should be approximately an integer',
			);
		}

		if (isFirst) {
			arr = arr.slice(
				Math.round(samplesToShaveFromStart) * asset.numberOfChannels,
			);
		}

		if (isLast) {
			arr = arr.slice(
				0,
				arr.length + Math.round(samplesToShaveFromEnd) * asset.numberOfChannels,
			);
		}

		const positionInSeconds =
			(asset.frame - firstFrame) / fps - (isFirst ? 0 : trimLeftOffset);

		const position = Math.round(
			positionInSeconds *
				asset.numberOfChannels *
				DEFAULT_SAMPLE_RATE *
				BYTES_PER_SAMPLE,
		);

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
	};
};

export type InlineAudioMixing = ReturnType<typeof makeInlineAudioMixing>;
