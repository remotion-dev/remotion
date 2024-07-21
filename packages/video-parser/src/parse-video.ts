import {createReadStream} from 'fs';
import {parseBoxes} from './boxes/iso-base-media/process-box';
import {parseWebm} from './boxes/webm/parse-webm-header';
import type {BufferIterator} from './buffer-iterator';
import {getArrayBufferIterator} from './buffer-iterator';
import type {IsoBaseMediaBox, ParseResult} from './parse-result';

export type BoxAndNext =
	| {
			type: 'complete';
			box: IsoBaseMediaBox;
			size: number;
	  }
	| {
			type: 'incomplete';
	  };

export const loadVideo = async (
	src: string,
	bytes: number,
): Promise<BufferIterator> => {
	const stream = createReadStream(
		src,
		Number.isFinite(bytes) ? {end: bytes - 1} : {},
	);
	const data = await new Promise<Buffer>((resolve, reject) => {
		const buffers: Buffer[] = [];

		stream.on('data', (chunk) => {
			buffers.push(chunk as Buffer);
		});

		stream.on('end', () => {
			resolve(Buffer.concat(buffers));
		});

		stream.on('error', (err) => {
			reject(err);
		});
	});

	const iterator = getArrayBufferIterator(new Uint8Array(data));
	return iterator;
};

export const parseVideo = (iterator: BufferIterator): ParseResult => {
	if (iterator.bytesRemaining() === 0) {
		return {
			status: 'incomplete',
			segments: [],
			continueParsing: () => {
				return parseVideo(iterator);
			},
		};
	}

	if (iterator.isIsoBaseMedia()) {
		return parseBoxes({
			iterator,
			maxBytes: Infinity,
			allowIncompleteBoxes: true,
			initialBoxes: [],
		});
	}

	if (iterator.isWebm()) {
		return parseWebm(iterator);
	}

	throw new Error('Unknown video format');
};

export const streamVideo = async (url: string) => {
	const res = await fetch(url);
	if (!res.body) {
		throw new Error('No body');
	}

	const reader = res.body.getReader();

	const iterator = getArrayBufferIterator(new Uint8Array([]));
	let parseResult = parseVideo(iterator);
	while (parseResult.status === 'incomplete') {
		const result = await reader.read();
		if (result.done) {
			break;
		}

		iterator.addData(result.value);
		parseResult = parseResult.continueParsing();
	}

	return parseResult.segments;
};
