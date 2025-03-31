import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {LogLevel} from '../../log';
import type {IsoBaseMediaBox} from './base-media-box';
import type {OnlyIfMoovAtomExpected} from './process-box';
import {processBox} from './process-box';

export const getIsoBaseMediaChildren = async ({
	size,
	iterator,
	logLevel,
	onlyIfMoovAtomExpected,
}: {
	size: number;
	iterator: BufferIterator;
	logLevel: LogLevel;
	onlyIfMoovAtomExpected: OnlyIfMoovAtomExpected | null;
}): Promise<IsoBaseMediaBox[]> => {
	const boxes: IsoBaseMediaBox[] = [];
	const initial = iterator.counter.getOffset();

	while (iterator.counter.getOffset() < size + initial) {
		const parsed = await processBox({
			iterator,
			logLevel,
			onlyIfMoovAtomExpected,
			onlyIfMdatAtomExpected: null,
		});
		if (!parsed) {
			throw new Error('Expected box');
		}

		boxes.push(parsed);
	}

	if (iterator.counter.getOffset() > size + initial) {
		throw new Error(
			`read too many bytes - size: ${size}, read: ${iterator.counter.getOffset() - initial}. initial offset: ${initial}`,
		);
	}

	return boxes;
};
