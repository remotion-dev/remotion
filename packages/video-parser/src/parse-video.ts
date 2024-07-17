import {createReadStream} from 'fs';
import type {BaseBox} from './boxes/iso-base-media/base-type';
import type {FtypBox} from './boxes/iso-base-media/ftype';
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
			next: Uint8Array;
			size: number;
	  }
	| {
			type: 'incomplete';
	  };

const isoBaseMediaMp4Pattern = Buffer.from('ftyp');
const webmPattern = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);

const matchesPattern = (pattern: Buffer) => {
	return (data: Buffer) => {
		return pattern.every((value, index) => data[index] === value);
	};
};

export type AnySegment = MatroskaSegment | IsoBaseMediaBox;

export const parseVideo = async (
	src: string,
	bytes: number,
): Promise<AnySegment[]> => {
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

	if (matchesPattern(isoBaseMediaMp4Pattern)(data.subarray(4, 8))) {
		return parseBoxes(new Uint8Array(data), 0);
	}

	if (matchesPattern(webmPattern)(data.subarray(0, 4))) {
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

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const {done, value} = await reader.read();
		if (done) {
			break;
		}

		console.log(value?.length);
	}
};
