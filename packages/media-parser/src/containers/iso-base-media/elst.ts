import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {BaseBox} from './base-type';

export interface ElstBox extends BaseBox {
	type: 'elst-box';
	version: number;
	flags: number;
	entries: ElstEntry[];
}

export type ElstEntry = {
	editDuration: number;
	mediaTime: number;
	mediaRateInteger: number;
	mediaRateFraction: number;
};

export const parseElst = ({
	iterator,
	size,
	offset,
}: {
	iterator: BufferIterator;
	size: number;
	offset: number;
}): ElstBox => {
	const {discardRest} = iterator.startBox(size - 8);

	const version = iterator.getUint8();
	const flags = iterator.getUint24();
	const entryCount = iterator.getUint32();
	const entries: ElstEntry[] = [];

	for (let i = 0; i < entryCount; i++) {
		const editDuration = Number(
			version === 1 ? iterator.getUint64() : iterator.getUint32(),
		);
		const mediaTime = Number(
			version === 1 ? iterator.getUint64() : iterator.getInt32(),
		);
		const mediaRateInteger = iterator.getUint16();
		const mediaRateFraction = iterator.getUint16();
		entries.push({
			editDuration,
			mediaTime,
			mediaRateInteger,
			mediaRateFraction,
		});
	}

	discardRest();

	const result: ElstBox = {
		type: 'elst-box',
		version,
		flags,
		entries,
		boxSize: size,
		offset,
	};

	return result;
};
