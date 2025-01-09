import {fromUnixTimestamp} from '../../from-unix-timestamp';
import {combineUint8Arrays} from '../matroska/matroska-utils';
import {
	addSize,
	floatTo16Point1632Bit,
	floatTo16Point16_16Bit,
	numberTo32BitUIntOrInt,
	serializeMatrix,
	stringsToUint8Array,
} from './primitives';

export const createMvhd = ({
	timescale,
	durationInUnits,
	rate,
	volume,
	nextTrackId,
	matrix,
	creationTime,
	modificationTime,
}: {
	timescale: number;
	durationInUnits: number;
	rate: number;
	volume: number;
	nextTrackId: number;
	matrix: number[];
	creationTime: number | null;
	modificationTime: number | null;
}) => {
	if (matrix.length !== 9) {
		throw new Error('Matrix must be 9 elements long');
	}

	const content = combineUint8Arrays([
		// type
		stringsToUint8Array('mvhd'),
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
		// duration in units, 32bit for version 0
		numberTo32BitUIntOrInt(durationInUnits),
		// rate
		floatTo16Point1632Bit(rate),
		// volume
		floatTo16Point16_16Bit(volume),
		// reserved
		new Uint8Array([0, 0]),
		// reserved
		new Uint8Array([0, 0, 0, 0]),
		// reserved
		new Uint8Array([0, 0, 0, 0]),
		serializeMatrix(matrix),
		// predefined
		combineUint8Arrays(new Array(6).fill(new Uint8Array([0, 0, 0, 0]))),
		// next track id
		numberTo32BitUIntOrInt(nextTrackId),
	]);

	return addSize(content);
};
