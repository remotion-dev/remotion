import type {Box} from '../../../parse-video';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface MoovBox extends BaseBox {
	type: 'moov-box';
	children: Box[];
}

export const parseMoov = (data: ArrayBuffer, offset: number): MoovBox => {
	let chunkOffset = 0;
	const view = new DataView(data);
	const size = view.getUint32(0);
	chunkOffset += 4;
	if (size !== data.byteLength) {
		throw new Error(`Expected moov size of ${data.byteLength}, got ${size}`);
	}

	const type = new TextDecoder().decode(
		data.slice(chunkOffset, chunkOffset + 4),
	);
	chunkOffset += 4;
	if (type !== 'moov') {
		throw new Error(`Expected moov type of moov, got ${type}`);
	}

	const children = parseBoxes(data.slice(chunkOffset), offset + chunkOffset);

	return {
		offset,
		boxSize: data.byteLength,
		type: 'moov-box',
		children,
	};
};
