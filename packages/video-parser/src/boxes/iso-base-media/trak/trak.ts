import type {Box} from '../../../parse-video';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface TrakBox extends BaseBox {
	type: 'trak-box';
	children: Box[];
}

export const parseTrak = (data: ArrayBuffer, offset: number): TrakBox => {
	let chunkOffset = 0;

	const view = new DataView(data);
	const size = view.getUint32(chunkOffset);
	chunkOffset += 4;

	if (size !== data.byteLength) {
		throw new Error(
			`Data size of version 0 is ${size}, got ${data.byteLength}`,
		);
	}

	const atom = data.slice(chunkOffset, chunkOffset + 4);
	const atomString = new TextDecoder().decode(atom);
	if (atomString !== 'trak') {
		throw new Error(`Expected trak atom, got ${atomString}`);
	}

	chunkOffset += 4;

	const children = parseBoxes(data.slice(chunkOffset), chunkOffset);

	return {
		offset,
		boxSize: data.byteLength,
		type: 'trak-box',
		children,
	};
};
