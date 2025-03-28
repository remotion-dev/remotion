import type {BufferIterator} from '../../../iterator/buffer-iterator';
import type {LogLevel} from '../../../log';
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
	iterator,
	logLevel,
}: {
	offset: number;
	size: number;
	onlyIfMoovAtomExpected: OnlyIfMoovAtomExpected;
	iterator: BufferIterator;
	logLevel: LogLevel;
}): Promise<MoovBox> => {
	const children = await getIsoBaseMediaChildren({
		onlyIfMoovAtomExpected,
		size: size - 8,
		iterator,
		logLevel,
	});

	return {
		offset,
		boxSize: size,
		type: 'moov-box',
		children,
	};
};
