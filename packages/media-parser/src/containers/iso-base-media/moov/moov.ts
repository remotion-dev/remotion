import type {AnySegment} from '../../../parse-result';
import type {ParserState} from '../../../state/parser-state';
import type {BaseBox} from '../base-type';
import {getIsoBaseMediaChildren} from '../get-children';

export interface MoovBox extends BaseBox {
	type: 'moov-box';
	children: AnySegment[];
}

export const parseMoov = async ({
	offset,
	size,
	state,
}: {
	offset: number;
	size: number;
	state: ParserState;
}): Promise<MoovBox> => {
	const children = await getIsoBaseMediaChildren({
		state,
		size: size - 8,
	});

	return {
		offset,
		boxSize: size,
		type: 'moov-box',
		children,
	};
};
