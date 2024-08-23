import type {BufferIterator} from '../../buffer-iterator';

export interface TrunBox {
	type: 'trun-box';
	version: number;
	sampleCount: number;
	dataOffset: number;
	firstSampleFlags: number;
	samples: TRunSample[];
}

type TRunSample = {
	sampleDuration: number;
	sampleSize: number;
	sampleFlags: number;
	sampleCompositionTimeOffset: number;
};

export const parseTrun = ({
	iterator,
	offset,
	size,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
}): TrunBox => {
	const version = iterator.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported TRUN version ${version}`);
	}

	const flags = iterator.getUint24();
	const sampleCount = iterator.getUint32();

	const dataOffset = flags & 0x01 ? iterator.getInt32() : 0;
	const firstSampleFlags = flags & 0x04 ? iterator.getUint32() : 0;

	const samples: TRunSample[] = [];

	for (let i = 0; i < sampleCount; i++) {
		const sampleDuration = flags & 0x100 ? iterator.getUint32() : 0;
		const sampleSize = flags & 0x200 ? iterator.getUint32() : 0;
		const sampleFlags = flags & 0x400 ? iterator.getUint32() : 0;
		const sampleCompositionTimeOffset =
			flags & 0x800
				? version === 0
					? iterator.getUint32()
					: iterator.getInt32Le()
				: 0;
		samples.push({
			sampleDuration,
			sampleSize,
			sampleFlags,
			sampleCompositionTimeOffset,
		});
	}

	const currentOffset = iterator.counter.getOffset();
	const left = size - (currentOffset - offset);
	if (left !== 0) {
		throw new Error(`Unexpected data left in TRUN box: ${left}`);
	}

	return {
		type: 'trun-box',
		version,
		sampleCount,
		dataOffset,
		firstSampleFlags,
		samples,
	};
};
