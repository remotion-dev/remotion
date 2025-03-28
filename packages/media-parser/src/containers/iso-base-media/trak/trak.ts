import type {BufferIterator} from '../../../iterator/buffer-iterator';
import type {LogLevel} from '../../../log';
import type {AnySegment} from '../../../parse-result';
import type {BaseBox} from '../base-type';
import {getIsoBaseMediaChildren} from '../get-children';

export interface TrakBox extends BaseBox {
	type: 'trak-box';
	children: AnySegment[];
}

export const parseTrak = async ({
	size,
	offsetAtStart,
	iterator,
	logLevel,
}: {
	size: number;
	offsetAtStart: number;
	iterator: BufferIterator;
	logLevel: LogLevel;
}): Promise<TrakBox> => {
	const children = await getIsoBaseMediaChildren({
		onlyIfMoovAtomExpected: null,
		size: size - 8,
		iterator,
		logLevel,
	});

	return {
		offset: offsetAtStart,
		boxSize: size,
		type: 'trak-box',
		children,
	};
};
