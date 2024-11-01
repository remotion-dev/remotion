import type {BufferIterator} from '../../../buffer-iterator';
import type {BaseBox} from '../base-type';

type Discriminated =
	| {
			countType: 'fixed';
			sampleSize: number;
	  }
	| {
			countType: 'variable';
			entries: number[];
	  };

export type StszBox = BaseBox & {
	type: 'stsz-box';
	version: number;
	flags: number[];
	sampleCount: number;
} & Discriminated;

export const parseStsz = ({
	iterator,
	offset,
	size,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
}): StszBox => {
	const version = iterator.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported STSD version ${version}`);
	}

	const flags = iterator.getSlice(3);

	const sampleSize = iterator.getUint32();
	const sampleCount = iterator.getUint32();

	if (sampleSize !== 0) {
		return {
			type: 'stsz-box',
			boxSize: size,
			offset,
			version,
			flags: [...flags],
			sampleCount,
			countType: 'fixed',
			sampleSize,
		};
	}

	const samples: number[] = [];
	for (let i = 0; i < sampleCount; i++) {
		const bytesRemaining = size - (iterator.counter.getOffset() - offset);
		if (bytesRemaining < 4) {
			break;
		}

		samples.push(iterator.getUint32());
	}

	iterator.discard(size - (iterator.counter.getOffset() - offset));

	return {
		type: 'stsz-box',
		boxSize: size,
		offset,
		version,
		flags: [...flags],
		sampleCount,
		countType: 'variable',
		entries: samples,
	};
};
