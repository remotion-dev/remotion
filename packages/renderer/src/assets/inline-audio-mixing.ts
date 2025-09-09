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

	const cleanup = () => {
		for (const fd of Object.values(openFiles)) {
			fs.closeSync(fd);
		}

		deleteDirectory(folderToAdd);
	};

	const ensureAsset = (
		asset: InlineAudioAsset,
		fps: number,
		totalNumberOfFrames: number,
	) => {
		const filePath = path.join(folderToAdd, `${asset.id}.wav`);
		if (!openFiles[asset.id]) {
			openFiles[asset.id] = fs.openSync(filePath, 'w');
		}

		const expectedDataSize = Math.round(
			(totalNumberOfFrames / fps) *
				asset.numberOfChannels *
				DEFAULT_SAMPLE_RATE *
				BYTES_PER_SAMPLE,
		);
		console.log({totalNumberOfFrames, fps});
		const expectedSize = 40 + expectedDataSize;

		const {numberOfChannels} = asset;

		const fd = openFiles[asset.id];
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

	const addAsset = (
		asset: InlineAudioAsset,
		fps: number,
		totalNumberOfFrames: number,
	) => {
		ensureAsset(asset, fps, totalNumberOfFrames);
		const fileDescriptor = openFiles[asset.id];

		const arr = new Int16Array(asset.audio);
		const position = Math.round(
			(asset.frame / fps) *
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

		console.log(
			'wrote',
			arr.byteLength,
			'bytes to',
			path.join(folderToAdd, `${asset.id}.wav`),
			position,
			arr.slice(0, 5),
			// last 5 bytes
			arr.slice(-5),
		);
	};

	return {
		cleanup,
		addAsset,
		folder: folderToAdd,
	};
};

export type InlineAudioMixing = ReturnType<typeof makeInlineAudioMixing>;
