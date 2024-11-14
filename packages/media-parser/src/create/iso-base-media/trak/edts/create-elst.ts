import {combineUint8Arrays} from '../../../../boxes/webm/make-header';
import {
	addSize,
	numberTo32BitUIntOrInt,
	stringsToUint8Array,
} from '../../primitives';

type Entry = {
	segmentDuration: number;
	mediaTime: number;
};

export const makeEntry = ({mediaTime, segmentDuration}: Entry) => {
	return combineUint8Arrays([
		numberTo32BitUIntOrInt(segmentDuration),
		numberTo32BitUIntOrInt(mediaTime),
		// Hardcode media rate to 1
		new Uint8Array([0, 1, 0, 0]),
	]);
};

export const createElstItem = ({
	segmentDuration,
	mediaTime,
}: {
	segmentDuration: number;
	mediaTime: number;
}) => {
	const entryCount = 1;

	return addSize(
		combineUint8Arrays([
			// name
			stringsToUint8Array('elst'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 0]),
			// entry_count
			numberTo32BitUIntOrInt(entryCount),
			makeEntry({
				segmentDuration,
				mediaTime,
			}),
		]),
	);
};
