import type {AnySegment} from '../../../parse-result';
import type {ParserState} from '../../../state/parser-state';
import type {BaseBox} from '../base-type';
import {getIsoBaseMediaChildren} from '../get-children';
import type {OnlyIfMoovAtomExpected} from '../process-box';

export interface TrakBox extends BaseBox {
	type: 'trak-box';
	children: AnySegment[];
}

export const parseTrak = async ({
	size,
	offsetAtStart,
	state: options,
	onlyIfMoovAtomExpected,
}: {
	size: number;
	offsetAtStart: number;
	state: ParserState;
	onlyIfMoovAtomExpected: OnlyIfMoovAtomExpected | null;
}): Promise<TrakBox> => {
	const children = await getIsoBaseMediaChildren({
		onlyIfMoovAtomExpected,
		size: size - 8,
		iterator: options.iterator,
		logLevel: options.logLevel,
	});

	return {
		offset: offsetAtStart,
		boxSize: size,
		type: 'trak-box',
		children,
	};
};
