import type {BufferIterator} from '../../../buffer-iterator';
import type {AnySegment} from '../../../parse-result';
import type {ParserState} from '../../../state/parser-state';
import type {BaseBox} from '../base-type';
import {getIsoBaseMediaChildren} from '../get-children';

export interface MebxBox extends BaseBox {
	type: 'mebx-box';
	dataReferenceIndex: number;
	format: string;
	children: AnySegment[];
}

export const parseMebx = async ({
	iterator,
	offset,
	size,
	state,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
	state: ParserState;
}): Promise<MebxBox> => {
	// reserved, 6 bit
	iterator.discard(6);

	const dataReferenceIndex = iterator.getUint16();

	const children = await getIsoBaseMediaChildren({
		iterator,
		state,
		size: size - 8,
	});

	return {
		type: 'mebx-box',
		boxSize: size,
		offset,
		dataReferenceIndex,
		format: 'mebx',
		children,
	};
};
