import {combineUint8Arrays} from '../../boxes/webm/make-header';
import {
	addSize,
	numberTo32BitUIntOrInt,
	stringsToUint8Array,
} from './primitives';

export const createBtrt = ({
	maxBitrate,
	avgBitrate,
}: {
	maxBitrate: number;
	avgBitrate: number;
}) => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('btrt'),
			// version
			new Uint8Array([0]),
			// buffer size db
			new Uint8Array([0, 0, 0]),
			// max bitrate
			numberTo32BitUIntOrInt(maxBitrate),
			// avg bitrate
			numberTo32BitUIntOrInt(avgBitrate),
		]),
	);
};
