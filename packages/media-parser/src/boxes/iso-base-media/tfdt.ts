import type {BufferIterator} from '../../buffer-iterator';

export interface TfdtBox {
	type: 'tfdt-box';
	version: number;
	baseMediaDecodeTime: number;
	offset: number;
}

export const parseTfdt = ({
	iterator,
	size,
	offset,
}: {
	iterator: BufferIterator;
	size: number;
	offset: number;
}): TfdtBox => {
	const version = iterator.getUint8();
	iterator.discard(3);
	// Flags, discard them
	const num =
		version === 0 ? iterator.getUint32() : Number(iterator.getUint64());

	const bytesRemaining = size - (iterator.counter.getOffset() - offset);

	if (bytesRemaining !== 0) {
		throw new Error('expected 0 bytes ' + bytesRemaining);
	}

	return {
		type: 'tfdt-box',
		version,
		baseMediaDecodeTime: num,
		offset,
	};
};
