import type {AnySegment} from '../../../parse-result';
import type {ParserState} from '../../../state/parser-state';
import type {BaseBox} from '../base-type';
import {getIsoBaseMediaChildren} from '../get-children';

export interface TrakBox extends BaseBox {
	type: 'trak-box';
	children: AnySegment[];
}

export const parseTrak = async ({
	size,
	offsetAtStart,
	state: options,
}: {
	size: number;
	offsetAtStart: number;
	state: ParserState;
}): Promise<TrakBox> => {
	const children = await getIsoBaseMediaChildren({
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
