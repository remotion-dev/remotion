import type {BufferIterator} from '../../../iterator/buffer-iterator';
import type {BaseBox} from '../base-type';

export interface StscBox extends BaseBox {
	type: 'stsc-box';
	version: number;
	flags: number[];
	entryCount: number;
	// firstChunk -> samplesPerChunk
	entries: Map<number, number>;
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

	const entries: Map<number, number> = new Map();

	for (let i = 0; i < entryCount; i++) {
		const firstChunk = iterator.getUint32();
		const samplesPerChunk = iterator.getUint32();
		const sampleDescriptionIndex = iterator.getUint32();
		if (sampleDescriptionIndex !== 1) {
			throw new Error(
				`Expected sampleDescriptionIndex to be 1, but got ${sampleDescriptionIndex}`,
			);
		}

		entries.set(firstChunk, samplesPerChunk);
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
