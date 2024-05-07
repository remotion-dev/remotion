import type {Box} from '../../../parse-video';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface MebxBox extends BaseBox {
	type: 'mebx-box';
	dataReferenceIndex: number;
	format: string;
	children: Box[];
}

export const parseMebx = (data: ArrayBuffer, offset: number): MebxBox => {
	let chunkOffset = 0;

	const view = new DataView(data);
	const size = view.getUint32(chunkOffset);
	if (size !== data.byteLength) {
		throw new Error(`Expected mebx size of ${data.byteLength}, got ${size}`);
	}

	chunkOffset += 4;
	const type = new TextDecoder().decode(
		data.slice(chunkOffset, chunkOffset + 4),
	);
	if (type !== 'mebx') {
		throw new Error(`Expected mebx type of mebx, got ${type}`);
	}

	chunkOffset += 4;

	// reserved, 6 bit
	chunkOffset += 6;

	const dataReferenceIndex = view.getUint16(chunkOffset);
	chunkOffset += 2;

	const rest = data.slice(chunkOffset);

	const children = parseBoxes(rest, offset + chunkOffset);

	return {
		type: 'mebx-box',
		boxSize: data.byteLength,
		offset,
		dataReferenceIndex,
		format: 'mebx',
		children,
	};
};
