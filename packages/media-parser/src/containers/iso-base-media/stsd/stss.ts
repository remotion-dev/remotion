import type {BufferIterator} from '../../../buffer-iterator';
import type {BaseBox} from '../base-type';

export interface StssBox extends BaseBox {
	type: 'stss-box';
	version: number;
	flags: number[];
	sampleNumber: number[];
}

export const parseStss = ({
	iterator,
	offset,
	boxSize,
}: {
	iterator: BufferIterator;
	offset: number;
	boxSize: number;
}): StssBox => {
	const version = iterator.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported STSS version ${version}`);
	}

	const flags = iterator.getSlice(3);
	const sampleCount = iterator.getUint32();

	const sampleNumber: number[] = [];
	for (let i = 0; i < sampleCount; i++) {
		sampleNumber.push(iterator.getUint32());
	}

	const bytesRemainingInBox = boxSize - (iterator.counter.getOffset() - offset);

	if (bytesRemainingInBox > 0) {
		throw new Error(`Unexpected bytes remaining in box stss`);
	}

	return {
		type: 'stss-box',
		version,
		flags: [...flags],
		sampleNumber,
		boxSize,
		offset,
	};
};
