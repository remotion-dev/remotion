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
	if (version !== 0 && version !== 1) {
		throw new Error(`Unsupported CTTS version ${version}`);
	}

	const flags = iterator.getSlice(3);
	const entryCount = iterator.getUint32();

	const entries: CttsEntry[] = [];

	for (let i = 0; i < entryCount; i++) {
		const sampleCount = iterator.getUint32();

		// V1 = signed, V0 = unsigned
		// however some files are buggy

		// Let's do the same thing as mp4box
		// https://github.com/gpac/mp4box.js/blob/c6cc468145bc5b031b866446111f29c8b620dbe6/src/parsing/ctts.js#L2
		const sampleOffset = iterator.getInt32();

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
