import type {BufferIterator} from '../../buffer-iterator';

export interface TfhdBox {
	type: 'tfhd-box';
	version: number;
	trackId: number;
	baseDataOffset: number;
	baseSampleDescriptionIndex: number;
	defaultSampleDuration: number;
	defaultSampleSize: number;
	defaultSampleFlags: number;
}

export const getTfhd = ({
	iterator,
	offset,
	size,
}: {
	iterator: BufferIterator;
	size: number;
	offset: number;
}): TfhdBox => {
	const version = iterator.getUint8();
	const flags = iterator.getUint24();

	const trackId = iterator.getUint32();

	const baseDataOffsetPresent = flags & 0x01;
	const baseDataOffset = baseDataOffsetPresent
		? Number(iterator.getUint64())
		: 0;

	const baseSampleDescriptionIndexPresent = flags & 0x02;
	const baseSampleDescriptionIndex = baseSampleDescriptionIndexPresent
		? iterator.getUint32()
		: 0;

	const defaultSampleDurationPresent = flags & 0x08;
	const defaultSampleDuration = defaultSampleDurationPresent
		? iterator.getUint32()
		: 0;

	const defaultSampleSizePresent = flags & 0x10;
	const defaultSampleSize = defaultSampleSizePresent ? iterator.getUint32() : 0;

	const defaultSampleFlagsPresent = flags & 0x20;
	const defaultSampleFlags = defaultSampleFlagsPresent
		? iterator.getUint32()
		: 0;

	const bytesRemaining = size - (iterator.counter.getOffset() - offset);
	if (bytesRemaining !== 0) {
		throw new Error('expected 0 bytes ' + bytesRemaining);
	}

	return {
		type: 'tfhd-box',
		version,
		trackId,
		baseDataOffset,
		baseSampleDescriptionIndex,
		defaultSampleDuration,
		defaultSampleSize,
		defaultSampleFlags,
	};
};
