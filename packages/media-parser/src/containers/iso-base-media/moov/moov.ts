import type {AnySegment} from '../../../parse-result';
import type {BaseBox} from '../base-type';
import {getIsoBaseMediaChildren} from '../get-children';
import type {OnlyIfMoovAtomExpected} from '../process-box';

export interface MoovBox extends BaseBox {
	type: 'moov-box';
	children: AnySegment[];
}

export const parseMoov = async ({
	offset,
	size,
	onlyIfMoovAtomExpected,
}: {
	offset: number;
	size: number;
	onlyIfMoovAtomExpected: OnlyIfMoovAtomExpected;
}): Promise<MoovBox> => {
	const children = await getIsoBaseMediaChildren({
		onlyIfMoovAtomExpected,
		iterator: onlyIfMoovAtomExpected.state.iterator,
		logLevel: onlyIfMoovAtomExpected.state.logLevel,
		size: size - 8,
	});

	return {
		offset,
		boxSize: size,
		type: 'moov-box',
		children,
	};
};
