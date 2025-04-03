import {truthy} from '../../truthy';
import {matroskaElements, type SeekHeadSegment} from './segments/all-segments';

export const getByteForSeek = ({
	seekHeadSegment,
	offset,
}: {
	seekHeadSegment: SeekHeadSegment;
	offset: number;
}) => {
	const value = seekHeadSegment.value
		.map((v) => {
			if (v.type !== 'Seek') {
				return null;
			}

			const seekId = v.value.find((_v) => {
				// cues
				return _v.type === 'SeekID' && _v.value === matroskaElements.Cues;
			});
			if (!seekId) {
				return null;
			}

			const seekPosition = v.value.find((_v) => {
				return _v.type === 'SeekPosition';
			});
			if (!seekPosition) {
				return false;
			}

			return seekPosition.value;
		})
		.filter(truthy);
	if (value.length === 0) {
		return null;
	}

	return value[0].value + offset;
};
