import type {BufferIterator} from '../../../buffer-iterator';

export interface ColorParameterBox {
	type: 'colr-box';
	primaries: number;
	transfer: number;
	matrixIndex: number;
	fullRangeFlag: boolean;
}

export const parseColorParameterBox = ({
	iterator,
}: {
	iterator: BufferIterator;
}): ColorParameterBox => {
	const byteString = iterator.getByteString(4);
	if (byteString !== 'nclx') {
		throw new Error('Expected nclx');
	}

	const primaries = iterator.getUint16();
	const transfer = iterator.getUint16();
	const matrixIndex = iterator.getUint16();
	iterator.startReadingBits();
	const fullRangeFlag = Boolean(iterator.getBits(1));
	iterator.stopReadingBits();

	return {
		type: 'colr-box',
		fullRangeFlag,
		matrixIndex,
		primaries,
		transfer,
	};
};
