import type {BufferIterator} from '../../../buffer-iterator';
import type {BaseBox} from '../base-type';

export interface StcoBox extends BaseBox {
	type: 'stco-box';
	version: number;
	flags: number[];
	entryCount: number;
	entries: (number | bigint)[];
}

export const parseStco = ({
	iterator,
	offset,
	size,
	mode64Bit,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
	mode64Bit: boolean;
}): StcoBox => {
	const version = iterator.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported STSD version ${version}`);
	}

	const flags = iterator.getSlice(3);
	const entryCount = iterator.getUint32();

	const entries: (number | bigint)[] = [];
	for (let i = 0; i < entryCount; i++) {
		const bytesRemaining = size - (iterator.counter.getOffset() - offset);
		if (bytesRemaining < 4) {
			break;
		}

		entries.push(mode64Bit ? iterator.getUint64() : iterator.getUint32());
	}

	iterator.discard(size - (iterator.counter.getOffset() - offset));

	return {
		type: 'stco-box',
		boxSize: size,
		offset,
		version,
		flags: [...flags],
		entries,
		entryCount,
	};
};
