import type {BufferIterator} from '../../../iterator/buffer-iterator';
import type {BaseBox} from '../base-type';

export interface TrexBox extends BaseBox {
	type: 'trex-box';
	version: number;
	trackId: number;
	defaultSampleDescriptionIndex: number;
	defaultSampleDuration: number;
	defaultSampleSize: number;
	defaultSampleFlags: number;
}

export const parseTrex = ({
	iterator,
	offset,
	size,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
}): TrexBox => {
	const box = iterator.startBox(size - 8);

	const version = iterator.getUint8();

	// Flags, we discard them
	iterator.discard(3);

	const trackId = iterator.getUint32();
	const defaultSampleDescriptionIndex = iterator.getUint32();
	const defaultSampleDuration = iterator.getUint32();
	const defaultSampleSize = iterator.getUint32();
	const defaultSampleFlags = iterator.getUint32();

	box.expectNoMoreBytes();

	return {
		type: 'trex-box',
		boxSize: size,
		offset,
		trackId,
		version,
		defaultSampleDescriptionIndex,
		defaultSampleDuration,
		defaultSampleSize,
		defaultSampleFlags,
	};
};
