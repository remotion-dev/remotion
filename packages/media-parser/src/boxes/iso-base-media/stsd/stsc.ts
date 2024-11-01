import type {BufferIterator} from '../../../buffer-iterator';
import type {BaseBox} from '../base-type';

type StscEntry = {
	firstChunk: number;
	samplesPerChunk: number;
};

export interface StscBox extends BaseBox {
	type: 'stsc-box';
	version: number;
	flags: number[];
	entryCount: number;
	entries: StscEntry[];
}

export const parseStsc = ({
	iterator,
	offset,
	size,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
}): StscBox => {
	const version = iterator.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported STSD version ${version}`);
	}

	const flags = iterator.getSlice(3);
	const entryCount = iterator.getUint32();

	const entries: StscEntry[] = [];

	for (let i = 0; i < entryCount; i++) {
		const firstChunk = iterator.getUint32();
		const samplesPerChunk = iterator.getUint32();
		const sampleDescriptionIndex = iterator.getUint32();
		if (sampleDescriptionIndex !== 1) {
			throw new Error(
				`Expected sampleDescriptionIndex to be 1, but got ${sampleDescriptionIndex}`,
			);
		}

		entries.push({
			firstChunk,
			samplesPerChunk,
		});
	}

	return {
		type: 'stsc-box',
		boxSize: size,
		offset,
		version,
		flags: [...flags],
		entryCount,
		entries,
	};
};
