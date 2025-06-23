import type {BufferIterator} from '../../../iterator/buffer-iterator';
import type {MediaParserLogLevel} from '../../../log';
import type {AnySegment} from '../../../parse-result';
import type {BaseBox} from '../base-type';
import {getIsoBaseMediaChildren} from '../get-children';

export interface MebxBox extends BaseBox {
	type: 'mebx-box';
	dataReferenceIndex: number;
	format: string;
	children: AnySegment[];
}

export const parseMebx = async ({
	offset,
	size,
	iterator,
	logLevel,
	contentLength,
}: {
	offset: number;
	size: number;
	iterator: BufferIterator;
	logLevel: MediaParserLogLevel;
	contentLength: number;
}): Promise<MebxBox> => {
	// reserved, 6 bit
	iterator.discard(6);

	const dataReferenceIndex = iterator.getUint16();

	const children = await getIsoBaseMediaChildren({
		iterator,
		size: size - 8,
		logLevel,
		onlyIfMoovAtomExpected: null,
		contentLength,
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
