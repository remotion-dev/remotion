import {createReadStream} from 'fs';
import type {BaseBox} from './boxes/iso-base-media/base-type';
import type {FtypBox} from './boxes/iso-base-media/ftyp';
import type {MoovBox} from './boxes/iso-base-media/moov/moov';
import type {MvhdBox} from './boxes/iso-base-media/mvhd';
import {parseBoxes} from './boxes/iso-base-media/process-box';
import type {KeysBox} from './boxes/iso-base-media/stsd/keys';
import type {MebxBox} from './boxes/iso-base-media/stsd/mebx';
import type {StsdBox} from './boxes/iso-base-media/stsd/stsd';
import type {TkhdBox} from './boxes/iso-base-media/tkhd';
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import {parseWebm} from './boxes/webm/parse-webm-header';
import type {MatroskaSegment} from './boxes/webm/segments';
import type {BufferIterator} from './read-and-increment-offset';
import {getArrayBufferIterator} from './read-and-increment-offset';

interface RegularBox extends BaseBox {
	boxType: string;
	boxSize: number;
	children: IsoBaseMediaBox[];
	offset: number;
	type: 'regular-box';
}

export type IsoBaseMediaBox =
	| RegularBox
	| FtypBox
	| MvhdBox
	| TkhdBox
	| StsdBox
	| MebxBox
	| KeysBox
	| MoovBox
	| TrakBox;

export type BoxAndNext =
	| {
			type: 'complete';
			box: IsoBaseMediaBox;
			size: number;
	  }
	| {
			type: 'incomplete';
	  };

export type AnySegment = MatroskaSegment | IsoBaseMediaBox;

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

export const parseVideo = (iterator: BufferIterator): AnySegment[] => {
	if (iterator.isIsoBaseMedia()) {
		return parseBoxes({
			iterator,
			maxBytes: Infinity,
			allowIncompleteBoxes: true,
		});
	}

	if (iterator.isWebm()) {
		return [parseWebm(iterator)];
	}

	return [];
};

export const streamVideo = async (url: string) => {
	const res = await fetch(url);
	if (!res.body) {
		throw new Error('No body');
	}

	const reader = res.body.getReader();

	const iterator = getArrayBufferIterator(new Uint8Array([]));
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const result = await reader.read();
		if (result.done) {
			break;
		}

		iterator.addData(result.value);
	}
};
