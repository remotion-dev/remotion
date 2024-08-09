import type {BufferIterator} from '../../../buffer-iterator';

export interface AvccBox {
	type: 'avcc-box';
	data: Uint8Array;
	configurationString: string;
}

export const parseAvcc = ({
	data,
	size,
}: {
	data: BufferIterator;
	size: number;
}): AvccBox => {
	const confVersion = data.getUint8();
	if (confVersion !== 1) {
		throw new Error(`Unsupported AVCC version ${confVersion}`);
	}

	const profile = data.getUint8();
	const profileCompatibility = data.getUint8();
	const level = data.getUint8();

	const str = `${profile.toString(16).padStart(2, '0')}${profileCompatibility.toString(16).padStart(2, '0')}${level.toString(16).padStart(2, '0')}`;

	data.counter.decrement(4);

	return {
		type: 'avcc-box',
		data: data.getSlice(size - 8),
		configurationString: str,
	};
};

export interface HvccBox {
	type: 'hvcc-box';
	data: Uint8Array;
	configurationString: string;
}

export const parseHvcc = ({
	data,
	size,
	offset,
}: {
	data: BufferIterator;
	size: number;
	offset: number;
}): HvccBox => {
	const raw = data.getSlice(size - 8);
	data.counter.decrement(size - 8);

	const configurationVersion = data.getUint8();
	if (configurationVersion !== 1) {
		throw new Error(`Unsupported HVCC version ${configurationVersion}`);
	}

	const generalProfileSpaceTierFlagAndIdc = data.getUint8();
	let generalProfileCompatibility = data.getUint32();
	//  unsigned int(2) general_profile_space;
	// 	unsigned int(1) general_tier_flag;
	//	unsigned int(5) general_profile_idc;

	const generalProfileSpace = generalProfileSpaceTierFlagAndIdc >> 6;
	const generalTierFlag = generalProfileSpaceTierFlagAndIdc >> 5;
	const generalProfileIdc = generalProfileSpaceTierFlagAndIdc >> 0;

	// general_constraint_indicator_flags(48)
	const generalConstraintIndicator = data.getSlice(6);
	const generalLevelIdc = data.getUint8();

	let reversedGeneralProfileSpace = 0;
	for (let i = 0; i < 32; i++) {
		reversedGeneralProfileSpace |= generalProfileCompatibility & 1;
		if (i === 31) break;

		reversedGeneralProfileSpace <<= 1;
		generalProfileCompatibility >>= 1;
	}

	const profileSpaceChar =
		generalProfileSpace === 0
			? ''
			: generalProfileSpace === 1
				? 'A'
				: generalProfileSpace === 2
					? 'B'
					: 'C';

	const generalTierChar = generalTierFlag === 0 ? 'L' : 'H';

	let hasByte = false;

	let generalConstraintString = '';
	for (let i = 5; i >= 0; i--) {
		if (generalConstraintIndicator[i] || hasByte) {
			generalConstraintString =
				generalConstraintIndicator[i].toString(16) + generalConstraintString;
			hasByte = true;
		}
	}

	const constraintString = `${profileSpaceChar}${generalProfileIdc.toString(16)}.${reversedGeneralProfileSpace.toString(16)}.${generalTierChar}${generalLevelIdc}.${generalConstraintString}`;

	const remaining = size - (data.counter.getOffset() - offset);
	data.discard(remaining);

	return {
		type: 'hvcc-box',
		data: raw,
		configurationString: constraintString,
	};
};
