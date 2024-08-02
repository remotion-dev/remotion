import type {BufferIterator} from '../../../buffer-iterator';

export interface SttsBox {
	type: 'stts-box';
	sampleDistribution: SampleDistribution[];
}

type SampleDistribution = {
	sampleCount: number;
	sampleDelta: number;
};

export const parseStts = ({
	data,
	size,
	fileOffset,
}: {
	data: BufferIterator;
	size: number;
	fileOffset: number;
}): SttsBox => {
	const initialOffset = data.counter.getOffset();
	const initialCounter = initialOffset - fileOffset;

	const version = data.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported STTS version ${version}`);
	}

	// flags, we discard them
	data.discard(3);

	// entry count
	const entryCount = data.getUint32();

	const sampleDistributions: SampleDistribution[] = [];

	// entries
	for (let i = 0; i < entryCount; i++) {
		const sampleCount = data.getUint32();
		const sampleDelta = data.getUint32();

		const sampleDistribution: SampleDistribution = {
			sampleCount,
			sampleDelta,
		};
		sampleDistributions.push(sampleDistribution);
	}

	const bytesUsed = data.counter.getOffset() - initialOffset + initialCounter;

	if (bytesUsed !== size) {
		throw new Error(
			`Expected stts box to be ${size} bytes, but was ${bytesUsed} bytes`,
		);
	}

	return {
		type: 'stts-box',
		sampleDistribution: sampleDistributions,
	};
};
