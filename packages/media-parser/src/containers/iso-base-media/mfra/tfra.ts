import type {BufferIterator} from '../../../iterator/buffer-iterator';
import type {BaseBox} from '../base-type';

export type TfraEntry = {
	time: number;
	moofOffset: number;
	trafNumber: number;
	trunNumber: number;
	sampleNumber: number;
};

export interface TfraBox extends BaseBox {
	type: 'tfra-box';
	trackId: number;
	entries: TfraEntry[];
}

const readTrafNumber = (
	iterator: BufferIterator,
	lengthSizeOfTrafNum: number,
): number => {
	const uintTypeTrafNum = (lengthSizeOfTrafNum + 1) * 8;
	if (uintTypeTrafNum === 8) {
		return iterator.getUint8();
	}

	if (uintTypeTrafNum === 16) {
		return iterator.getUint16();
	}

	if (uintTypeTrafNum === 32) {
		return iterator.getUint32();
	}

	if (uintTypeTrafNum === 64) {
		return Number(iterator.getUint64());
	}

	throw new Error('Invalid traf number size');
};

const readTrunNumber = (
	iterator: BufferIterator,
	lengthSizeOfTrunNum: number,
): number => {
	const uintTypeTrunNum = (lengthSizeOfTrunNum + 1) * 8;
	if (uintTypeTrunNum === 8) {
		return iterator.getUint8();
	}

	if (uintTypeTrunNum === 16) {
		return iterator.getUint16();
	}

	if (uintTypeTrunNum === 32) {
		return iterator.getUint32();
	}

	if (uintTypeTrunNum === 64) {
		return Number(iterator.getUint64());
	}

	throw new Error('Invalid trun number size');
};

const readSampleNumber = (
	iterator: BufferIterator,
	lengthSizeOfSampleNum: number,
): number => {
	const uintTypeSampleNum = (lengthSizeOfSampleNum + 1) * 8;
	if (uintTypeSampleNum === 8) {
		return iterator.getUint8();
	}

	if (uintTypeSampleNum === 16) {
		return iterator.getUint16();
	}

	if (uintTypeSampleNum === 32) {
		return iterator.getUint32();
	}

	if (uintTypeSampleNum === 64) {
		return Number(iterator.getUint64());
	}

	throw new Error('Invalid sample number size');
};

const readTime = (iterator: BufferIterator, version: number): number => {
	if (version === 1) {
		return Number(iterator.getUint64());
	}

	return iterator.getUint32();
};

const readMoofOffset = (iterator: BufferIterator, version: number): number => {
	if (version === 1) {
		return Number(iterator.getUint64());
	}

	return iterator.getUint32();
};

export const parseTfraBox = ({
	iterator,
	size,
	offset,
}: {
	iterator: BufferIterator;
	size: number;
	offset: number;
}): TfraBox => {
	const box = iterator.startBox(size - 8);
	const version = iterator.getUint8();

	// flags, we discard them
	iterator.discard(3);

	const trackId = iterator.getUint32();
	iterator.getUint24();
	const tmpByte = iterator.getUint8();

	const lengthSizeOfTrafNum = (tmpByte >> 4) & 0x3;
	const lengthSizeOfTrunNum = (tmpByte >> 2) & 0x3;
	const lengthSizeOfSampleNum = tmpByte & 0x3;

	const numberOfEntries = iterator.getUint32();

	const entries: TfraEntry[] = [];

	for (let i = 0; i < numberOfEntries; i++) {
		const time = readTime(iterator, version);
		const moofOffset = readMoofOffset(iterator, version);

		const trafNumber = readTrafNumber(iterator, lengthSizeOfTrafNum);
		const trunNumber = readTrunNumber(iterator, lengthSizeOfTrunNum);
		const sampleNumber = readSampleNumber(iterator, lengthSizeOfSampleNum);

		entries.push({
			time,
			moofOffset,
			trafNumber,
			trunNumber,
			sampleNumber,
		});
	}

	box.expectNoMoreBytes();

	return {
		offset,
		boxSize: size,
		type: 'tfra-box',
		entries,
		trackId,
	};
};
