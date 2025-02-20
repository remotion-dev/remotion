import type {BufferIterator} from './buffer-iterator';

export const getHvc1CodecString = (data: BufferIterator) => {
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
	const generalTierFlag = (generalProfileSpaceTierFlagAndIdc & 0x20) >> 5;
	const generalProfileIdc = generalProfileSpaceTierFlagAndIdc & 0x1f;

	// general_constraint_indicator_flags(48)
	const generalConstraintIndicator = data.getSlice(6);
	const generalLevelIdc = data.getUint8();

	let profileId = 0;
	for (let i = 0; i < 32; i++) {
		profileId |= generalProfileCompatibility & 1;
		if (i === 31) break;

		profileId <<= 1;
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

	return `${profileSpaceChar}${generalProfileIdc.toString(16)}.${profileId.toString(16)}.${generalTierChar}${generalLevelIdc}${generalConstraintString ? '.' : ''}${generalConstraintString}`;
};
