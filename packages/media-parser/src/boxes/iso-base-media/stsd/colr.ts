import type {BufferIterator} from '../../../buffer-iterator';
import type {IccProfile} from '../parse-icc-profile';
import {parseIccProfile} from '../parse-icc-profile';

type ExtraData =
	| {
			colorType: 'transfer-characteristics';
			primaries: number;
			transfer: number;
			matrixIndex: number;
			fullRangeFlag: boolean;
	  }
	| {
			colorType: 'icc-profile';
			profile: Uint8Array;
			parsed: IccProfile;
	  };

export type ColorParameterBox = {
	type: 'colr-box';
} & ExtraData;

export const parseColorParameterBox = ({
	iterator,
	size,
}: {
	iterator: BufferIterator;
	size: number;
}): ColorParameterBox => {
	const byteString = iterator.getByteString(4, false);

	if (byteString === 'nclx') {
		const primaries = iterator.getUint16();
		const transfer = iterator.getUint16();
		const matrixIndex = iterator.getUint16();
		iterator.startReadingBits();
		const fullRangeFlag = Boolean(iterator.getBits(1));
		iterator.stopReadingBits();

		return {
			type: 'colr-box',
			colorType: 'transfer-characteristics',
			fullRangeFlag,
			matrixIndex,
			primaries,
			transfer,
		};
	}

	if (byteString === 'nclc') {
		const primaries = iterator.getUint16();
		const transfer = iterator.getUint16();
		const matrixIndex = iterator.getUint16();

		return {
			type: 'colr-box',
			colorType: 'transfer-characteristics',
			fullRangeFlag: false,
			matrixIndex,
			primaries,
			transfer,
		};
	}

	if (byteString === 'prof') {
		const profile = iterator.getSlice(size - 12);

		return {
			type: 'colr-box',
			colorType: 'icc-profile',
			profile,
			parsed: parseIccProfile(profile),
		};
	}

	throw new Error('Unexpected box type ' + byteString);
};
