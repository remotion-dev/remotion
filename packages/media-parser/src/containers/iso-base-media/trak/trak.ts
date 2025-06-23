import type {BufferIterator} from '../../../iterator/buffer-iterator';
import type {MediaParserLogLevel} from '../../../log';
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
	contentLength,
}: {
	size: number;
	offsetAtStart: number;
	iterator: BufferIterator;
	logLevel: MediaParserLogLevel;
	contentLength: number;
}): Promise<TrakBox> => {
	const children = await getIsoBaseMediaChildren({
		onlyIfMoovAtomExpected: null,
		size: size - 8,
		iterator,
		logLevel,
		contentLength,
	});

	return {
		offset: offsetAtStart,
		boxSize: size,
		type: 'trak-box',
		children,
	};
};
