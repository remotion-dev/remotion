import type {BufferIterator} from '../../../buffer-iterator';
import type {Descriptor} from './esds-descriptors';
import {parseDescriptors} from './esds-descriptors';

export interface EsdsBox {
	type: 'esds-box';
	version: number;
	tag: number;
	sizeOfInstance: number;
	esId: number;
	descriptors: Descriptor[];
}

export const parseEsds = ({
	data,
	size,
	fileOffset,
}: {
	data: BufferIterator;
	size: number;
	fileOffset: number;
}): EsdsBox => {
	const version = data.getUint8();
	// Flags, we discard them
	data.discard(3);
	const tag = data.getUint8();

	const sizeOfInstance = data.getPaddedFourByteNumber();
	const esId = data.getUint16();

	// disard 1 byte, currently unknown
	data.discard(1);

	const remaining = size - (data.counter.getOffset() - fileOffset);
	const descriptors = parseDescriptors(data, remaining);

	const remainingNow = size - (data.counter.getOffset() - fileOffset);

	data.discard(remainingNow);

	return {
		type: 'esds-box',
		version,
		tag,
		sizeOfInstance,
		esId,
		descriptors,
	};
};
