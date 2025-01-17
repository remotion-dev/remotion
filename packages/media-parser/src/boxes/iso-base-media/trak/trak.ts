import type {BufferIterator} from '../../../buffer-iterator';
import type {AnySegment} from '../../../parse-result';
import type {ParserState} from '../../../state/parser-state';
import type {BaseBox} from '../base-type';
import {getIsoBaseMediaChildren} from '../get-children';

export interface TrakBox extends BaseBox {
	type: 'trak-box';
	children: AnySegment[];
}

export const parseTrak = async ({
	data,
	size,
	offsetAtStart,
	state: options,
}: {
	data: BufferIterator;
	size: number;
	offsetAtStart: number;
	state: ParserState;
}): Promise<TrakBox> => {
	const children = await getIsoBaseMediaChildren({
		iterator: data,
		state: options,
		size: size - 8,
	});

	return {
		offset: offsetAtStart,
		boxSize: size,
		type: 'trak-box',
		children,
	};
};
