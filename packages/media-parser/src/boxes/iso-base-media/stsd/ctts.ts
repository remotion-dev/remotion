import type {BufferIterator} from '../../../buffer-iterator';
import type {BaseBox} from '../base-type';

type CttsEntry = {
	sampleCount: number;
	sampleOffset: number;
};

export interface CttsBox extends BaseBox {
	type: 'ctts-box';
	version: number;
	flags: number[];
	entryCount: number;
	entries: CttsEntry[];
}

export const parseCtts = ({
	iterator,
	offset,
	size,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
}): CttsBox => {
	const version = iterator.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported CTTS version ${version}`);
	}

	const flags = iterator.getSlice(3);
	const entryCount = iterator.getUint32();

	const entries: CttsEntry[] = [];

	for (let i = 0; i < entryCount; i++) {
		const sampleCount = iterator.getUint32();
		const sampleOffset = iterator.getUint32();

		entries.push({
			sampleCount,
			sampleOffset,
		});
	}

	return {
		type: 'ctts-box',
		boxSize: size,
		offset,
		version,
		flags: [...flags],
		entryCount,
		entries,
	};
};
