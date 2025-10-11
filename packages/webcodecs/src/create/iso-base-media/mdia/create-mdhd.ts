import {fromUnixTimestamp} from '../../../from-unix-timestamp';
import {combineUint8Arrays} from '../../matroska/matroska-utils';
import {
	addSize,
	numberTo32BitUIntOrInt,
	stringsToUint8Array,
} from '../primitives';

export const createMdhd = ({
	creationTime,
	modificationTime,
	timescale,
	duration,
}: {
	creationTime: number | null;
	modificationTime: number | null;
	timescale: number;
	duration: number;
}) => {
	return addSize(
		combineUint8Arrays([
			// type
			stringsToUint8Array('mdhd'),
			// version
			new Uint8Array([0]),
			// flags
			new Uint8Array([0, 0, 0]),
			// creation time
			creationTime === null
				? numberTo32BitUIntOrInt(0)
				: numberTo32BitUIntOrInt(fromUnixTimestamp(creationTime)),
			// modification time
			modificationTime === null
				? numberTo32BitUIntOrInt(0)
				: numberTo32BitUIntOrInt(fromUnixTimestamp(modificationTime)),
			// timescale
			numberTo32BitUIntOrInt(timescale),
			// duration
			numberTo32BitUIntOrInt(Math.round((duration / 1000) * timescale)),
			// language: unspecified
			new Uint8Array([0x55, 0xc4]),
			// quality
			new Uint8Array([0, 0]),
		]),
	);
};
